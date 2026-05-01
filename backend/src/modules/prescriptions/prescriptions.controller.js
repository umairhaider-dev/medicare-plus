const prisma = require('../../config/db');
const fs     = require('fs');

// ── GET /api/prescriptions ──────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;

    const where = {};
    if (patientId) where.patientId = patientId;
    if (doctorId)  where.doctorId  = doctorId;

    const prescriptions = await prisma.prescription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            firstName:   true,
            lastName:    true,
            patientCode: true,
            age:         true,
            gender:      true
          }
        },
        doctor: {
          include: {
            user: { select: { name: true } }
          }
        },
        items: true
      }
    });

    res.json({ success: true, count: prescriptions.length, prescriptions });
  } catch (err) {
    console.error('getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/prescriptions ─────────────────────────
exports.create = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentId,
      diagnosis,
      notes,
      followUpDate,
      items
    } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: 'patientId and doctorId are required'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one medicine item is required'
      });
    }

    // Check if appointmentId already linked to a prescription
    if (appointmentId) {
      const existing = await prisma.prescription.findUnique({
        where: { appointmentId }
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'This appointment already has a prescription',
          existingPrescriptionId: existing.id
        });
      }
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId,
        doctorId,
        userId:        req.user.id,
        appointmentId: appointmentId || undefined,
        diagnosis:     diagnosis     || null,
        notes:         notes         || null,
        followUpDate:  followUpDate  ? new Date(followUpDate) : null,
        items: {
          create: items.map(item => ({
            medicineName: item.medicineName,
            dosage:       item.dosage       || null,
            frequency:    item.frequency    || null,
            duration:     item.duration     || null,
            instructions: item.instructions || null
          }))
        }
      },
      include: {
        patient: true,
        doctor:  { include: { user: true } },
        items:   true
      }
    });

    res.status(201).json({ success: true, prescription });
  } catch (err) {
    console.error('create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/prescriptions/:id ──────────────────────
exports.getOne = async (req, res) => {
  try {
    const prescription = await prisma.prescription.findUnique({
      where:   { id: req.params.id },
      include: {
        patient: true,
        doctor:  { include: { user: true } },
        items:   true
      }
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.json({ success: true, prescription });
  } catch (err) {
    console.error('getOne error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/prescriptions/:id/pdf ─────────────────
exports.downloadPDF = async (req, res) => {
  try {
    const prescription = await prisma.prescription.findUnique({
      where:   { id: req.params.id },
      include: {
        patient: true,
        doctor:  { include: { user: true } },
        items:   true
      }
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // If cloud PDF URL exists redirect to it
    if (prescription.pdfUrl) {
      return res.redirect(prescription.pdfUrl);
    }

    // Generate PDF on the fly
    const { generatePrescriptionPDF } = require('../../utils/pdf');
    const pdfPath = await generatePrescriptionPDF(prescription, null);

    res.setHeader('Content-Type',        'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Rx_${prescription.id}.pdf"`);

    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);
    stream.on('end', () => {
      try { fs.unlinkSync(pdfPath); } catch (_) {}
    });
    stream.on('error', (err) => {
      console.error('Stream error:', err);
    });
  } catch (err) {
    console.error('downloadPDF error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/prescriptions/:id ──────────────────────
exports.update = async (req, res) => {
  try {
    const { items, ...rest } = req.body;

    const prescription = await prisma.prescription.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(items && {
          items: {
            deleteMany: {},
            create: items.map(item => ({
              medicineName: item.medicineName,
              dosage:       item.dosage       || null,
              frequency:    item.frequency    || null,
              duration:     item.duration     || null,
              instructions: item.instructions || null
            }))
          }
        })
      },
      include: {
        patient: true,
        doctor:  { include: { user: true } },
        items:   true
      }
    });

    res.json({ success: true, prescription });
  } catch (err) {
    console.error('update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};