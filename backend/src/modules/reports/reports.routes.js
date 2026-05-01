const router = require('express').Router();
const { protect } = require('../../middleware/auth');

const {
  getDashboardStats,
  getRevenueReport,
  getDoctorEarnings,
  getDoctorEarningsById,
  getPharmacyReport,
  getPatientReport,
  getLabReport,
  getAppointmentReport,
  getTopMedicines,
  getTopDiagnoses,
  getDailyReport
} = require('./reports.controller');

router.use(protect);

router.get('/dashboard',          getDashboardStats);
router.get('/revenue',            getRevenueReport);
router.get('/doctors',            getDoctorEarnings);
router.get('/doctors/:doctorId',  getDoctorEarningsById);
router.get('/pharmacy',           getPharmacyReport);
router.get('/patients',           getPatientReport);
router.get('/lab',                getLabReport);
router.get('/appointments',       getAppointmentReport);
router.get('/top-medicines',      getTopMedicines);
router.get('/top-diagnoses',      getTopDiagnoses);
router.get('/daily',              getDailyReport);

module.exports = router;