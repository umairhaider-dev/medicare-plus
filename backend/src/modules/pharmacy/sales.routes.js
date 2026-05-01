const router = require('express').Router();
const { protect } = require('../../middleware/auth');

const {
  getAllSales,
  getSale,
  createSale,
  getTodaySales,
  getSalesStats,
  downloadInvoice
} = require('./sales.controller');

router.use(protect);

router.get('/stats',      getSalesStats);
router.get('/today',      getTodaySales);
router.get('/',           getAllSales);
router.post('/',          createSale);
router.get('/:id/invoice',downloadInvoice);
router.get('/:id',        getSale);

module.exports = router;