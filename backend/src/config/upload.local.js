const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const os     = require('os');

// Create uploads folder if not exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subfolder per clinic
    const clinicDir = path.join(uploadDir, req.user?.clinicId || 'general');
    if (!fs.existsSync(clinicDir)) {
      fs.mkdirSync(clinicDir, { recursive: true });
    }
    cb(null, clinicDir);
  },
  filename: (req, file, cb) => {
    const ext      = path.extname(file.originalname);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
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
    cb(new Error('Only JPG, PNG, WEBP and PDF allowed'), false);
  }
};

exports.uploadDocument = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});