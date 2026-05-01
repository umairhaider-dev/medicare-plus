const cron   = require('node-cron');
const prisma = require('../config/db');
const { sendSMS, sendWhatsApp, sendBoth, templates } = require('./sms');

console.log('⏰ Scheduler initializing...');

// ── Run every minute — send pending reminders ─────────
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    // Find all pending reminders due now or overdue
    const dueReminders = await prisma.reminder.findMany({
      where: {
        status:      'PENDING',
        scheduledAt: { lte: now }
      },
      take: 20 // Process max 20 at a time
    });

    if (dueReminders.length > 0) {
      console.log(`⏰ Processing ${dueReminders.length} due reminders...`);
    }

    for (const reminder of dueReminders) {
      try {
        // Get patient phone
        const patient = await prisma.patient.findUnique({
          where: { id: reminder.patientId }
        });

        if (!patient || !patient.phone) {
          await prisma.reminder.update({
            where: { id: reminder.id },
            data:  { status: 'FAILED' }
          });
          continue;
        }

        // Send based on channel
        let result;
        if (reminder.channel === 'SMS') {
          result = await sendSMS({
            to:      patient.phone,
            message: reminder.message
          });
        } else if (reminder.channel === 'WHATSAPP') {
          result = await sendWhatsApp({
            to:      patient.phone,
            message: reminder.message
          });
        } else {
          result = await sendBoth({
            to:      patient.phone,
            message: reminder.message
          });
        }

        // Mark as sent
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        });

        console.log(`✅ Reminder sent to ${patient.firstName} ${patient.lastName}`);

      } catch (err) {
        console.error(`❌ Failed to send reminder ${reminder.id}:`, err.message);
        await prisma.reminder.update({
          where: { id: reminder.id },
          data:  { status: 'FAILED' }
        });
      }
    }
  } catch (err) {
    console.error('Scheduler error:', err.message);
  }
});

// ── Run every day at 8 AM — appointment reminders ─────
cron.schedule('0 8 * * *', async () => {
  try {
    console.log('📅 Running daily appointment reminder job...');

    // Get tomorrow's appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        date:   { gte: tomorrow, lte: dayAfter },
        status: 'SCHEDULED'
      },
      include: {
        patient: true,
        doctor:  { include: { user: true } }
      }
    });

    console.log(`📅 Found ${appointments.length} appointments for tomorrow`);

    for (const appt of appointments) {
      if (!appt.patient.phone) continue;

      const patientName = `${appt.patient.firstName} ${appt.patient.lastName}`;
      const doctorName  = appt.doctor.user.name;
      const date        = new Date(appt.date).toLocaleDateString('en-GB');
      const message     = templates.appointmentReminder(
        patientName, doctorName, date, appt.time
      );

      await sendSMS({ to: appt.patient.phone, message });

      // Log reminder
      await prisma.reminder.create({
        data: {
          patientId:   appt.patientId,
          type:        'APPOINTMENT',
          channel:     'SMS',
          message,
          scheduledAt: new Date(),
          sentAt:      new Date(),
          status:      'SENT'
        }
      });

      console.log(`✅ Daily reminder sent to ${patientName}`);
    }
  } catch (err) {
    console.error('Daily reminder error:', err.message);
  }
});

// ── Run every day at 9 AM — follow-up reminders ───────
cron.schedule('0 9 * * *', async () => {
  try {
    console.log('🔄 Running follow-up reminder job...');

    const today    = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Find prescriptions with follow-up date today
    const prescriptions = await prisma.prescription.findMany({
      where: {
        followUpDate: { gte: today, lte: todayEnd }
      },
      include: {
        patient: true,
        doctor:  { include: { user: true } }
      }
    });

    console.log(`🔄 Found ${prescriptions.length} follow-ups due today`);

    for (const rx of prescriptions) {
      if (!rx.patient.phone) continue;

      const patientName = `${rx.patient.firstName} ${rx.patient.lastName}`;
      const doctorName  = rx.doctor.user.name;
      const date        = new Date(rx.followUpDate).toLocaleDateString('en-GB');
      const message     = templates.followUpReminder(patientName, doctorName, date);

      await sendSMS({ to: rx.patient.phone, message });

      await prisma.reminder.create({
        data: {
          patientId:   rx.patientId,
          type:        'FOLLOWUP',
          channel:     'SMS',
          message,
          scheduledAt: new Date(),
          sentAt:      new Date(),
          status:      'SENT'
        }
      });

      console.log(`✅ Follow-up reminder sent to ${patientName}`);
    }
  } catch (err) {
    console.error('Follow-up reminder error:', err.message);
  }
});

// ── Run every day at 10 AM — lab result reminders ─────
cron.schedule('0 10 * * *', async () => {
  try {
    console.log('🧪 Running lab result notification job...');

    // Find completed lab orders from yesterday not yet notified
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const completedOrders = await prisma.labOrder.findMany({
      where: {
        status:    'COMPLETED',
        createdAt: { gte: yesterday, lte: yesterdayEnd }
      },
      include: {
        patient: true,
        tests:   true
      }
    });

    console.log(`🧪 Found ${completedOrders.length} completed lab orders`);

    for (const order of completedOrders) {
      if (!order.patient.phone) continue;

      const patientName = `${order.patient.firstName} ${order.patient.lastName}`;
      const testNames   = order.tests.map(t => t.testName).join(', ');
      const message     = templates.labResultReady(patientName, testNames);

      await sendSMS({ to: order.patient.phone, message });
      console.log(`✅ Lab result notification sent to ${patientName}`);
    }
  } catch (err) {
    console.error('Lab result reminder error:', err.message);
  }
});

console.log('✅ Scheduler started successfully');
console.log('   • Every minute  — pending reminders');
console.log('   • 8:00 AM daily — appointment reminders');
console.log('   • 9:00 AM daily — follow-up reminders');
console.log('   • 10:00 AM daily — lab result notifications');