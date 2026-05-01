const prisma = require('../../config/db');

// ── GET /api/pharmacy ────────────────────────────────
exports.getAllMedicines = async (req, res) => {
  try {
    const { category, form } = req.query;

    const where = { clinicId: req.user.clinicId };
    if (category) where.category = category;
    if (form)     where.form     = form;

    const medicines = await prisma.medicine.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, count: medicines.length, medicines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/pharmacy/search ─────────────────────────
exports.searchMedicine = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query q is required'
      });
    }

    const medicines = await prisma.medicine.findMany({
      where: {
        clinicId: req.user.clinicId,
        OR: [
          { name:        { contains: q, mode: 'insensitive' } },
          { genericName: { contains: q, mode: 'insensitive' } },
          { category:    { contains: q, mode: 'insensitive' } },
          { batchNo:     { contains: q, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' },
      take: 20
    });

    res.json({ success: true, count: medicines.length, medicines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/pharmacy/low-stock ──────────────────────
exports.getLowStock = async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      where: {
        clinicId: req.user.clinicId
      },
      orderBy: { stock: 'asc' }
    });

    // Filter where stock <= minStock
    const lowStock = medicines.filter(m => m.stock <= m.minStock);

    res.json({ success: true, count: lowStock.length, medicines: lowStock });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/pharmacy/expiring-soon ──────────────────
exports.getExpiringSoon = async (req, res) => {
  try {
    const today    = new Date();
    const in90days = new Date();
    in90days.setDate(today.getDate() + 90);

    const medicines = await prisma.medicine.findMany({
      where: {
        clinicId:   req.user.clinicId,
        expiryDate: {
          gte: today,
          lte: in90days
        }
      },
      orderBy: { expiryDate: 'asc' }
    });

    res.json({ success: true, count: medicines.length, medicines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/pharmacy/:id ────────────────────────────
exports.getMedicine = async (req, res) => {
  try {
    const medicine = await prisma.medicine.findUnique({
      where:   { id: req.params.id },
      include: {
        saleItems: {
          take:    10,
          orderBy: { sale: { createdAt: 'desc' } },
          include: { sale: true }
        }
      }
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({ success: true, medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/pharmacy ───────────────────────────────
exports.addMedicine = async (req, res) => {
  try {
    const {
      name,
      genericName,
      category,
      form,
      strength,
      manufacturer,
      batchNo,
      expiryDate,
      purchasePrice,
      salePrice,
      stock,
      minStock,
      location
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Medicine name is required'
      });
    }

    const medicine = await prisma.medicine.create({
      data: {
        clinicId:     req.user.clinicId,
        name,
        genericName:   genericName   || null,
        category:      category      || null,
        form:          form          || null,
        strength:      strength      || null,
        manufacturer:  manufacturer  || null,
        batchNo:       batchNo       || null,
        expiryDate:    expiryDate    ? new Date(expiryDate) : null,
        purchasePrice: parseFloat(purchasePrice) || 0,
        salePrice:     parseFloat(salePrice)     || 0,
        stock:         parseInt(stock)            || 0,
        minStock:      parseInt(minStock)         || 10,
        location:      location      || null
      }
    });

    res.status(201).json({ success: true, medicine });
  } catch (err) {
    console.error('Add medicine error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/pharmacy/:id ────────────────────────────
exports.updateMedicine = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.expiryDate)    data.expiryDate    = new Date(data.expiryDate);
    if (data.purchasePrice) data.purchasePrice = parseFloat(data.purchasePrice);
    if (data.salePrice)     data.salePrice     = parseFloat(data.salePrice);
    if (data.stock)         data.stock         = parseInt(data.stock);
    if (data.minStock)      data.minStock      = parseInt(data.minStock);

    const medicine = await prisma.medicine.update({
      where: { id: req.params.id },
      data
    });

    res.json({ success: true, medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/pharmacy/:id ─────────────────────────
exports.deleteMedicine = async (req, res) => {
  try {
    await prisma.medicine.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};