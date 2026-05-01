const prisma = require('../../config/db');

// GET /api/appointments/today
exports.getToday = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        clinicId: req.user.clinicId,
        date: { gte: start, lte: end }
      },
      orderBy: { time: 'asc' },
      include: {
        patient: {
          select: {
            id:          true,
            firstName:   true,
            lastName:    true,
            phone:       true,
            patientCode: true,
            gender:      true,
            age:         true
          }
        },
        doctor: { include: { user: { select: { name: true } } } }
      }
    });

    const grouped = {
      WAITING:   appointments.filter(a => a.status === 'WAITING'),
      IN_ROOM:   appointments.filter(a => a.status === 'IN_ROOM'),
      SCHEDULED: appointments.filter(a => a.status === 'SCHEDULED'),
      COMPLETED: appointments.filter(a => a.status === 'COMPLETED'),
      CANCELLED: appointments.filter(a => a.status === 'CANCELLED')
    };

    res.json({ success: true, total: appointments.length, grouped, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/stats
exports.getStats = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const where = {
      clinicId: req.user.clinicId,
      date: { gte: start, lte: end }
    };

    const [total, waiting, completed, cancelled] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.count({ where: { ...where, status: 'WAITING'   } }),
      prisma.appointment.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { ...where, status: 'CANCELLED' } })
    ]);

    res.json({ success: true, stats: { total, waiting, completed, cancelled } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments
exports.getAll = async (req, res) => {
  try {
    const { date, doctorId, status, patientId } = req.query;

    const where = { clinicId: req.user.clinicId };
    if (status)    where.status    = status;
    if (patientId) where.patientId = patientId;
    if (doctorId)  where.doctorId  = doctorId;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      include: {
        patient: {
          select: {
            id:          true,
            firstName:   true,
            lastName:    true,
            phone:       true,
            patientCode: true
          }
        },
        doctor: { include: { user: { select: { name: true } } } }
      }
    });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/appointments
exports.create = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      date,
      time,
      visitType,
      chiefComplaint,
      fee,
      notes
    } = req.body;

    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'patientId, doctorId, date and time are required'
      });
    }

    // Check doctor slot conflict
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date:   new Date(date),
        time,
        status: { not: 'CANCELLED' }
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Doctor already has an appointment at ${time} on this date`
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clinicId:      req.user.clinicId,
        userId:        req.user.id,
        patientId,
        doctorId,
        date:          new Date(date),
        time,
        visitType:     visitType     || 'OPD',
        chiefComplaint,
        fee:           parseFloat(fee) || 0,
        notes
      },
      include: {
        patient: true,
        doctor:  { include: { user: true } }
      }
    });

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    console.error('Appointment create error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/appointments/:id
exports.getOne = async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where:   { id: req.params.id },
      include: {
        patient:      true,
        doctor:       { include: { user: true } },
        prescription: { include: { items: true } }
      }
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id
exports.update = async (req, res) => {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data:  req.body
    });
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/appointments/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['SCHEDULED','WAITING','IN_ROOM','COMPLETED','CANCELLED','NO_SHOW'];

    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data:  { status }
    });

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/appointments/:id
exports.cancel = async (req, res) => {
  try {
    await prisma.appointment.update({
      where: { id: req.params.id },
      data:  { status: 'CANCELLED' }
    });
    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};