const PDFDocument = require('pdfkit');
const fs          = require('fs');
const path        = require('path');
const os          = require('os');

exports.generatePrescriptionPDF = (prescription, signatureBase64 = null) => {
  return new Promise((resolve, reject) => {
    try {
      const { patient, doctor, items, diagnosis, notes, followUpDate, createdAt, id } = prescription;

      // Use OS temp directory (works on Windows and Linux)
      const fileName = `rx_${id}_${Date.now()}.pdf`;
      const filePath = path.join(os.tmpdir(), fileName);

      const doc    = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // ── HEADER ──────────────────────────────────
      doc.rect(0, 0, doc.page.width, 90).fill('#0c1a2e');

      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(20)
         .text('MediCare Plus', 50, 25);

      doc.fillColor('#5eead4')
         .font('Helvetica')
         .fontSize(9)
         .text('Clinic & Pharmacy Management System', 50, 50);

      doc.fillColor('#94a3b8')
         .fontSize(8)
         .text('Tel: 0300-0000000  |  Lahore, Punjab, Pakistan', 50, 65);

      // Rx number top right
      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(`Rx: ${id.slice(-8).toUpperCase()}`, 400, 25, { width: 150, align: 'right' });

      doc.fillColor('#94a3b8')
         .font('Helvetica')
         .fontSize(8)
         .text(
           `Date: ${new Date(createdAt).toLocaleDateString('en-GB')}`,
           400, 40, { width: 150, align: 'right' }
         );

      // ── PATIENT & DOCTOR INFO ────────────────────
      doc.rect(50, 105, doc.page.width - 100, 65)
         .fillAndStroke('#f8fafc', '#e2e8f0');

      // Patient side
      doc.fillColor('#64748b').font('Helvetica').fontSize(8).text('PATIENT', 65, 112);
      doc.fillColor('#0c1a2e').font('Helvetica-Bold').fontSize(13)
         .text(`${patient.firstName} ${patient.lastName}`, 65, 123);
      doc.fillColor('#64748b').font('Helvetica').fontSize(9)
         .text(
           `${patient.patientCode}  |  ${patient.age || '--'}y  |  ${patient.gender}`,
           65, 141
         );
      if (patient.phone) {
        doc.text(`Phone: ${patient.phone}`, 65, 154);
      }

      // Doctor side
      doc.fillColor('#64748b').fontSize(8).text('DOCTOR', 340, 112);
      doc.fillColor('#0c1a2e').font('Helvetica-Bold').fontSize(12)
         .text(`Dr. ${doctor.user.name}`, 340, 123);
      doc.fillColor('#64748b').font('Helvetica').fontSize(9)
         .text(doctor.specialization || 'General Physician', 340, 141)
         .text(doctor.qualification  || 'MBBS', 340, 154);

      // ── DIAGNOSIS ───────────────────────────────
      let currentY = 185;
      if (diagnosis) {
        doc.rect(50, currentY, doc.page.width - 100, 28).fill('#f0fdfa');
        doc.fillColor('#0f766e').font('Helvetica-Bold').fontSize(8)
           .text('DIAGNOSIS:', 65, currentY + 9);
        doc.fillColor('#0c1a2e').font('Helvetica').fontSize(10)
           .text(diagnosis, 150, currentY + 9);
        currentY += 40;
      }

      // ── Rx SYMBOL ───────────────────────────────
      doc.fillColor('#0d9488').font('Helvetica-Bold').fontSize(32)
         .text('Rx', 50, currentY);
      currentY += 44;

      // ── MEDICINES TABLE ──────────────────────────
      // Table header
      doc.rect(50, currentY, doc.page.width - 100, 20).fill('#0c1a2e');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
      doc.text('#',            62,  currentY + 6);
      doc.text('Medicine',     80,  currentY + 6);
      doc.text('Dosage',      250,  currentY + 6);
      doc.text('Frequency',   310,  currentY + 6);
      doc.text('Duration',    385,  currentY + 6);
      doc.text('Instructions',450,  currentY + 6);

      currentY += 20;

      // Table rows
      items.forEach((item, i) => {
        const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(50, currentY, doc.page.width - 100, 22).fill(bg);

        doc.fillColor('#64748b').font('Helvetica').fontSize(8)
           .text(String(i + 1), 62, currentY + 7);

        doc.fillColor('#0c1a2e').font('Helvetica-Bold').fontSize(9)
           .text(item.medicineName || '', 80, currentY + 7, { width: 165 });

        doc.fillColor('#334155').font('Helvetica').fontSize(8)
           .text(item.dosage       || '-', 250, currentY + 7, { width: 55  })
           .text(item.frequency    || '-', 310, currentY + 7, { width: 70  })
           .text(item.duration     || '-', 385, currentY + 7, { width: 60  })
           .text(item.instructions || '-', 450, currentY + 7, { width: 90  });

        currentY += 22;
      });

      // Table border
      doc.rect(50, currentY - (items.length * 22) - 20, doc.page.width - 100,
               (items.length * 22) + 20).stroke('#e2e8f0');

      currentY += 16;

      // ── NOTES ───────────────────────────────────
      if (notes) {
        doc.rect(50, currentY, doc.page.width - 100, 36)
           .fillAndStroke('#fffbeb', '#fde68a');
        doc.fillColor('#92400e').font('Helvetica-Bold').fontSize(8)
           .text('NOTES:', 65, currentY + 8);
        doc.fillColor('#451a03').font('Helvetica').fontSize(9)
           .text(notes, 120, currentY + 8, { width: 400 });
        currentY += 48;
      }

      // ── FOLLOW UP ───────────────────────────────
      if (followUpDate) {
        doc.fillColor('#0d9488').font('Helvetica-Bold').fontSize(10)
           .text(
             `Follow-up Date: ${new Date(followUpDate).toLocaleDateString('en-GB')}`,
             50, currentY + 10
           );
        currentY += 30;
      }

      // ── SIGNATURE BOX ───────────────────────────
      const sigY = Math.max(currentY + 20, 660);

      doc.rect(350, sigY, 195, 55).fillAndStroke('#f8fafc', '#e2e8f0');

      if (signatureBase64) {
        try {
          const sigData   = signatureBase64.replace(/^data:image\/\w+;base64,/, '');
          const sigBuffer = Buffer.from(sigData, 'base64');
          doc.image(sigBuffer, 355, sigY + 4, { width: 185, height: 47 });
        } catch (_) {
          // Skip invalid signature image
        }
      }

      doc.fillColor('#64748b').font('Helvetica').fontSize(8)
         .text(`Dr. ${doctor.user.name}`,              350, sigY + 60)
         .text(doctor.specialization || 'Physician',   350, sigY + 72)
         .text('Signature & Stamp',                    350, sigY + 84,
               { width: 195, align: 'center' });

      // ── FOOTER ──────────────────────────────────
      const footerY = doc.page.height - 40;
      doc.rect(0, footerY, doc.page.width, 40).fill('#0c1a2e');
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(7)
         .text(
           'This prescription is valid for 30 days from issue date.',
           50, footerY + 8,
           { align: 'center', width: doc.page.width - 100 }
         );
      doc.fillColor('#5eead4').fontSize(7)
         .text(
           'MediCare Plus | Digital Health System',
           50, footerY + 22,
           { align: 'center', width: doc.page.width - 100 }
         );

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error',  reject);

    } catch (err) {
      reject(err);
    }
  });
};
// ── LAB REPORT PDF ──────────────────────────────────
exports.generateLabReportPDF = (labOrder) => {
  return new Promise((resolve, reject) => {
    try {
      const { patient, tests, createdAt, id, notes } = labOrder;

      const fileName = `lab_${id}_${Date.now()}.pdf`;
      const filePath = path.join(os.tmpdir(), fileName);

      const doc    = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ── HEADER ────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 90).fill('#0c1a2e');

      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(20)
         .text('MediCare Plus', 50, 25);

      doc.fillColor('#5eead4')
         .font('Helvetica')
         .fontSize(9)
         .text('Laboratory Report', 50, 50);

      doc.fillColor('#94a3b8')
         .fontSize(8)
         .text('Lahore, Punjab, Pakistan', 50, 65);

      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(9)
         .text(`Lab Order: ${id.slice(-8).toUpperCase()}`, 380, 25, { width: 165, align: 'right' });

      doc.fillColor('#94a3b8')
         .font('Helvetica')
         .fontSize(8)
         .text(
           `Date: ${new Date(createdAt).toLocaleDateString('en-GB')}`,
           380, 42, { width: 165, align: 'right' }
         );

      // ── PATIENT INFO ──────────────────────────────
      doc.rect(50, 105, doc.page.width - 100, 55)
         .fillAndStroke('#f8fafc', '#e2e8f0');

      doc.fillColor('#64748b').font('Helvetica').fontSize(8).text('PATIENT', 65, 112);
      doc.fillColor('#0c1a2e').font('Helvetica-Bold').fontSize(13)
         .text(`${patient.firstName} ${patient.lastName}`, 65, 123);
      doc.fillColor('#64748b').font('Helvetica').fontSize(9)
         .text(
           `${patient.patientCode}  |  ${patient.age || '--'}y  |  ${patient.gender}`,
           65, 141
         );
      if (patient.phone) {
        doc.text(`Phone: ${patient.phone}`, 65, 153);
      }

      // ── RESULTS TABLE ─────────────────────────────
      let currentY = 178;

      // Table header
      doc.rect(50, currentY, doc.page.width - 100, 22).fill('#0c1a2e');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
      doc.text('Test Name',    62,  currentY + 7);
      doc.text('Code',        230,  currentY + 7);
      doc.text('Result',      275,  currentY + 7);
      doc.text('Unit',        355,  currentY + 7);
      doc.text('Normal Range',405,  currentY + 7);
      doc.text('Status',      510,  currentY + 7);
      currentY += 22;

      // Test rows
      tests.forEach((test, i) => {
        const rowHeight = 24;
        const bg        = i % 2 === 0 ? '#f8fafc' : '#ffffff';

        doc.rect(50, currentY, doc.page.width - 100, rowHeight).fill(bg);

        // Highlight abnormal results
        const isAbnormal = test.result &&
          test.status === 'COMPLETED' &&
          test.normalRange &&
          test.result.toString().includes('*');

        doc.fillColor(isAbnormal ? '#991b1b' : '#0c1a2e')
           .font(isAbnormal ? 'Helvetica-Bold' : 'Helvetica')
           .fontSize(9)
           .text(test.testName || '', 62, currentY + 7, { width: 163 });

        doc.fillColor('#64748b').font('Helvetica').fontSize(8)
           .text(test.testCode    || '-', 230, currentY + 7, { width: 40  })
           .text(test.result      || '-', 275, currentY + 7, { width: 75  })
           .text(test.unit        || '-', 355, currentY + 7, { width: 45  })
           .text(test.normalRange || '-', 405, currentY + 7, { width: 100 });

        // Status badge color
        const statusColor =
          test.status === 'COMPLETED'  ? '#15803d' :
          test.status === 'PROCESSING' ? '#92400e' :
          test.status === 'CANCELLED'  ? '#991b1b' : '#1d4ed8';

        doc.fillColor(statusColor)
           .font('Helvetica-Bold')
           .fontSize(8)
           .text(test.status || 'PENDING', 510, currentY + 7, { width: 60 });

        currentY += rowHeight;
      });

      // Table border
      doc.rect(50, 178, doc.page.width - 100, currentY - 178)
         .stroke('#e2e8f0');

      currentY += 16;

      // ── NOTES ─────────────────────────────────────
      if (notes) {
        doc.rect(50, currentY, doc.page.width - 100, 36)
           .fillAndStroke('#fffbeb', '#fde68a');
        doc.fillColor('#92400e').font('Helvetica-Bold').fontSize(8)
           .text('NOTES:', 65, currentY + 8);
        doc.fillColor('#451a03').font('Helvetica').fontSize(9)
           .text(notes, 120, currentY + 8, { width: 400 });
        currentY += 50;
      }

      // ── SUMMARY BOX ───────────────────────────────
      currentY += 10;
      const completed = tests.filter(t => t.status === 'COMPLETED').length;
      const pending   = tests.filter(t => t.status === 'PENDING').length;
      const total     = tests.length;
      const totalFee  = tests.reduce((s, t) => s + (t.fee || 0), 0);

      doc.rect(50, currentY, doc.page.width - 100, 50)
         .fillAndStroke('#f0fdfa', '#99f6e4');

      doc.fillColor('#0f766e').font('Helvetica-Bold').fontSize(9)
         .text(`Total Tests: ${total}`, 70, currentY + 10)
         .text(`Completed: ${completed}`, 200, currentY + 10)
         .text(`Pending: ${pending}`, 330, currentY + 10)
         .text(`Total Fee: Rs ${totalFee.toLocaleString()}`, 440, currentY + 10);

      doc.fillColor('#64748b').font('Helvetica').fontSize(8)
         .text(
           '* Values marked with asterisk (*) are outside normal range',
           70, currentY + 30
         );

      // ── FOOTER ────────────────────────────────────
      const footerY = doc.page.height - 40;
      doc.rect(0, footerY, doc.page.width, 40).fill('#0c1a2e');
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(7)
         .text(
           'This report is generated by MediCare Plus. Please consult your doctor for interpretation.',
           50, footerY + 8,
           { align: 'center', width: doc.page.width - 100 }
         );
      doc.fillColor('#5eead4').fontSize(7)
         .text(
           'MediCare Plus | Digital Health System | Lahore, Pakistan',
           50, footerY + 22,
           { align: 'center', width: doc.page.width - 100 }
         );

      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error',  reject);

    } catch (err) {
      reject(err);
    }
  });
};
// ── PHARMACY INVOICE PDF ─────────────────────────────
exports.generateInvoicePDF = (sale) => {
  return new Promise((resolve, reject) => {
    try {
      const { patient, user, items, invoiceNo, createdAt,
              subtotal, discount, total, paymentMode } = sale;

      const fileName = `inv_${invoiceNo}_${Date.now()}.pdf`;
      const filePath = path.join(os.tmpdir(), fileName);

      const doc    = new PDFDocument({ margin: 50, size: 'A5' });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ── HEADER ──────────────────────────────────
      doc.rect(0, 0, doc.page.width, 80).fill('#0c1a2e');

      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(18)
         .text('MediCare Plus', 30, 18);

      doc.fillColor('#5eead4')
         .font('Helvetica')
         .fontSize(8)
         .text('Pharmacy Invoice', 30, 42);

      doc.fillColor('#94a3b8')
         .fontSize(7)
         .text('Lahore, Punjab, Pakistan', 30, 55);

      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(8)
         .text(invoiceNo, 250, 18,
               { width: doc.page.width - 280, align: 'right' });

      doc.fillColor('#94a3b8')
         .font('Helvetica')
         .fontSize(7)
         .text(
           new Date(createdAt).toLocaleDateString('en-GB'),
           250, 34,
           { width: doc.page.width - 280, align: 'right' }
         )
         .text(
           new Date(createdAt).toLocaleTimeString('en-GB'),
           250, 46,
           { width: doc.page.width - 280, align: 'right' }
         );

      // ── PATIENT INFO ─────────────────────────────
      let y = 95;

      if (patient) {
        doc.rect(30, y, doc.page.width - 60, 36)
           .fillAndStroke('#f8fafc', '#e2e8f0');
        doc.fillColor('#64748b').font('Helvetica').fontSize(7)
           .text('PATIENT', 45, y + 6);
        doc.fillColor('#0c1a2e').font('Helvetica-Bold').fontSize(10)
           .text(`${patient.firstName} ${patient.lastName}`, 45, y + 16);
        doc.fillColor('#64748b').font('Helvetica').fontSize(7)
           .text(patient.patientCode || '', 45, y + 28);
        y += 50;
      }

      // ── ITEMS TABLE ──────────────────────────────
      // Header
      doc.rect(30, y, doc.page.width - 60, 18).fill('#0c1a2e');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(7);
      doc.text('Medicine',   42,  y + 5);
      doc.text('Qty',       200,  y + 5);
      doc.text('Price',     230,  y + 5);
      doc.text('Total',     280,  y + 5);
      y += 18;

      // Rows
      items.forEach((item, i) => {
        const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(30, y, doc.page.width - 60, 20).fill(bg);

        const medName = item.medicine
          ? `${item.medicine.name}${item.medicine.strength ? ' ' + item.medicine.strength : ''}`
          : 'Unknown';

        doc.fillColor('#0c1a2e').font('Helvetica-Bold').fontSize(8)
           .text(medName, 42, y + 6, { width: 155 });

        doc.fillColor('#334155').font('Helvetica').fontSize(8)
           .text(String(item.qty),               200, y + 6)
           .text(`Rs ${item.price.toFixed(0)}`,  230, y + 6)
           .text(`Rs ${item.total.toFixed(0)}`,  280, y + 6);

        y += 20;
      });

      // Border around table
      doc.rect(30, y - (items.length * 20) - 18,
               doc.page.width - 60,
               (items.length * 20) + 18).stroke('#e2e8f0');

      y += 10;

      // ── TOTALS ───────────────────────────────────
      doc.rect(30, y, doc.page.width - 60, discount > 0 ? 60 : 42)
         .fillAndStroke('#f8fafc', '#e2e8f0');

      doc.fillColor('#64748b').font('Helvetica').fontSize(8)
         .text('Subtotal:',  45, y + 8)
         .text(`Rs ${subtotal.toFixed(0)}`, 200, y + 8,
               { width: doc.page.width - 230, align: 'right' });

      if (discount > 0) {
        doc.fillColor('#dc2626')
           .text('Discount:',   45, y + 24)
           .text(`- Rs ${discount.toFixed(0)}`, 200, y + 24,
                 { width: doc.page.width - 230, align: 'right' });
      }

      const totalY = discount > 0 ? y + 40 : y + 24;
      doc.rect(30, totalY, doc.page.width - 60, 22).fill('#0c1a2e');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10)
         .text('TOTAL:',        45, totalY + 6)
         .text(`Rs ${total.toFixed(0)}`, 45, totalY + 6,
               { width: doc.page.width - 90, align: 'right' });

      y = totalY + 30;

      // ── PAYMENT MODE ─────────────────────────────
      doc.fillColor('#0d9488').font('Helvetica-Bold').fontSize(8)
         .text(`Payment: ${paymentMode}  |  Served by: ${user?.name || 'Staff'}`,
               30, y, { align: 'center', width: doc.page.width - 60 });

      // ── FOOTER ───────────────────────────────────
      const footerY = doc.page.height - 35;
      doc.rect(0, footerY, doc.page.width, 35).fill('#0c1a2e');
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(6)
         .text('Thank you for choosing MediCare Plus Pharmacy',
               30, footerY + 8,
               { align: 'center', width: doc.page.width - 60 });
      doc.fillColor('#5eead4').fontSize(6)
         .text('Get well soon!',
               30, footerY + 20,
               { align: 'center', width: doc.page.width - 60 });

      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error',  reject);

    } catch (err) {
      reject(err);
    }
  });
};