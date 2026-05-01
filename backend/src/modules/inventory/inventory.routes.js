const router = require('express').Router();
const { protect } = require('../../middleware/auth');

const {
  getAll,
  getOne,
  create,
  receive,
  cancel
} = require('./inventory.controller');

router.use(protect);

router.get('/',          getAll);
router.post('/',         create);
router.get('/:id',       getOne);
router.put('/:id/receive', receive);
router.delete('/:id',    cancel);

module.exports = router;