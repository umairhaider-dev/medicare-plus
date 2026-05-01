const prisma     = require('../../config/db');
const { sendSMS, sendWhatsApp, sendBoth, templates } = require('../../utils/sms');

// ── GET /api/reminders ───────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { status, type, channel } = req.query;

    const where = {};
    if (status)  where.status  = status;
    if (type)    where.type    = type;
    if (channel) where.channel = channel;

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({ success: true, count: reminders.length, reminders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reminders/stats ─────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [total, sent, pending, failed] = await Promise.all([
      prisma.reminder.count(),
      prisma.reminder.count({ where: { status: 'SENT'    } }),
      prisma.reminder.count({ where: { status: 'PENDING' } }),
      prisma.reminder.count({ where: { status: 'FAILED'  } })
    ]);

    res.json({
      success: true,
      stats: { total, sent, pending, failed }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reminders/:id ───────────────────────────
exports.getOne = async (req, res) => {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: req.params.id }
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    res.json({ success: true, reminder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/reminders ──────────────────────────────
// Schedule a reminder for later
exports.create = async (req, res) => {
  try {
    const {
      patientId,
      type,
      channel,
      message,
      scheduledAt
    } = req.body;

    if (!patientId || !type || !channel || !message || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'patientId, type, channel, message and scheduledAt are required'
      });
    }

    const reminder = await prisma.reminder.create({
      data: {
        patientId,
        type,
        channel,
        message,
        scheduledAt: new Date(scheduledAt),
        status:      'PENDING'
      }
    });

    res.status(201).json({
      success:  true,
      message:  'Reminder scheduled successfully',
      reminder
    });
  } catch (err) {
    console.error('Create reminder error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/reminders/send-now ─────────────────────
// Send a message immediately
exports.sendNow = async (req, res) => {
  try {
    const {
      patientId,
      phone,
      message,
      channel,
      type
    } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'message is required'
      });
    }

    // Get phone from patient if not provided
    let toPhone = phone;
    if (!toPhone && patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId }
      });
      if (!patient || !patient.phone) {
        return res.status(400).json({
          success: false,
          message: 'Patient phone number not found. Provide phone manually.'
        });
      }
      toPhone = patient.phone;
    }

    if (!toPhone) {
      return res.status(400).json({
        success: false,
        message: 'phone or patientId with a phone number is required'
      });
    }

    // Send based on channel
    let result;
    const ch = (channel || 'SMS').toUpperCase();

    if (ch === 'SMS') {
      result = await sendSMS({ to: toPhone, message });
    } else if (ch === 'WHATSAPP') {
      result = await sendWhatsApp({ to: toPhone, message });
    } else if (ch === 'BOTH') {
      result = await sendBoth({ to: toPhone, message });
    } else {
      return res.status(400).json({
        success: false,
        message: 'channel must be SMS, WHATSAPP or BOTH'
      });
    }

    // Save to database
    const reminder = await prisma.reminder.create({
      data: {
        patientId:   patientId || 'manual',
        type:        type      || 'OTHER',
        channel:     ch === 'BOTH' ? 'BOTH' : ch,
        message,
        scheduledAt: new Date(),
        sentAt:      new Date(),
        status:      'SENT'
      }
    });

    res.json({
      success:  true,
      message:  'Message sent successfully',
      result,
      reminder
    });
  } catch (err) {
    console.error('Send now error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/reminders/appointment-reminder ─────────
exports.sendAppointmentReminder = async (req, res) => {
  try {
    const { appointmentId, channel } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId is required'
      });
    }

    // Get appointment with patient and doctor
    const appointment = await prisma.appointment.findUnique({
      where:   { id: appointmentId },
      include: {
        patient: true,
        doctor:  { include: { user: true } }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (!appointment.patient.phone) {
      return res.status(400).json({
        success: false,
        message: 'Patient has no phone number on file'
      });
    }

    const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
    const doctorName  = appointment.doctor.user.name;
    const date        = new Date(appointment.date).toLocaleDateString('en-GB');
    const time        = appointment.time;

    const message = templates.appointmentReminder(
      patientName, doctorName, date, time
    );

    const ch = (channel || 'SMS').toUpperCase();
    let result;

    if (ch === 'SMS') {
      result = await sendSMS({ to: appointment.patient.phone, message });
    } else if (ch === 'WHATSAPP') {
      result = await sendWhatsApp({ to: appointment.patient.phone, message });
    } else {
      result = await sendBoth({ to: appointment.patient.phone, message });
    }

    // Save reminder record
    const reminder = await prisma.reminder.create({
      data: {
        patientId:   appointment.patientId,
        type:        'APPOINTMENT',
        channel:     ch === 'BOTH' ? 'BOTH' : ch,
        message,
        scheduledAt: new Date(),
        sentAt:      new Date(),
        status:      'SENT'
      }
    });

    res.json({
      success:     true,
      message:     `Appointment reminder sent to ${appointment.patient.phone}`,
      patientName,
      result,
      reminder
    });
  } catch (err) {
    console.error('Appointment reminder error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/reminders/lab-result-ready ─────────────
exports.sendLabResultReady = async (req, res) => {
  try {
    const { labOrderId, channel } = req.body;

    if (!labOrderId) {
      return res.status(400).json({
        success: false,
        message: 'labOrderId is required'
      });
    }

    const labOrder = await prisma.labOrder.findUnique({
      where:   { id: labOrderId },
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

    if (!labOrder.patient.phone) {
      return res.status(400).json({
        success: false,
        message: 'Patient has no phone number'
      });
    }

    const patientName = `${labOrder.patient.firstName} ${labOrder.patient.lastName}`;
    const testNames   = labOrder.tests.map(t => t.testName).join(', ');
    const message     = templates.labResultReady(patientName, testNames);

    const ch = (channel || 'SMS').toUpperCase();
    let result;

    if (ch === 'WHATSAPP') {
      result = await sendWhatsApp({ to: labOrder.patient.phone, message });
    } else if (ch === 'BOTH') {
      result = await sendBoth({ to: labOrder.patient.phone, message });
    } else {
      result = await sendSMS({ to: labOrder.patient.phone, message });
    }

    const reminder = await prisma.reminder.create({
      data: {
        patientId:   labOrder.patientId,
        type:        'LAB_RESULT',
        channel:     ch === 'BOTH' ? 'BOTH' : ch,
        message,
        scheduledAt: new Date(),
        sentAt:      new Date(),
        status:      'SENT'
      }
    });

    res.json({
      success: true,
      message: `Lab result notification sent to ${labOrder.patient.phone}`,
      result,
      reminder
    });
  } catch (err) {
    console.error('Lab result reminder error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/reminders/welcome ──────────────────────
exports.sendWelcome = async (req, res) => {
  try {
    const { patientId, channel } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'patientId is required'
      });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (!patient.phone) {
      return res.status(400).json({
        success: false,
        message: 'Patient has no phone number'
      });
    }

    const patientName = `${patient.firstName} ${patient.lastName}`;
    const message     = templates.welcomePatient(patientName, patient.patientCode);

    const ch = (channel || 'SMS').toUpperCase();
    let result;

    if (ch === 'WHATSAPP') {
      result = await sendWhatsApp({ to: patient.phone, message });
    } else if (ch === 'BOTH') {
      result = await sendBoth({ to: patient.phone, message });
    } else {
      result = await sendSMS({ to: patient.phone, message });
    }

    const reminder = await prisma.reminder.create({
      data: {
        patientId,
        type:        'APPOINTMENT',
        channel:     ch === 'BOTH' ? 'BOTH' : ch,
        message,
        scheduledAt: new Date(),
        sentAt:      new Date(),
        status:      'SENT'
      }
    });

    res.json({
      success: true,
      message: `Welcome message sent to ${patient.phone}`,
      result,
      reminder
    });
  } catch (err) {
    console.error('Welcome reminder error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/reminders/bulk ─────────────────────────
// Send same message to multiple patients
exports.sendBulk = async (req, res) => {
  try {
    const { patientIds, message, channel, type } = req.body;

    if (!patientIds || patientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'patientIds array is required'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'message is required'
      });
    }

    if (patientIds.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 50 patients per bulk send'
      });
    }

    // Get all patients
    const patients = await prisma.patient.findMany({
      where: { id: { in: patientIds } }
    });

    const results = {
      sent:    [],
      failed:  [],
      noPhone: []
    };

    // Send to each patient
    for (const patient of patients) {
      if (!patient.phone) {
        results.noPhone.push({
          patientId:   patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`
        });
        continue;
      }

      try {
        const ch = (channel || 'SMS').toUpperCase();
        let result;

        if (ch === 'WHATSAPP') {
          result = await sendWhatsApp({ to: patient.phone, message });
        } else if (ch === 'BOTH') {
          result = await sendBoth({ to: patient.phone, message });
        } else {
          result = await sendSMS({ to: patient.phone, message });
        }

        // Save each reminder
        await prisma.reminder.create({
          data: {
            patientId:   patient.id,
            type:        type || 'APPOINTMENT',
            channel:     ch === 'BOTH' ? 'BOTH' : ch,
            message,
            scheduledAt: new Date(),
            sentAt:      new Date(),
            status:      'SENT'
          }
        });

        results.sent.push({
          patientId:   patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          phone:       patient.phone
        });

      } catch (err) {
        results.failed.push({
          patientId:   patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          error:       err.message
        });
      }
    }

    res.json({
      success: true,
      summary: {
        total:   patients.length,
        sent:    results.sent.length,
        failed:  results.failed.length,
        noPhone: results.noPhone.length
      },
      results
    });
  } catch (err) {
    console.error('Bulk send error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/reminders/:id ────────────────────────
exports.cancel = async (req, res) => {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: req.params.id }
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    if (reminder.status === 'SENT') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an already sent reminder'
      });
    }

    await prisma.reminder.update({
      where: { id: req.params.id },
      data:  { status: 'CANCELLED' }
    });

    res.json({ success: true, message: 'Reminder cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};