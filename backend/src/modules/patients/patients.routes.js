const router = require('express').Router();
const c = require('./patients.controller');
const { protect } = require('../../middleware/auth');

router.use(protect);
router.get('/',        c.getAll);
router.post('/',       c.create);
router.get('/:id',     c.getOne);
router.put('/:id',     c.update);
router.delete('/:id',  c.remove);
router.get('/:id/history', c.getHistory);

module.exports = router;