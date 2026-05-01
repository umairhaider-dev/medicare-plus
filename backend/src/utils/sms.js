require('dotenv').config();

// Only initialize Twilio if credentials exist
const hasTwilio = process.env.TWILIO_ACCOUNT_SID &&
                  process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_sid';

let twilioClient = null;

if (hasTwilio) {
  const twilio  = require('twilio');
  twilioClient  = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log('✅ Twilio SMS initialized');
} else {
  console.log('⚠️  Twilio not configured. SMS will be simulated.');
}

// ── Send SMS ─────────────────────────────────────────
exports.sendSMS = async ({ to, message }) => {
  try {
    // Clean phone number
    let phone = to.replace(/[\s\-\(\)]/g, '');
    if (phone.startsWith('0')) {
      phone = '+92' + phone.slice(1); // Pakistan format
    }
    if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }

    if (!hasTwilio) {
      // Simulate SMS in development
      console.log('📱 [SIMULATED SMS]');
      console.log(`   To:      ${phone}`);
      console.log(`   Message: ${message}`);
      return {
        success:   true,
        simulated: true,
        to:        phone,
        message
      };
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to:   phone
    });

    console.log(`✅ SMS sent to ${phone}. SID: ${result.sid}`);
    return { success: true, sid: result.sid, to: phone };

  } catch (err) {
    console.error('SMS error:', err.message);
    return { success: false, error: err.message };
  }
};

// ── Send WhatsApp ─────────────────────────────────────
exports.sendWhatsApp = async ({ to, message }) => {
  try {
    let phone = to.replace(/[\s\-\(\)]/g, '');
    if (phone.startsWith('0')) {
      phone = '+92' + phone.slice(1);
    }
    if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }

    if (!hasTwilio) {
      console.log('💬 [SIMULATED WHATSAPP]');
      console.log(`   To:      ${phone}`);
      console.log(`   Message: ${message}`);
      return {
        success:   true,
        simulated: true,
        to:        phone,
        message
      };
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to:   `whatsapp:${phone}`
    });

    console.log(`✅ WhatsApp sent to ${phone}. SID: ${result.sid}`);
    return { success: true, sid: result.sid, to: phone };

  } catch (err) {
    console.error('WhatsApp error:', err.message);
    return { success: false, error: err.message };
  }
};

// ── Send Both SMS and WhatsApp ────────────────────────
exports.sendBoth = async ({ to, message }) => {
  const [smsResult, waResult] = await Promise.allSettled([
    exports.sendSMS({ to, message }),
    exports.sendWhatsApp({ to, message })
  ]);

  return {
    sms:       smsResult.value  || smsResult.reason,
    whatsapp:  waResult.value   || waResult.reason
  };
};

// ── Message Templates ─────────────────────────────────
exports.templates = {

  appointmentReminder: (patientName, doctorName, date, time) =>
    `Assalam o Alaikum ${patientName}! 👋\n\n` +
    `This is a reminder for your appointment:\n` +
    `📅 Date: ${date}\n` +
    `⏰ Time: ${time}\n` +
    `👨‍⚕️ Doctor: ${doctorName}\n\n` +
    `Please arrive 10 minutes early.\n` +
    `MediCare Plus Clinic 🏥`,

  appointmentConfirmation: (patientName, doctorName, date, time) =>
    `Assalam o Alaikum ${patientName}! ✅\n\n` +
    `Your appointment has been confirmed:\n` +
    `📅 Date: ${date}\n` +
    `⏰ Time: ${time}\n` +
    `👨‍⚕️ Doctor: ${doctorName}\n\n` +
    `MediCare Plus Clinic 🏥`,

  appointmentCancelled: (patientName, date, time) =>
    `Dear ${patientName},\n\n` +
    `Your appointment on ${date} at ${time} has been cancelled.\n\n` +
    `Please call us to reschedule.\n` +
    `MediCare Plus Clinic 🏥`,

  medicationReminder: (patientName, medicineName, frequency) =>
    `💊 Medication Reminder\n\n` +
    `Dear ${patientName},\n` +
    `Please take your ${medicineName} — ${frequency}.\n\n` +
    `Stay healthy! 🌟\n` +
    `MediCare Plus Clinic`,

  followUpReminder: (patientName, doctorName, date) =>
    `Dear ${patientName},\n\n` +
    `Your follow-up visit with Dr. ${doctorName} is due on ${date}.\n\n` +
    `Please book your appointment.\n` +
    `📞 Call us anytime.\n` +
    `MediCare Plus Clinic 🏥`,

  labResultReady: (patientName, testName) =>
    `Dear ${patientName},\n\n` +
    `🧪 Your lab results are ready!\n` +
    `Test: ${testName}\n\n` +
    `Please visit the clinic to collect your report.\n` +
    `MediCare Plus Clinic 🏥`,

  prescriptionReady: (patientName) =>
    `Dear ${patientName},\n\n` +
    `📋 Your prescription is ready for collection.\n\n` +
    `Please visit our pharmacy.\n` +
    `MediCare Plus Clinic 🏥`,

  welcomePatient: (patientName, patientCode) =>
    `Assalam o Alaikum ${patientName}! 🌟\n\n` +
    `Welcome to MediCare Plus!\n` +
    `Your Patient ID: ${patientCode}\n\n` +
    `We are here for your health.\n` +
    `MediCare Plus Clinic 🏥`
};