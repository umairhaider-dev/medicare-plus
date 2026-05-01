const router  = require('express').Router();
const ctrl    = require('./auth.controller');
const { protect } = require('../../middleware/auth');

router.post('/register',       ctrl.register);
router.post('/login',          ctrl.login);
router.get('/me',              protect, ctrl.getMe);
router.post('/add-staff',      protect, ctrl.addStaff);
router.post('/create-doctor',  protect, ctrl.createDoctorProfile);
router.get('/doctors',         protect, ctrl.getDoctors);

module.exports = router;