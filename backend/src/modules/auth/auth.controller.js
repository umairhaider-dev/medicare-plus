const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../../config/db');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });

// ── POST /api/auth/register ─────────────────────────
// Register clinic + first admin user
exports.register = async (req, res) => {
  try {
    const { name, email, password, clinicName, clinicAddress, clinicPhone } = req.body;

    if (!name || !email || !password || !clinicName) {
      return res.status(400).json({
        success: false,
        message: 'name, email, password and clinicName are required'
      });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const clinic = await prisma.clinic.create({
      data: {
        name:    clinicName,
        address: clinicAddress || '',
        phone:   clinicPhone   || ''
      }
    });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        clinicId: clinic.id,
        name,
        email,
        passwordHash,
        role: 'ADMIN'
      }
    });

    const token = signToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id:       user.id,
        name:     user.name,
        email:    user.email,
        role:     user.role,
        clinicId: user.clinicId
      },
      clinic
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/login ────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({
      where:   { email },
      include: { clinic: true, doctor: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    const token = signToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id:       user.id,
        name:     user.name,
        email:    user.email,
        role:     user.role,
        clinicId: user.clinicId,
        doctorId: user.doctor?.id || null
      },
      clinic: user.clinic,
      doctor: user.doctor
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/auth/me ────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:   { id: req.user.id },
      include: { clinic: true, doctor: true }
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/add-staff ────────────────────────
// Add doctor, pharmacist or receptionist to clinic
exports.addStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      specialization,
      qualification,
      fee
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'name, email, password and role are required'
      });
    }

    const validRoles = ['DOCTOR', 'PHARMACIST', 'RECEPTIONIST'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'role must be DOCTOR, PHARMACIST or RECEPTIONIST'
      });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user record
    const user = await prisma.user.create({
      data: {
        clinicId: req.user.clinicId,
        name,
        email,
        passwordHash,
        role,
        phone: phone || null
      }
    });

    // If doctor — also create Doctor profile automatically
    let doctor = null;
    if (role === 'DOCTOR') {
      doctor = await prisma.doctor.create({
        data: {
          userId:         user.id,
          specialization: specialization || 'General Physician',
          qualification:  qualification  || 'MBBS',
          fee:            parseFloat(fee) || 500
        }
      });
    }

    res.status(201).json({
      success: true,
      message: `${role} added successfully`,
      user: {
        id:       user.id,
        name:     user.name,
        email:    user.email,
        role:     user.role,
        clinicId: user.clinicId
      },
      doctor,
      doctorId: doctor?.id || null
    });
  } catch (err) {
    console.error('Add staff error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/create-doctor ────────────────────
// Create Doctor profile for existing user
exports.createDoctorProfile = async (req, res) => {
  try {
    const { userId, specialization, qualification, fee } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    // Check user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check doctor profile already exists
    const existing = await prisma.doctor.findUnique({ where: { userId } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Doctor profile already exists for this user',
        doctor: existing
      });
    }

    // Update user role to DOCTOR
    await prisma.user.update({
      where: { id: userId },
      data:  { role: 'DOCTOR' }
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId,
        specialization: specialization || 'General Physician',
        qualification:  qualification  || 'MBBS',
        fee:            parseFloat(fee) || 500
      },
      include: { user: true }
    });

    res.status(201).json({
      success: true,
      message: 'Doctor profile created',
      doctor,
      doctorId: doctor.id
    });
  } catch (err) {
    console.error('Create doctor error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/auth/doctors ───────────────────────────
// Get all doctors in this clinic
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        user: { clinicId: req.user.clinicId }
      },
      include: {
        user: {
          select: {
            id:       true,
            name:     true,
            email:    true,
            phone:    true,
            isActive: true
          }
        }
      }
    });

    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};