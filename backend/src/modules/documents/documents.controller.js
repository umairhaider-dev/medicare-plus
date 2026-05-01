const prisma = require('../../config/db');
const fs     = require('fs');
const path   = require('path');

// ── GET /api/documents ───────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { type, patientId } = req.query;

    const where = {
      patient: { clinicId: req.user.clinicId }
    };

    if (type)      where.type      = type.toUpperCase();
    if (patientId) where.patientId = patientId;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      include: {
        patient: {
          select: {
            firstName:   true,
            lastName:    true,
            patientCode: true
          }
        }
      }
    });

    res.json({ success: true, count: documents.length, documents });
  } catch (err) {
    console.error('getAll error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/documents/patient/:patientId ────────────
exports.getByPatient = async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where:   { patientId: req.params.patientId },
      orderBy: { uploadedAt: 'desc' }
    });

    const grouped = {
      XRAY:         documents.filter(d => d.type === 'XRAY'),
      LAB_REPORT:   documents.filter(d => d.type === 'LAB_REPORT'),
      PRESCRIPTION: documents.filter(d => d.type === 'PRESCRIPTION'),
      DISCHARGE:    documents.filter(d => d.type === 'DISCHARGE'),
      CONSENT:      documents.filter(d => d.type === 'CONSENT'),
      OTHER:        documents.filter(d => d.type === 'OTHER')
    };

    res.json({
      success:   true,
      count:     documents.length,
      grouped,
      documents
    });
  } catch (err) {
    console.error('getByPatient error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/documents/type/:type ────────────────────
exports.getByType = async (req, res) => {
  try {
    const validTypes = [
      'XRAY','LAB_REPORT','PRESCRIPTION',
      'DISCHARGE','CONSENT','OTHER'
    ];

    const type = req.params.type.toUpperCase();

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Use: ${validTypes.join(', ')}`
      });
    }

    const documents = await prisma.document.findMany({
      where: {
        type,
        patient: { clinicId: req.user.clinicId }
      },
      orderBy: { uploadedAt: 'desc' },
      include: {
        patient: {
          select: {
            firstName:   true,
            lastName:    true,
            patientCode: true
          }
        }
      }
    });

    res.json({ success: true, count: documents.length, documents });
  } catch (err) {
    console.error('getByType error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/documents/:id ───────────────────────────
exports.getOne = async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where:   { id: req.params.id },
      include: {
        patient: {
          select: {
            firstName:   true,
            lastName:    true,
            patientCode: true,
            phone:       true
          }
        }
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({ success: true, document });
  } catch (err) {
    console.error('getOne error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/documents/upload (single) ──────────────
exports.upload = async (req, res) => {
  try {
    console.log('=== UPLOAD DEBUG ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('===================');

    // Check file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file received. Make sure field name is "document" and type is File in Postman'
      });
    }

    // Get fields from body
    const patientId = req.body.patientId;
    const type      = req.body.type;
    const title     = req.body.title;
    const notes     = req.body.notes;

    // Validate patientId
    if (!patientId || patientId.trim() === '') {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'patientId field is required in form-data'
      });
    }

    // Validate type
    const validTypes = [
      'XRAY','LAB_REPORT','PRESCRIPTION',
      'DISCHARGE','CONSENT','OTHER'
    ];

    if (!type || !validTypes.includes(type.toUpperCase())) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `type is required. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Verify patient exists in this clinic
    const patient = await prisma.patient.findFirst({
      where: {
        id:       patientId.trim(),
        clinicId: req.user.clinicId
      }
    });

    if (!patient) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Patient not found. Check the patientId is correct.'
      });
    }

    // Build file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Save to database
    const document = await prisma.document.create({
      data: {
        patientId: patientId.trim(),
        title:     title || `${type.toUpperCase()} — ${new Date().toLocaleDateString('en-GB')}`,
        type:      type.toUpperCase(),
        fileUrl,
        fileSize:  req.file.size || null,
        notes:     notes || null
      }
    });

    res.status(201).json({
      success:  true,
      message:  'Document uploaded successfully',
      document,
      fileUrl
    });
  } catch (err) {
    console.error('Upload error:', err);
    // Clean up file if db save failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/documents/upload-multiple ──────────────
exports.uploadMultiple = async (req, res) => {
  try {
    console.log('=== MULTI UPLOAD DEBUG ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files?.length);
    console.log('==========================');

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files received. Field name must be "documents"'
      });
    }

    const patientId = req.body.patientId;
    const type      = req.body.type      || 'OTHER';
    const title     = req.body.title;
    const notes     = req.body.notes;

    if (!patientId || patientId.trim() === '') {
      req.files.forEach(f => fs.unlinkSync(f.path));
      return res.status(400).json({
        success: false,
        message: 'patientId is required'
      });
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id:       patientId.trim(),
        clinicId: req.user.clinicId
      }
    });

    if (!patient) {
      req.files.forEach(f => fs.unlinkSync(f.path));
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const documents = await Promise.all(
      req.files.map(async (file, i) => {
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
        return await prisma.document.create({
          data: {
            patientId: patientId.trim(),
            title:     title || `${type.toUpperCase()} ${i + 1} — ${new Date().toLocaleDateString('en-GB')}`,
            type:      type.toUpperCase(),
            fileUrl,
            fileSize:  file.size || null,
            notes:     notes || null
          }
        });
      })
    );

    res.status(201).json({
      success:   true,
      message:   `${documents.length} documents uploaded`,
      documents
    });
  } catch (err) {
    console.error('Multi upload error:', err);
    if (req.files) {
      req.files.forEach(f => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/documents/:id ───────────────────────────
exports.update = async (req, res) => {
  try {
    const { title, notes, type } = req.body;

    const document = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(notes && { notes }),
        ...(type  && { type: type.toUpperCase() })
      }
    });

    res.json({ success: true, document });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/documents/:id ────────────────────────
exports.remove = async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete local file
    try {
      const filename = document.fileUrl.split('/uploads/')[1];
      if (filename) {
        const filePath = path.join(process.cwd(), 'uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('File deleted:', filePath);
        }
      }
    } catch (fileErr) {
      console.error('File delete error:', fileErr.message);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};