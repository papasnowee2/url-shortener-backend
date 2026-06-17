const { Router } = require('express');
const requireAuth = require('../middleware/auth.middleware');
const {
  create,
  list,
  update,
  remove,
} = require('../controllers/shortner.controller');

const router = Router();

// All short link routes require a valid accessToken cookie.
router.use(requireAuth);

router.post('/', create);
router.get('/', list);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
