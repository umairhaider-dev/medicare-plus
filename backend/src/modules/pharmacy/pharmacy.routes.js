const router = require('express').Router();
const { protect } = require('../../middleware/auth');

const {
  getAllMedicines,
  getMedicine,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getLowStock,
  getExpiringSoon,
  searchMedicine
} = require('./pharmacy.controller');

router.use(protect);

router.get('/low-stock',      getLowStock);
router.get('/expiring-soon',  getExpiringSoon);
router.get('/search',         searchMedicine);
router.get('/',               getAllMedicines);
router.post('/',              addMedicine);
router.get('/:id',            getMedicine);
router.put('/:id',            updateMedicine);
router.delete('/:id',         deleteMedicine);

module.exports = router;