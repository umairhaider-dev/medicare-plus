const router = require('express').Router();
const { protect } = require('../../middleware/auth');

const {
  getAll,
  getOne,
  create,
  sendNow,
  cancel,
  getStats,
  sendAppointmentReminder,
  sendLabResultReady,
  sendWelcome,
  sendBulk
} = require('./reminders.controller');

router.use(protect);

router.get('/stats',                    getStats);
router.get('/',                         getAll);
router.post('/',                        create);
router.post('/send-now',                sendNow);
router.post('/appointment-reminder',    sendAppointmentReminder);
router.post('/lab-result-ready',        sendLabResultReady);
router.post('/welcome',                 sendWelcome);
router.post('/bulk',                    sendBulk);
router.get('/:id',                      getOne);
router.delete('/:id',                   cancel);

module.exports = router;