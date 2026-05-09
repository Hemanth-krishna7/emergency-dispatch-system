import mongoose from 'mongoose';
import Service from '../models/Service.js';
import EmergencyRequest from '../models/EmergencyRequest.js';
import DispatchLog from '../models/DispatchLog.js';

// 📌 Events
const EVENTS = {
  ALLOCATED: 'SERVICE_ALLOCATED',
  FAILED: 'ALLOCATION_FAILED',
  REASSIGN: 'REASSIGNMENT_TRIGGERED',
  UNASSIGNED: 'SERVICE_UNASSIGNED',
};

const RETRY_ERROR = 'SERVICE_TAKEN';

// 🌍 Haversine Formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// 🚨 Allocate nearest available service
export const allocateService = async (
  requestId,
  attempt = 0
) => {
  const MAX_RETRIES = 2;

  const session = await mongoose.startSession();

  try {
    let allocatedService = null;

    await session.withTransaction(
      async () => {
        const request =
          await EmergencyRequest.findById(
            requestId
          ).session(session);

        if (!request) {
          throw new Error('Request not found');
        }

        // ✅ Prevent duplicate allocation
        if (request.status === 'ASSIGNED') {
          allocatedService = await Service.findById(
            request.assignedService
          ).session(session);

          return;
        }

        // 🔒 Request must be classified
        if (request.status !== 'CLASSIFIED') {
          throw new Error(
            'Request must be classified before allocation'
          );
        }

        // 🌍 Validate location
        if (
          !request.location?.coordinates ||
          request.location.coordinates.length !== 2
        ) {
          throw new Error('Invalid location');
        }

        const [reqLng, reqLat] =
          request.location.coordinates;

        // 📍 Validate coordinates
        if (
          typeof reqLat !== 'number' ||
          typeof reqLng !== 'number' ||
          reqLat < -90 ||
          reqLat > 90 ||
          reqLng < -180 ||
          reqLng > 180
        ) {
          throw new Error('Invalid coordinates');
        }

        // 🚒 Validate service type
        const validTypes = [
          'ambulance',
          'fire',
          'police',
        ];

        if (
          !validTypes.includes(request.serviceType)
        ) {
          throw new Error('Invalid service type');
        }

        // 🚒 Fetch available services
        const services = await Service.find({
          type: request.serviceType,
          available: true,
        })
          .select('_id name location')
          .lean()
          .session(session);

        // ❌ No services available
        if (!services.length) {
          await DispatchLog.create(
            [
              {
                requestId,
                event: EVENTS.FAILED,
                metadata: {
                  reason:
                    'No available services',
                },
              },
            ],
            { session }
          );

          return;
        }

        // 🔍 Find nearest service
        let nearestService = null;
        let minDistance = Infinity;

        for (const service of services) {
          if (
            typeof service.location?.lat !==
              'number' ||
            typeof service.location?.lng !==
              'number'
          ) {
            continue;
          }

          const distance = calculateDistance(
            reqLat,
            reqLng,
            service.location.lat,
            service.location.lng
          );

          if (distance < minDistance) {
            minDistance = distance;
            nearestService = service;
          }
        }

        // ❌ No valid services after filtering
        if (!nearestService) {
          await DispatchLog.create(
            [
              {
                requestId,
                event: EVENTS.FAILED,
                metadata: {
                  reason:
                    'No valid services after filtering',
                },
              },
            ],
            { session }
          );

          return;
        }

        // ⚡ Atomic allocation
        const updatedService =
          await Service.findOneAndUpdate(
            {
              _id: nearestService._id,
              available: true,
            },
            {
              available: false,
              currentRequest: requestId,
            },
            {
              new: true,
              session,
            }
          );

        // 🔁 Retry if another transaction already took it
        if (!updatedService) {
          throw new Error(RETRY_ERROR);
        }

        // ✅ Update request
        request.assignedService =
          updatedService._id;

        request.status = 'ASSIGNED';

        request.retryCount = 0;

        await request.save({ session });

        // 🧾 Allocation log
        await DispatchLog.create(
          [
            {
              requestId,
              serviceId: updatedService._id,
              event: EVENTS.ALLOCATED,
              metadata: {
                serviceName:
                  nearestService.name,
                distanceKm: Number(
                  minDistance.toFixed(2)
                ),
              },
            },
          ],
          { session }
        );

        allocatedService = updatedService;
      },
      {
        readPreference: 'primary',
        readConcern: {
          level: 'snapshot',
        },
        writeConcern: {
          w: 'majority',
        },
        maxCommitTimeMS: 5000,
      }
    );

    // ⚠️ Final failure log
    if (
      allocatedService === null &&
      attempt >= MAX_RETRIES
    ) {
      await DispatchLog.create({
        requestId,
        event: EVENTS.FAILED,
        metadata: {
          reason:
            'Allocation failed after retries',
        },
      });
    }

    return allocatedService;
  } catch (error) {
    // 🔁 Retry allocation on contention
    if (error.message === RETRY_ERROR) {
      if (attempt >= MAX_RETRIES) {
        await DispatchLog.create({
          requestId,
          event: EVENTS.FAILED,
          metadata: {
            reason: 'Retries exhausted',
          },
        });

        return null;
      }

      return allocateService(
        requestId,
        attempt + 1
      );
    }

    throw error;
  } finally {
    session.endSession();
  }
};

// 🔁 Reassign service
export const reassignService = async (
  requestId
) => {
  const request =
    await EmergencyRequest.findById(requestId);

  if (!request) {
    throw new Error('Request not found');
  }

  // 🚫 Prevent reassignment after completion
  if (request.status === 'COMPLETED') {
    return null;
  }

  const retryCount = request.retryCount || 0;

  // ❌ Retry limit reached
  if (retryCount >= 3) {
    await DispatchLog.create({
      requestId,
      event: EVENTS.FAILED,
      metadata: {
        reason: 'Max retries reached',
      },
    });

    return null;
  }

  // 🔁 Increment retry count
  request.retryCount = retryCount + 1;

  await request.save();

  // 🧾 Log reassignment trigger
  await DispatchLog.create({
    requestId,
    event: EVENTS.REASSIGN,
    metadata: {
      attempt: request.retryCount,
    },
  });

  // 🧹 Free previous service
  if (request.assignedService) {
    await Service.findOneAndUpdate(
      {
        _id: request.assignedService,
      },
      {
        available: true,
        currentRequest: null,
      }
    );

    await DispatchLog.create({
      requestId,
      serviceId: request.assignedService,
      event: EVENTS.UNASSIGNED,
    });
  }

  // 🔄 Reset request
  request.assignedService = null;
  request.status = 'CLASSIFIED';

  await request.save();

  // 🚨 Reallocate
  return allocateService(requestId);
};