const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');
require('dotenv').config();

const app = express();

// ── Middleware ──────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static Files ────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── API Routes ──────────────────────────────────────
app.use('/api/auth',          require('./modules/auth/auth.routes'));
app.use('/api/patients',      require('./modules/patients/patients.routes'));
app.use('/api/appointments',  require('./modules/appointments/appointments.routes'));
app.use('/api/prescriptions', require('./modules/prescriptions/prescriptions.routes'));
app.use('/api/lab',           require('./modules/lab/lab.routes'));
app.use('/api/pharmacy',      require('./modules/pharmacy/pharmacy.routes'));
app.use('/api/sales',         require('./modules/pharmacy/sales.routes'));
app.use('/api/inventory',     require('./modules/inventory/inventory.routes'));
app.use('/api/documents',     require('./modules/documents/documents.routes'));
app.use('/api/reminders',     require('./modules/reminders/reminders.routes'));
app.use('/api/reports', require('./modules/reports/reports.routes'));

// ── Health Check ────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:   'ok',
    message:  'MediCare Plus API is running',
    version:  '1.0.0',
    time:     new Date().toISOString(),
    modules: [
      'auth','patients','appointments',
      'prescriptions','lab','pharmacy',
      'sales','inventory','documents','reminders'
    ]
  });
});

// ── 404 Handler ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// ── Global Error Handler ────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Max 10MB'
    });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ── Start Scheduler ─────────────────────────────────
require('./utils/scheduler');

// ── Start Server ────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ MediCare Plus API  → http://localhost:${PORT}`);
  console.log(`📋 Health check       → http://localhost:${PORT}/health`);
  console.log(`📁 Uploads            → http://localhost:${PORT}/uploads`);
});