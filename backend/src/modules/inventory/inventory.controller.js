const prisma = require('../../config/db');

// ── GET /api/inventory ───────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const { status } = req.query;

    const where = { clinicId: req.user.clinicId };
    if (status) where.status = status;

    const orders = await prisma.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            medicine: {
              select: { name: true, form: true, strength: true }
            }
          }
        }
      }
    });

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/inventory/:id ───────────────────────────
exports.getOne = async (req, res) => {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where:   { id: req.params.id },
      include: {
        items: {
          include: { medicine: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/inventory ──────────────────────────────
exports.create = async (req, res) => {
  try {
    const { supplier, invoiceNo, items, notes } = req.body;

    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum, i) => sum + (parseFloat(i.purchasePrice) * parseInt(i.qty)),
      0
    );

    const order = await prisma.purchaseOrder.create({
      data: {
        clinicId: req.user.clinicId,
        supplier,
        invoiceNo: invoiceNo || null,
        notes:     notes     || null,
        totalAmount,
        items: {
          create: items.map(item => ({
            medicineId:    item.medicineId,
            qty:           parseInt(item.qty),
            purchasePrice: parseFloat(item.purchasePrice),
            total:         parseFloat(item.purchasePrice) * parseInt(item.qty)
          }))
        }
      },
      include: {
        items: {
          include: { medicine: true }
        }
      }
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('Create purchase order error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/inventory/:id/receive ───────────────────
// Marks order as received and adds stock to medicines
exports.receive = async (req, res) => {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where:   { id: req.params.id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    if (order.status === 'RECEIVED') {
      return res.status(400).json({
        success: false,
        message: 'Order already received'
      });
    }

    if (order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot receive a cancelled order'
      });
    }

    // Add stock to each medicine in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Add stock for each item
      for (const item of order.items) {
        await tx.medicine.update({
          where: { id: item.medicineId },
          data:  { stock: { increment: item.qty } }
        });
      }

      // Mark order as received
      return await tx.purchaseOrder.update({
        where: { id: req.params.id },
        data:  { status: 'RECEIVED' },
        include: {
          items: {
            include: { medicine: true }
          }
        }
      });
    });

    res.json({
      success: true,
      message: 'Stock updated successfully. Order marked as received.',
      order:   updated
    });
  } catch (err) {
    console.error('Receive order error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/inventory/:id ────────────────────────
exports.cancel = async (req, res) => {
  try {
    const order = await prisma.purchaseOrder.update({
      where: { id: req.params.id },
      data:  { status: 'CANCELLED' }
    });
    res.json({ success: true, message: 'Purchase order cancelled', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};