const router = require('express').Router();
const { asyncHandler: h } = require('../middleware/errorMiddleware');
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/requestController');
router.post('/', auth, h(c.create));
router.get('/', auth, h(c.getMine));
router.put('/:id', auth, h(c.updateStatus));
module.exports = router;
