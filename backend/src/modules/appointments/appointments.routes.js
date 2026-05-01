const router = require('express').Router();
const c = require('./appointments.controller');
const { protect, restrictTo } = require('../../middleware/auth');

router.use(protect);
router.get('/',           c.getAll);
router.post('/',          c.create);
router.get('/today',      c.getToday);
router.get('/stats',      c.getStats);
router.get('/:id',        c.getOne);
router.put('/:id',        c.update);
router.put('/:id/status', c.updateStatus);
router.delete('/:id',     c.cancel);

module.exports = router;