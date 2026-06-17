import { Router } from 'express';
import requireAuth from '../middleware/auth.middleware.js';
import {
  create,
  list,
  update,
  remove,
} from '../controllers/shortner.controller.js';

const router = Router();

// All short link routes require a valid accessToken cookie.
router.use(requireAuth);

router.post('/', create);
router.get('/', list);
router.patch('/:id', update);
router.delete('/:id', remove);

export default router;
