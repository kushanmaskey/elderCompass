import { Router } from 'express';
import { searchByZipcode, searchByCityState, getHomeById } from '../controllers/homesController.js';

const router = Router();

router.get('/zipcode/:zipcode', searchByZipcode);
router.get('/search', searchByCityState);
router.get('/:id', getHomeById);

export default router;
