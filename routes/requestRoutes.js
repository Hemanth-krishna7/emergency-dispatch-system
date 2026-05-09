import express from 'express';
import { 
  createEmergencyRequest, 
  getAllRequests, 
  getRequestById, 
  reassignRequest 
} from '../controllers/requestController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.route('/')
  .post(createEmergencyRequest)
  .get(getAllRequests);

router.route('/:id')
  .get(getRequestById);

router.route('/:id/reassign')
  .post(reassignRequest);

export default router;
