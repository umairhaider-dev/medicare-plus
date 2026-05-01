const router = require('express').Router();
const { protect } = require('../../middleware/auth');

const {
  getAll,
  create,
  getOne,
  addResults,
  updateTestResult,
  cancel,
  getLabTests,
  downloadReport
} = require('./lab.controller');

router.use(protect);

router.get('/tests',            getLabTests);
router.get('/',                 getAll);
router.post('/',                create);
router.get('/:id/report',       downloadReport);
router.get('/:id',              getOne);
router.put('/:id/results',      addResults);
router.put('/:id/test/:testId', updateTestResult);
router.delete('/:id',           cancel);

module.exports = router;