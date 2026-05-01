const prisma = require('../../config/db');
const fs     = require('fs');
const os     = require('os');
const path   = require('path');

// Generate invoice number
const genInvoiceNo = async (clinicId) => {
  const count = await prisma.sale.count({ where: { clinicId } });
  return `INV-${String(count + 1).padStart(5, '0')}`;
};

// ── GET /api/sales ───────────────────────────────────
exports.getAllSales = async (req, res) => {
  try {
    const { patientId, from, to, paymentMode } = req.query;

    const where = { clinicId: req.user.clinicId };
    if (patientId)   where.patientId   = patientId;
    if (paymentMode) where.paymentMode = paymentMode;

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to)   where.createdAt.lte = new Date(to);
    }

    const sales = await prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: {
            firstName:   true,
            lastName:    true,
            patientCode: true
          }
        },
        user:  { select: { name: true } },
        items: {
          include: {
            medicine: { select: { name: true, form: true, strength: true } }
          }
        }
      }
    });

    res.json({ success: true, count: sales.length, sales });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/sales/today ─────────────────────────────
exports.getTodaySales = async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        clinicId:  req.user.clinicId,
        createdAt: { gte: start, lte: end }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: { firstName: true, lastName: true, patientCode: true }
        },
        items: {
          include: {
            medicine: { select: { name: true } }
          }
        }
      }
    });

    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalSales   = sales.length;

    res.json({ success: true, totalSales, totalRevenue, sales });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/sales/stats ─────────────────────────────
exports.getSalesStats = async (req, res) => {
  try {
    const today = new Date();

    // Today
    const todayStart = new Date(today); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(today); todayEnd.setHours(23, 59, 59, 999);

    // This month
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // This year
    const yearStart  = new Date(today.getFullYear(), 0, 1);
    const yearEnd    = new Date(today.getFullYear(), 11, 31, 23, 59, 59);

    const clinicId = req.user.clinicId;

    const [
      todaySales,
      monthSales,
      yearSales,
      totalMedicines,
      lowStockCount
    ] = await Promise.all([
      prisma.sale.aggregate({
        where:   { clinicId, createdAt: { gte: todayStart, lte: todayEnd } },
        _sum:    { total: true },
        _count:  { id: true }
      }),
      prisma.sale.aggregate({
        where:  { clinicId, createdAt: { gte: monthStart, lte: monthEnd } },
        _sum:   { total: true },
        _count: { id: true }
      }),
      prisma.sale.aggregate({
        where:  { clinicId, createdAt: { gte: yearStart, lte: yearEnd } },
        _sum:   { total: true },
        _count: { id: true }
      }),
      prisma.medicine.count({ where: { clinicId } }),
      prisma.medicine.count({ where: { clinicId } })
    ]);

    res.json({
      success: true,
      stats: {
        today: {
          revenue: todaySales._sum.total || 0,
          orders:  todaySales._count.id  || 0
        },
        month: {
          revenue: monthSales._sum.total || 0,
          orders:  monthSales._count.id  || 0
        },
        year: {
          revenue: yearSales._sum.total || 0,
          orders:  yearSales._count.id  || 0
        },
        totalMedicines
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/sales/:id ───────────────────────────────
exports.getSale = async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where:   { id: req.params.id },
      include: {
        patient: true,
        user:    { select: { name: true } },
        items:   {
          include: {
            medicine: true
          }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    res.json({ success: true, sale });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/sales ──────────────────────────────────
exports.createSale = async (req, res) => {
  try {
    const {
      patientId,
      items,
      discount,
      paymentMode,
      notes
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Validate all medicines and check stock
    const medicineIds = items.map(i => i.medicineId);
    const medicines   = await prisma.medicine.findMany({
      where: { id: { in: medicineIds } }
    });

    const medicineMap = {};
    medicines.forEach(m => { medicineMap[m.id] = m; });

    // Check stock for each item
    for (const item of items) {
      const med = medicineMap[item.medicineId];
      if (!med) {
        return res.status(404).json({
          success: false,
          message: `Medicine not found: ${item.medicineId}`
        });
      }
      if (med.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${med.name}. Available: ${med.stock}, Requested: ${item.qty}`
        });
      }
    }

    // Calculate totals
    const saleItems = items.map(item => {
      const med   = medicineMap[item.medicineId];
      const price = item.price || med.salePrice;
      const total = price * item.qty;
      return { ...item, price, total };
    });

    const subtotal      = saleItems.reduce((sum, i) => sum + i.total, 0);
    const discountAmt   = parseFloat(discount) || 0;
    const total         = subtotal - discountAmt;
    const invoiceNo     = await genInvoiceNo(req.user.clinicId);

    // Create sale + deduct stock in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Create the sale
      const newSale = await tx.sale.create({
        data: {
          clinicId:    req.user.clinicId,
          userId:      req.user.id,
          patientId:   patientId || undefined,
          invoiceNo,
          subtotal,
          discount:    discountAmt,
          total,
          paymentMode: paymentMode || 'CASH',
          notes:       notes || null,
          items: {
            create: saleItems.map(item => ({
              medicineId: item.medicineId,
              qty:        item.qty,
              price:      item.price,
              total:      item.total
            }))
          }
        },
        include: {
          patient: {
            select: { firstName: true, lastName: true, patientCode: true }
          },
          user:  { select: { name: true } },
          items: {
            include: { medicine: true }
          }
        }
      });

      // Deduct stock for each medicine
      for (const item of saleItems) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data:  { stock: { decrement: item.qty } }
        });
      }

      return newSale;
    });

    res.status(201).json({ success: true, sale });
  } catch (err) {
    console.error('Create sale error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/sales/:id/invoice ───────────────────────
exports.downloadInvoice = async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where:   { id: req.params.id },
      include: {
        patient: true,
        user:    { select: { name: true } },
        items:   { include: { medicine: true } }
      }
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found' });
    }

    const { generateInvoicePDF } = require('../../utils/pdf');
    const pdfPath = await generateInvoicePDF(sale);

    res.setHeader('Content-Type',        'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Invoice_${sale.invoiceNo}.pdf"`);

    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);
    stream.on('end', () => {
      try { fs.unlinkSync(pdfPath); } catch (_) {}
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};