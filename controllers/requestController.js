import EmergencyRequest from '../models/EmergencyRequest.js';
import { classifyEmergency } from '../services/classificationService.js';
import { determinePriority } from '../services/priorityService.js';
import { allocateService, reassignService } from '../services/allocationService.js';

// @desc    Create new emergency request
// @route   POST /api/requests
export const createEmergencyRequest = async (req, res) => {
  try {
    const { description, location } = req.body;

    if (!description || !location || !location.coordinates) {
      return res.status(400).json({ message: 'Description and location coordinates ([lng, lat]) are required' });
    }

    // 1. Create the request with REQUESTED status
    let request = new EmergencyRequest({
      userId: req.user._id,
      description,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address || ''
      },
      status: 'REQUESTED'
    });

    // 2. Classification
    const classification = classifyEmergency(description);
    request.serviceType = classification.type;

    // 3. Priority
    request.priority = determinePriority(description);
    
    request.status = 'CLASSIFIED';
    await request.save();

    // 4. Allocation Engine
    await allocateService(request._id);

    // Fetch the updated request with populated service
    const updatedRequest = await EmergencyRequest.findById(request._id)
      .populate('assignedService', 'name type location available');
    
    res.status(201).json(updatedRequest);

  } catch (error) {
    console.error('Error creating request:', error.message);
    res.status(500).json({ message: 'Server error creating request', error: error.message });
  }
};

// @desc    Get all requests
// @route   GET /api/requests
export const getAllRequests = async (req, res) => {
  try {
    const requests = await EmergencyRequest.find({})
      .populate('userId', 'name email')
      .populate('assignedService', 'name type available')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error.message);
    res.status(500).json({ message: 'Server error fetching requests', error: error.message });
  }
};

// @desc    Get a single request
// @route   GET /api/requests/:id
export const getRequestById = async (req, res) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedService', 'name type location available');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching request:', error.message);
    res.status(500).json({ message: 'Server error fetching request', error: error.message });
  }
};

// @desc    Reassign request
// @route   POST /api/requests/:id/reassign
export const reassignRequest = async (req, res) => {
  try {
    const request = await EmergencyRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    await reassignService(request._id);

    const updatedRequest = await EmergencyRequest.findById(request._id)
      .populate('assignedService', 'name type location available');
      
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error reassigning request:', error.message);
    res.status(500).json({ message: 'Server error reassigning request', error: error.message });
  }
};
