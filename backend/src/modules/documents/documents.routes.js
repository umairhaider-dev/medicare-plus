const router         = require('express').Router();
const { protect }    = require('../../middleware/auth');
const multer         = require('multer');
const path           = require('path');
const fs             = require('fs');

// Create uploads folder
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer with disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext      = path.extname(file.originalname);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG PNG WEBP PDF allowed'), false);
    }
  }
});

const ctrl = require('./documents.controller');

router.use(protect);

router.get('/',                   ctrl.getAll);
router.get('/type/:type',         ctrl.getByType);
router.get('/patient/:patientId', ctrl.getByPatient);
router.post('/upload',            upload.single('document'), ctrl.upload);
router.post('/upload-multiple',   upload.array('documents', 5), ctrl.uploadMultiple);
router.get('/:id',                ctrl.getOne);
router.put('/:id',                ctrl.update);
router.delete('/:id',             ctrl.remove);

module.exports = router;