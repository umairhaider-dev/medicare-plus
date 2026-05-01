const prisma = require('../../config/db');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');

// ── Common lab tests catalogue ──────────────────────
const LAB_CATALOGUE = [
  { name: 'Complete Blood Count (CBC)',      code: 'CBC',     fee: 400,  normalRange: 'See report' },
  { name: 'Blood Sugar Fasting (BSF)',       code: 'BSF',     fee: 150,  normalRange: '70-100 mg/dL' },
  { name: 'Blood Sugar Random (BSR)',        code: 'BSR',     fee: 150,  normalRange: '<140 mg/dL' },
  { name: 'HbA1c',                           code: 'HBA1C',   fee: 800,  normalRange: '<5.7%' },
  { name: 'Lipid Profile',                   code: 'LIPID',   fee: 900,  normalRange: 'See report' },
  { name: 'Liver Function Test (LFT)',       code: 'LFT',     fee: 1200, normalRange: 'See report' },
  { name: 'Kidney Function Test (KFT)',      code: 'KFT',     fee: 1200, normalRange: 'See report' },
  { name: 'Thyroid Function Test (TFT)',     code: 'TFT',     fee: 1500, normalRange: 'See report' },
  { name: 'Urine Complete Examination (UCE)',code: 'UCE',     fee: 200,  normalRange: 'See report' },
  { name: 'Urine Culture & Sensitivity',    code: 'UCS',     fee: 800,  normalRange: 'No growth' },
  { name: 'Chest X-Ray',                    code: 'CXR',     fee: 800,  normalRange: 'Normal' },
  { name: 'ECG',                            code: 'ECG',     fee: 500,  normalRange: 'Normal sinus rhythm' },
  { name: 'Ultrasound Abdomen',             code: 'USG',     fee: 2000, normalRange: 'Normal' },
  { name: 'Serum Creatinine',               code: 'SCR',     fee: 300,  normalRange: '0.7-1.3 mg/dL' },
  { name: 'Serum Uric Acid',                code: 'SUA',     fee: 300,  normalRange: '3.5-7.2 mg/dL' },
  { name: 'Hepatitis B Surface Antigen',    code: 'HBSAG',   fee: 500,  normalRange: 'Non-reactive' },
  { name: 'Hepatitis C Antibody',           code: 'ANTI-HCV',fee: 500,  normalRange: 'Non-reactive' },
  { name: 'Dengue NS1 Antigen',             code: 'DENGUE',  fee: 1200, normalRange: 'Negative' },
  { name: 'COVID-19 PCR',                   code: 'COVID',   fee: 4500, normalRange: 'Negative' },
  { name: 'Malaria Parasite (MP)',          code: 'MP',      fee: 200,  normalRange: 'Not seen' },
  { name: 'Blood Group & Rh Factor',        code: 'BG',      fee: 200,  normalRange: 'See report' },
  { name: 'Pregnancy Test (Urine)',         code: 'UPT',     fee: 200,  normalRange: 'Negative' },
  { name: 'ESR',                            code: 'ESR',     fee: 150,  normalRange: 'M:<15 F:<20 mm/hr' },
  { name: 'CRP (C-Reactive Protein)',       code: 'CRP',     fee: 600,  normalRange: '<10 mg/L' },
  { name: 'Serum Electrolytes',             code: 'ELEC',    fee: 700,  normalRange: 'See report' },
  { name: 'Iron Studies',                   code: 'IRON',    fee: 900,  normalRange: 'See report' },
  { name: 'Vitamin D',                      code: 'VITD',    fee: 1800, normalRange: '30-100 ng/mL' },
  { name: 'Vitamin B12',                    code: 'B12',     fee: 1500, normalRange: '200-900 pg/mL' },
  { name: 'PSA (Prostate Specific Antigen)',code: 'PSA',     fee: 1200, normalRange: '<4 ng/mL' },
  { name: 'Stool Complete Examination',     code: 'SCE',     fee: 300,  normalRange: 'See report' },
];

// ── GET /api/lab/tests — Return catalogue ───────────
exports.getLabTests = async (req, res) => {
  try {
    res.json({
      success: true,
      count:   LAB_CATALOGUE.length,
      tests:   LAB_CATALOGUE
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/lab ─────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { patientId, status } = req.query;

    const where = { clinicId: req.user.clinicId };
    if (patientId) where.patientId = patientId;
    if (status)    where.status    = status;

    const labOrders = await prisma.labOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            firstName:   true,
            lastName:    true,
            patientCode: true,
            phone:       true,
            age:         true,
            gender:      true
          }
        },
        tests: true
      }
    });

    res.json({ success: true, count: labOrders.length, labOrders });
  } catch (err) {
    console.error('Lab getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/lab — Create lab order ────────────────
exports.create = async (req, res) => {
  try {
    const { patientId, tests, notes } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'patientId is required'
      });
    }

    if (!tests || tests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one test is required'
      });
    }

    // Calculate total fee from all tests
    const totalFee = tests.reduce((sum, t) => sum + (parseFloat(t.fee) || 0), 0);

    const labOrder = await prisma.labOrder.create({
      data: {
        clinicId:  req.user.clinicId,
        patientId,
        orderedBy: req.user.id,
        notes:     notes || null,
        totalFee,
        tests: {
          create: tests.map(t => ({
            testName:    t.testName,
            testCode:    t.testCode    || null,
            fee:         parseFloat(t.fee) || 0,
            normalRange: t.normalRange || null,
            unit:        t.unit        || null,
            status:      'PENDING'
          }))
        }
      },
      include: {
        patient: {
          select: {
            firstName:   true,
            lastName:    true,
            patientCode: true,
            phone:       true,
            age:         true,
            gender:      true
          }
        },
        tests: true
      }
    });

    res.status(201).json({ success: true, labOrder });
  } catch (err) {
    console.error('Lab create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/lab/:id — Get single lab order ──────────
exports.getOne = async (req, res) => {
  try {
    const labOrder = await prisma.labOrder.findUnique({
      where:   { id: req.params.id },
      include: {
        patient: true,
        tests:   true
      }
    });

    if (!labOrder) {
      return res.status(404).json({
        success: false,
        message: 'Lab order not found'
      });
    }

    res.json({ success: true, labOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/lab/:id/results — Enter all results ─────
exports.addResults = async (req, res) => {
  try {
    const { results } = req.body;

    // results = [ { testId, result, unit, normalRange } ]
    if (!results || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'results array is required'
      });
    }

    // Update each test result
    const updates = results.map(r =>
      prisma.labTest.update({
        where: { id: r.testId },
        data: {
          result:      r.result      || null,
          unit:        r.unit        || null,
          normalRange: r.normalRange || null,
          status:      'COMPLETED',
          resultAt:    new Date()
        }
      })
    );

    await Promise.all(updates);

    // Check if all tests are completed
    const labOrder = await prisma.labOrder.findUnique({
      where:   { id: req.params.id },
      include: { tests: true }
    });

    const allDone = labOrder.tests.every(t => t.status === 'COMPLETED');

    // Update lab order status
    const updated = await prisma.labOrder.update({
      where: { id: req.params.id },
      data:  { status: allDone ? 'COMPLETED' : 'PROCESSING' },
      include: {
        patient: true,
        tests:   true
      }
    });

    res.json({
      success:  true,
      message:  allDone ? 'All results entered. Order completed.' : 'Results partially entered.',
      labOrder: updated
    });
  } catch (err) {
    console.error('Add results error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/lab/:id/test/:testId — Update single test
exports.updateTestResult = async (req, res) => {
  try {
    const { result, unit, normalRange, status } = req.body;

    const test = await prisma.labTest.update({
      where: { id: req.params.testId },
      data: {
        result:      result      || null,
        unit:        unit        || null,
        normalRange: normalRange || null,
        status:      status      || 'COMPLETED',
        resultAt:    new Date()
      }
    });

    // Check if all tests in this order are done
    const allTests = await prisma.labTest.findMany({
      where: { labOrderId: req.params.id }
    });

    const allDone = allTests.every(t => t.status === 'COMPLETED');

    await prisma.labOrder.update({
      where: { id: req.params.id },
      data:  { status: allDone ? 'COMPLETED' : 'PROCESSING' }
    });

    res.json({ success: true, test });
  } catch (err) {
    console.error('Update test result error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/lab/:id — Cancel lab order ───────────
exports.cancel = async (req, res) => {
  try {
    const labOrder = await prisma.labOrder.update({
      where: { id: req.params.id },
      data:  { status: 'CANCELLED' }
    });

    // Cancel all tests too
    await prisma.labTest.updateMany({
      where: { labOrderId: req.params.id },
      data:  { status: 'CANCELLED' }
    });

    res.json({ success: true, message: 'Lab order cancelled', labOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ── GET /api/lab/:id/report — Download lab PDF ───────
exports.downloadReport = async (req, res) => {
  try {
    const labOrder = await prisma.labOrder.findUnique({
      where:   { id: req.params.id },
      include: {
        patient: true,
        tests:   true
      }
    });

    if (!labOrder) {
      return res.status(404).json({
        success: false,
        message: 'Lab order not found'
      });
    }

    const { generateLabReportPDF } = require('../../utils/pdf');
    const pdfPath = await generateLabReportPDF(labOrder);

    res.setHeader('Content-Type',        'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Lab_${labOrder.id}.pdf"`);

    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);
    stream.on('end', () => {
      try { fs.unlinkSync(pdfPath); } catch (_) {}
    });
  } catch (err) {
    console.error('Lab report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};