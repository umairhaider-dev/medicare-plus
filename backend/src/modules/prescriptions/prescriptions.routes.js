const router = require('express').Router();
const { protect } = require('../../middleware/auth');

const {
  getAll,
  create,
  getOne,
  downloadPDF,
  update
} = require('./prescriptions.controller');

router.use(protect);

router.get('/',        getAll);
router.post('/',       create);
router.get('/:id/pdf', downloadPDF);
router.get('/:id',     getOne);
router.put('/:id',     update);

module.exports = router;    