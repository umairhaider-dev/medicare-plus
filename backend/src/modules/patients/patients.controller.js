const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate patient code like P-001
const genCode = async (clinicId) => {
  const count = await prisma.patient.count({ where: { clinicId } });
  return `P-${String(count + 1).padStart(3, '0')}`;
};

exports.getAll = async (req, res) => {
  try {
    const { search, status } = req.query;
    const patients = await prisma.patient.findMany({
      where: {
        clinicId: req.user.clinicId,
        isActive: status === 'inactive' ? false : true,
        OR: search ? [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName:  { contains: search, mode: 'insensitive' } },
          { phone:     { contains: search } },
          { cnic:      { contains: search } },
          { patientCode:{ contains: search } }
        ] : undefined
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: patients.length, patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const code = await genCode(req.user.clinicId);
    const patient = await prisma.patient.create({
      data: { ...req.body, clinicId: req.user.clinicId, patientCode: code }
    });
    res.status(201).json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        vitals:       { orderBy: { recordedAt: 'desc' }, take: 5 },
        appointments: { orderBy: { date: 'desc' }, take: 10, include: { doctor: { include: { user: true } } } },
        prescriptions:{ orderBy: { createdAt: 'desc' }, take: 5 },
        labOrders:    { orderBy: { createdAt: 'desc' }, take: 5, include: { tests: true } },
        documents:    { orderBy: { uploadedAt: 'desc' } }
      }
    });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const patient = await prisma.patient.update({
      where: { id: req.params.id }, data: req.body
    });
    res.json({ success: true, patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.patient.update({
      where: { id: req.params.id }, data: { isActive: false }
    });
    res.json({ success: true, message: 'Patient deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const [appointments, prescriptions, labs, documents, vitals] = await Promise.all([
      prisma.appointment.findMany({ where: { patientId: req.params.id }, orderBy: { date: 'desc' }, include: { doctor: { include: { user: true } } } }),
      prisma.prescription.findMany({ where: { patientId: req.params.id }, orderBy: { createdAt: 'desc' }, include: { items: true, doctor: { include: { user: true } } } }),
      prisma.labOrder.findMany({ where: { patientId: req.params.id }, orderBy: { createdAt: 'desc' }, include: { tests: true } }),
      prisma.document.findMany({ where: { patientId: req.params.id }, orderBy: { uploadedAt: 'desc' } }),
      prisma.vital.findMany({ where: { patientId: req.params.id }, orderBy: { recordedAt: 'desc' }, take: 20 })
    ]);
    res.json({ success: true, history: { appointments, prescriptions, labs, documents, vitals } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};