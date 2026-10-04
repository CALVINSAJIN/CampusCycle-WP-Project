const router = require('express').Router();
const { asyncHandler: h } = require('../middleware/errorMiddleware');
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/authController');
router.post('/register', h(c.register));
router.post('/login', h(c.login));
router.get('/me', auth, h(c.me));
module.exports = router;
