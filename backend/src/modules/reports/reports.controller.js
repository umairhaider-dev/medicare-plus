const prisma = require('../../config/db');

// ── Helper — get date range ──────────────────────────
const getDateRange = (from, to, defaultDays = 30) => {
  const end   = to   ? new Date(to)   : new Date();
  const start = from ? new Date(from) : new Date();

  if (!from) {
    start.setDate(start.getDate() - defaultDays);
  }

  start.setHours(0,  0,  0,  0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// ── GET /api/reports/dashboard ───────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;

    const today      = new Date();
    const todayStart = new Date(today); todayStart.setHours(0,  0,  0,  0);
    const todayEnd   = new Date(today); todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd   = new Date(today.getFullYear(), today.getMonth()+1, 0, 23, 59, 59);

    const [
      totalPatients,
      newPatientsToday,
      newPatientsMonth,
      appointmentsToday,
      appointmentsMonth,
      todaySales,
      monthSales,
      pendingLabOrders,
      lowStockCount,
      totalMedicines,
      totalDoctors,
      prescriptionsMonth
    ] = await Promise.all([
      prisma.patient.count({
        where: { clinicId, isActive: true }
      }),
      prisma.patient.count({
        where: { clinicId, createdAt: { gte: todayStart, lte: todayEnd } }
      }),
      prisma.patient.count({
        where: { clinicId, createdAt: { gte: monthStart, lte: monthEnd } }
      }),
      prisma.appointment.count({
        where: { clinicId, date: { gte: todayStart, lte: todayEnd } }
      }),
      prisma.appointment.count({
        where: { clinicId, date: { gte: monthStart, lte: monthEnd } }
      }),
      prisma.sale.aggregate({
        where:  { clinicId, createdAt: { gte: todayStart, lte: todayEnd } },
        _sum:   { total: true },
        _count: { id: true }
      }),
      prisma.sale.aggregate({
        where:  { clinicId, createdAt: { gte: monthStart, lte: monthEnd } },
        _sum:   { total: true },
        _count: { id: true }
      }),
      prisma.labOrder.count({
        where: { clinicId, status: 'PENDING' }
      }),
      prisma.medicine.count({
        where: { clinicId }
      }),
      prisma.medicine.count({
        where: { clinicId }
      }),
      prisma.doctor.count({
        where: { user: { clinicId } }
      }),
      prisma.prescription.count({
        where: {
          patient:   { clinicId },
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      })
    ]);

    // Low stock — medicines where stock <= minStock
    const medicines  = await prisma.medicine.findMany({
      where: { clinicId },
      select: { stock: true, minStock: true }
    });
    const lowStock = medicines.filter(m => m.stock <= m.minStock).length;

    res.json({
      success: true,
      dashboard: {
        patients: {
          total:      totalPatients,
          newToday:   newPatientsToday,
          newMonth:   newPatientsMonth
        },
        appointments: {
          today: appointmentsToday,
          month: appointmentsMonth
        },
        revenue: {
          today: todaySales._sum.total  || 0,
          month: monthSales._sum.total  || 0,
          todaySalesCount: todaySales._count.id || 0,
          monthSalesCount: monthSales._count.id || 0
        },
        pharmacy: {
          totalMedicines,
          lowStock,
          pendingLabOrders
        },
        staff: {
          totalDoctors
        },
        prescriptions: {
          month: prescriptionsMonth
        }
      }
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/revenue ─────────────────────────
exports.getRevenueReport = async (req, res) => {
  try {
    const clinicId      = req.user.clinicId;
    const { from, to }  = req.query;
    const { start, end} = getDateRange(from, to, 30);

    // Total revenue from sales
    const salesRevenue = await prisma.sale.aggregate({
      where:  { clinicId, createdAt: { gte: start, lte: end } },
      _sum:   { total: true, discount: true },
      _count: { id: true }
    });

    // Revenue from appointments (consultation fees)
    const appointmentRevenue = await prisma.appointment.aggregate({
      where:  {
        clinicId,
        date:   { gte: start, lte: end },
        status: 'COMPLETED'
      },
      _sum:   { fee: true },
      _count: { id: true }
    });

    // Revenue from lab orders
    const labRevenue = await prisma.labOrder.aggregate({
      where:  {
        clinicId,
        status:    'COMPLETED',
        createdAt: { gte: start, lte: end }
      },
      _sum:   { totalFee: true },
      _count: { id: true }
    });

    // Daily breakdown
    const dailySales = await prisma.sale.groupBy({
      by:      ['createdAt'],
      where:   { clinicId, createdAt: { gte: start, lte: end } },
      _sum:    { total: true },
      _count:  { id: true },
      orderBy: { createdAt: 'asc' }
    });

    // Payment mode breakdown
    const paymentModes = await prisma.sale.groupBy({
      by:    ['paymentMode'],
      where: { clinicId, createdAt: { gte: start, lte: end } },
      _sum:  { total: true },
      _count:{ id: true }
    });

    const pharmacyTotal    = salesRevenue._sum.total       || 0;
    const consultationTotal= appointmentRevenue._sum.fee   || 0;
    const labTotal         = labRevenue._sum.totalFee      || 0;
    const grandTotal       = pharmacyTotal + consultationTotal + labTotal;

    res.json({
      success: true,
      period:  { from: start, to: end },
      revenue: {
        grandTotal,
        breakdown: {
          pharmacy:     pharmacyTotal,
          consultation: consultationTotal,
          lab:          labTotal
        },
        sales: {
          count:    salesRevenue._count.id    || 0,
          total:    pharmacyTotal,
          discount: salesRevenue._sum.discount || 0
        },
        appointments: {
          count: appointmentRevenue._count.id || 0,
          total: consultationTotal
        },
        lab: {
          count: labRevenue._count.id || 0,
          total: labTotal
        }
      },
      paymentModes,
      dailySales
    });
  } catch (err) {
    console.error('Revenue report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/doctors ─────────────────────────
exports.getDoctorEarnings = async (req, res) => {
  try {
    const clinicId     = req.user.clinicId;
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to, 30);

    // Get all doctors in clinic
    const doctors = await prisma.doctor.findMany({
      where:   { user: { clinicId } },
      include: { user: { select: { name: true, email: true, phone: true } } }
    });

    // For each doctor get their stats
    const doctorStats = await Promise.all(
      doctors.map(async (doctor) => {
        const [
          appointments,
          completedAppointments,
          prescriptions,
          revenue
        ] = await Promise.all([
          prisma.appointment.count({
            where: {
              doctorId: doctor.id,
              date:     { gte: start, lte: end }
            }
          }),
          prisma.appointment.count({
            where: {
              doctorId: doctor.id,
              status:   'COMPLETED',
              date:     { gte: start, lte: end }
            }
          }),
          prisma.prescription.count({
            where: {
              doctorId:  doctor.id,
              createdAt: { gte: start, lte: end }
            }
          }),
          prisma.appointment.aggregate({
            where: {
              doctorId: doctor.id,
              status:   'COMPLETED',
              date:     { gte: start, lte: end }
            },
            _sum: { fee: true }
          })
        ]);

        const totalRevenue     = revenue._sum.fee || 0;
        const doctorShare      = totalRevenue * 0.7; // 70% to doctor
        const clinicShare      = totalRevenue * 0.3; // 30% to clinic

        return {
          doctor: {
            id:             doctor.id,
            name:           doctor.user.name,
            email:          doctor.user.email,
            phone:          doctor.user.phone,
            specialization: doctor.specialization,
            qualification:  doctor.qualification,
            consultationFee:doctor.fee
          },
          stats: {
            totalAppointments:    appointments,
            completedAppointments,
            cancelledOrMissed:    appointments - completedAppointments,
            prescriptionsWritten: prescriptions,
            revenue: {
              total:       totalRevenue,
              doctorShare, // 70%
              clinicShare  // 30%
            }
          }
        };
      })
    );

    // Sort by revenue descending
    doctorStats.sort(
      (a, b) => b.stats.revenue.total - a.stats.revenue.total
    );

    const totalClinicRevenue = doctorStats.reduce(
      (sum, d) => sum + d.stats.revenue.total, 0
    );

    res.json({
      success: true,
      period:  { from: start, to: end },
      summary: {
        totalDoctors:  doctors.length,
        totalRevenue:  totalClinicRevenue,
        totalDoctorShare: totalClinicRevenue * 0.7,
        totalClinicShare: totalClinicRevenue * 0.3
      },
      doctors: doctorStats
    });
  } catch (err) {
    console.error('Doctor earnings error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/doctors/:doctorId ───────────────
exports.getDoctorEarningsById = async (req, res) => {
  try {
    const { doctorId }   = req.params;
    const { from, to }   = req.query;
    const { start, end } = getDateRange(from, to, 30);

    const doctor = await prisma.doctor.findUnique({
      where:   { id: doctorId },
      include: { user: { select: { name: true, email: true, phone: true } } }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get all completed appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: { gte: start, lte: end }
      },
      include: {
        patient: {
          select: {
            firstName:   true,
            lastName:    true,
            patientCode: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    // Get all prescriptions
    const prescriptions = await prisma.prescription.findMany({
      where: {
        doctorId,
        createdAt: { gte: start, lte: end }
      },
      include: {
        patient: {
          select: {
            firstName:   true,
            lastName:    true,
            patientCode: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Status breakdown
    const statusBreakdown = {
      SCHEDULED: appointments.filter(a => a.status === 'SCHEDULED').length,
      COMPLETED: appointments.filter(a => a.status === 'COMPLETED').length,
      CANCELLED: appointments.filter(a => a.status === 'CANCELLED').length,
      NO_SHOW:   appointments.filter(a => a.status === 'NO_SHOW').length,
      WAITING:   appointments.filter(a => a.status === 'WAITING').length,
      IN_ROOM:   appointments.filter(a => a.status === 'IN_ROOM').length
    };

    const totalRevenue = appointments
      .filter(a => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + (a.fee || 0), 0);

    res.json({
      success: true,
      period:  { from: start, to: end },
      doctor: {
        id:             doctor.id,
        name:           doctor.user.name,
        specialization: doctor.specialization,
        qualification:  doctor.qualification,
        consultationFee:doctor.fee
      },
      stats: {
        totalAppointments:    appointments.length,
        completedAppointments:statusBreakdown.COMPLETED,
        statusBreakdown,
        prescriptionsWritten: prescriptions.length,
        revenue: {
          total:       totalRevenue,
          doctorShare: totalRevenue * 0.7,
          clinicShare: totalRevenue * 0.3
        }
      },
      appointments,
      prescriptions
    });
  } catch (err) {
    console.error('Doctor by ID error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/pharmacy ────────────────────────
exports.getPharmacyReport = async (req, res) => {
  try {
    const clinicId     = req.user.clinicId;
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to, 30);

    const [
      totalSales,
      salesByPayment,
      topMedicines,
      lowStock,
      expiringSoon,
      purchaseOrders
    ] = await Promise.all([
      prisma.sale.aggregate({
        where:  { clinicId, createdAt: { gte: start, lte: end } },
        _sum:   { total: true, discount: true, subtotal: true },
        _count: { id: true }
      }),
      prisma.sale.groupBy({
        by:    ['paymentMode'],
        where: { clinicId, createdAt: { gte: start, lte: end } },
        _sum:  { total: true },
        _count:{ id: true }
      }),
      prisma.saleItem.groupBy({
        by:      ['medicineId'],
        where:   {
          sale: {
            clinicId,
            createdAt: { gte: start, lte: end }
          }
        },
        _sum:    { qty: true, total: true },
        _count:  { id: true },
        orderBy: { _sum: { total: 'desc' } },
        take:    10
      }),
      prisma.medicine.findMany({
        where:   { clinicId },
        orderBy: { stock: 'asc' },
        take:    20
      }),
      prisma.medicine.findMany({
        where: {
          clinicId,
          expiryDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { expiryDate: 'asc' }
      }),
      prisma.purchaseOrder.aggregate({
        where:  { clinicId, createdAt: { gte: start, lte: end } },
        _sum:   { totalAmount: true },
        _count: { id: true }
      })
    ]);

    // Filter actual low stock
    const actualLowStock = lowStock.filter(m => m.stock <= m.minStock);

    // Get medicine names for top medicines
    const medicineIds = topMedicines.map(t => t.medicineId);
    const medicineDetails = await prisma.medicine.findMany({
      where:  { id: { in: medicineIds } },
      select: { id: true, name: true, form: true, strength: true }
    });

    const medicineMap = {};
    medicineDetails.forEach(m => { medicineMap[m.id] = m; });

    const topMedicinesWithNames = topMedicines.map(t => ({
      medicine:  medicineMap[t.medicineId],
      qtySold:   t._sum.qty,
      revenue:   t._sum.total,
      salesCount:t._count.id
    }));

    const profit = (totalSales._sum.total || 0) -
                   (purchaseOrders._sum.totalAmount || 0);

    res.json({
      success: true,
      period:  { from: start, to: end },
      summary: {
        totalSales:      totalSales._count.id    || 0,
        totalRevenue:    totalSales._sum.total   || 0,
        totalDiscount:   totalSales._sum.discount|| 0,
        purchaseCost:    purchaseOrders._sum.totalAmount || 0,
        estimatedProfit: profit,
        lowStockCount:   actualLowStock.length,
        expiringSoonCount:expiringSoon.length
      },
      salesByPayment,
      topMedicines:   topMedicinesWithNames,
      lowStock:       actualLowStock,
      expiringSoon,
      purchases: {
        count: purchaseOrders._count.id       || 0,
        total: purchaseOrders._sum.totalAmount|| 0
      }
    });
  } catch (err) {
    console.error('Pharmacy report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/patients ────────────────────────
exports.getPatientReport = async (req, res) => {
  try {
    const clinicId     = req.user.clinicId;
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to, 30);

    const [
      totalPatients,
      newPatients,
      byGender,
      byBloodGroup,
      recentPatients
    ] = await Promise.all([
      prisma.patient.count({
        where: { clinicId, isActive: true }
      }),
      prisma.patient.count({
        where: { clinicId, createdAt: { gte: start, lte: end } }
      }),
      prisma.patient.groupBy({
        by:    ['gender'],
        where: { clinicId, isActive: true },
        _count:{ id: true }
      }),
      prisma.patient.groupBy({
        by:    ['bloodGroup'],
        where: { clinicId, isActive: true, bloodGroup: { not: null } },
        _count:{ id: true },
        orderBy:{ _count: { id: 'desc' } }
      }),
      prisma.patient.findMany({
        where:   { clinicId, createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: 'desc' },
        take:    20,
        select: {
          id:          true,
          patientCode: true,
          firstName:   true,
          lastName:    true,
          age:         true,
          gender:      true,
          phone:       true,
          createdAt:   true
        }
      })
    ]);

    res.json({
      success: true,
      period:  { from: start, to: end },
      summary: {
        totalPatients,
        newPatients,
        returningPatients: totalPatients - newPatients
      },
      byGender,
      byBloodGroup,
      recentPatients
    });
  } catch (err) {
    console.error('Patient report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/lab ─────────────────────────────
exports.getLabReport = async (req, res) => {
  try {
    const clinicId     = req.user.clinicId;
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to, 30);

    const [
      totalOrders,
      byStatus,
      revenue,
      topTests
    ] = await Promise.all([
      prisma.labOrder.count({
        where: { clinicId, createdAt: { gte: start, lte: end } }
      }),
      prisma.labOrder.groupBy({
        by:    ['status'],
        where: { clinicId, createdAt: { gte: start, lte: end } },
        _count:{ id: true }
      }),
      prisma.labOrder.aggregate({
        where: {
          clinicId,
          status:    'COMPLETED',
          createdAt: { gte: start, lte: end }
        },
        _sum:  { totalFee: true },
        _count:{ id: true }
      }),
      prisma.labTest.groupBy({
        by:      ['testName'],
        where:   {
          labOrder: {
            clinicId,
            createdAt: { gte: start, lte: end }
          }
        },
        _count:  { id: true },
        _sum:    { fee: true },
        orderBy: { _count: { id: 'desc' } },
        take:    10
      })
    ]);

    res.json({
      success: true,
      period:  { from: start, to: end },
      summary: {
        totalOrders,
        completedOrders: revenue._count.id  || 0,
        totalRevenue:    revenue._sum.totalFee || 0
      },
      byStatus,
      topTests
    });
  } catch (err) {
    console.error('Lab report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/appointments ───────────────────
exports.getAppointmentReport = async (req, res) => {
  try {
    const clinicId     = req.user.clinicId;
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to, 30);

    const [
      total,
      byStatus,
      byVisitType,
      byDoctor,
      revenue
    ] = await Promise.all([
      prisma.appointment.count({
        where: { clinicId, date: { gte: start, lte: end } }
      }),
      prisma.appointment.groupBy({
        by:    ['status'],
        where: { clinicId, date: { gte: start, lte: end } },
        _count:{ id: true }
      }),
      prisma.appointment.groupBy({
        by:    ['visitType'],
        where: { clinicId, date: { gte: start, lte: end } },
        _count:{ id: true }
      }),
      prisma.appointment.groupBy({
        by:      ['doctorId'],
        where:   { clinicId, date: { gte: start, lte: end } },
        _count:  { id: true },
        _sum:    { fee: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      prisma.appointment.aggregate({
        where: {
          clinicId,
          status: 'COMPLETED',
          date:   { gte: start, lte: end }
        },
        _sum:  { fee: true },
        _count:{ id: true }
      })
    ]);

    // Get doctor names
    const doctorIds = byDoctor.map(d => d.doctorId);
    const doctors   = await prisma.doctor.findMany({
      where:   { id: { in: doctorIds } },
      include: { user: { select: { name: true } } }
    });

    const doctorMap = {};
    doctors.forEach(d => { doctorMap[d.id] = d.user.name; });

    const byDoctorWithNames = byDoctor.map(d => ({
      doctorId:   d.doctorId,
      doctorName: doctorMap[d.doctorId] || 'Unknown',
      count:      d._count.id,
      revenue:    d._sum.fee || 0
    }));

    res.json({
      success: true,
      period:  { from: start, to: end },
      summary: {
        total,
        completed:      revenue._count.id  || 0,
        totalRevenue:   revenue._sum.fee   || 0,
        completionRate: total > 0
          ? ((revenue._count.id / total) * 100).toFixed(1) + '%'
          : '0%'
      },
      byStatus,
      byVisitType,
      byDoctor: byDoctorWithNames
    });
  } catch (err) {
    console.error('Appointment report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/top-medicines ───────────────────
exports.getTopMedicines = async (req, res) => {
  try {
    const clinicId     = req.user.clinicId;
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to, 30);

    const topItems = await prisma.saleItem.groupBy({
      by:      ['medicineId'],
      where:   {
        sale: {
          clinicId,
          createdAt: { gte: start, lte: end }
        }
      },
      _sum:    { qty: true, total: true },
      _count:  { id: true },
      orderBy: { _sum: { total: 'desc' } },
      take:    20
    });

    const medicineIds = topItems.map(t => t.medicineId);
    const medicines   = await prisma.medicine.findMany({
      where:  { id: { in: medicineIds } },
      select: {
        id:          true,
        name:        true,
        genericName: true,
        form:        true,
        strength:    true,
        salePrice:   true,
        stock:       true
      }
    });

    const medicineMap = {};
    medicines.forEach(m => { medicineMap[m.id] = m; });

    const result = topItems.map((item, index) => ({
      rank:      index + 1,
      medicine:  medicineMap[item.medicineId],
      qtySold:   item._sum.qty   || 0,
      revenue:   item._sum.total || 0,
      salesCount:item._count.id  || 0
    }));

    res.json({
      success: true,
      period:  { from: start, to: end },
      count:   result.length,
      topMedicines: result
    });
  } catch (err) {
    console.error('Top medicines error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/top-diagnoses ───────────────────
exports.getTopDiagnoses = async (req, res) => {
  try {
    const clinicId     = req.user.clinicId;
    const { from, to } = req.query;
    const { start, end } = getDateRange(from, to, 30);

    const prescriptions = await prisma.prescription.findMany({
      where: {
        patient:   { clinicId },
        diagnosis: { not: null },
        createdAt: { gte: start, lte: end }
      },
      select: { diagnosis: true }
    });

    // Count diagnoses manually
    const diagnosisCount = {};
    prescriptions.forEach(p => {
      if (p.diagnosis) {
        const diag = p.diagnosis.trim();
        diagnosisCount[diag] = (diagnosisCount[diag] || 0) + 1;
      }
    });

    // Sort by count
    const sorted = Object.entries(diagnosisCount)
      .map(([diagnosis, count]) => ({ diagnosis, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    res.json({
      success: true,
      period:  { from: start, to: end },
      count:   sorted.length,
      topDiagnoses: sorted
    });
  } catch (err) {
    console.error('Top diagnoses error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reports/daily ───────────────────────────
exports.getDailyReport = async (req, res) => {
  try {
    const clinicId = req.user.clinicId;
    const date     = req.query.date || new Date().toISOString().split('T')[0];

    const start = new Date(date); start.setHours(0,  0,  0,  0);
    const end   = new Date(date); end.setHours(23, 59, 59, 999);

    const [
      appointments,
      sales,
      newPatients,
      labOrders,
      prescriptions
    ] = await Promise.all([
      prisma.appointment.findMany({
        where:   { clinicId, date: { gte: start, lte: end } },
        include: {
          patient: { select: { firstName: true, lastName: true, patientCode: true } },
          doctor:  { include: { user: { select: { name: true } } } }
        },
        orderBy: { time: 'asc' }
      }),
      prisma.sale.findMany({
        where:   { clinicId, createdAt: { gte: start, lte: end } },
        include: {
          items: {
            include: { medicine: { select: { name: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.patient.findMany({
        where:   { clinicId, createdAt: { gte: start, lte: end } },
        select: {
          patientCode: true,
          firstName:   true,
          lastName:    true,
          phone:       true,
          createdAt:   true
        }
      }),
      prisma.labOrder.count({
        where: { clinicId, createdAt: { gte: start, lte: end } }
      }),
      prisma.prescription.count({
        where: {
          patient:   { clinicId },
          createdAt: { gte: start, lte: end }
        }
      })
    ]);

    const totalSalesRevenue = sales.reduce(
      (sum, s) => sum + s.total, 0
    );
    const consultationRevenue = appointments
      .filter(a => a.status === 'COMPLETED')
      .reduce((sum, a) => sum + (a.fee || 0), 0);

    res.json({
      success: true,
      date,
      summary: {
        totalAppointments:  appointments.length,
        completedVisits:    appointments.filter(a => a.status === 'COMPLETED').length,
        newPatients:        newPatients.length,
        pharmacySales:      sales.length,
        labOrders,
        prescriptions,
        revenue: {
          pharmacy:     totalSalesRevenue,
          consultation: consultationRevenue,
          total:        totalSalesRevenue + consultationRevenue
        }
      },
      appointments,
      sales,
      newPatients
    });
  } catch (err) {
    console.error('Daily report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};