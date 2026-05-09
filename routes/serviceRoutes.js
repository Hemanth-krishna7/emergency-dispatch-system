import express from 'express';
import Service from '../models/Service.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply protect middleware
router.use(protect);

// @desc    Create new service
// @route   POST /api/services
router.post('/', async (req, res) => {
  try {
    const { name, type, location } = req.body;
    
    if (!name || !type || !location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return res.status(400).json({ message: 'Please provide valid name, type, and location (lat, lng)' });
    }

    const service = await Service.create({
      name,
      type,
      location,
      available: true
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error.message);
    res.status(500).json({ message: 'Server error creating service', error: error.message });
  }
});

// @desc    Get all services
// @route   GET /api/services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error.message);
    res.status(500).json({ message: 'Server error fetching services', error: error.message });
  }
});

export default router;
