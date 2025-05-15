// /server/routes/admin/import/import_extra_pdf.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const PDFDocument = require('pdfkit');

router.get('/:type', async (req, res) => {
  const { type } = req.params;
  if (!['deposit', 'balance'].includes(type)) return res.status(400).send('잘못된 type');

  const query = `SELECT e.*, p.po_no, p.style, v.v_name
    FROM import_extra_items e
    JOIN import_pos p ON e.po_id = p.id
    JOIN import_vendors v ON p.vendor_id = v.id
    WHERE e.type = ? ORDER BY v.v_name, p.po_no, e.id`;

  try {
    const [rows] = await db.query(query, [type]);

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=extra_items_${type}.pdf`);
    doc.pipe(res);

    doc.fontSize(16).text(`Extra Items (${type})`, { align: 'center' });
    doc.moveDown();

    const headers = ['Vendor', 'PO No', 'Style', 'Category', 'Description', 'Amount', 'Apply ExRate'];
    const startX = 40;
    let y = doc.y + 10;

    doc.fontSize(10);
    headers.forEach((h, i) => {
      doc.text(h, startX + i * 90, y, { width: 90, align: 'center' });
    });
    y += 20;

    rows.forEach(row => {
      const values = [row.v_name, row.po_no, row.style, row.category, row.description, row.amount, row.apply_exrate ? '✔' : '']
      values.forEach((val, i) => {
        doc.text(String(val), startX + i * 90, y, { width: 90, align: 'center' });
      });
      y += 18;
      if (y > 550) {
        doc.addPage();
        y = 50;
      }
    });

    doc.end();
  } catch (err) {
    console.error('PDF 출력 오류:', err);
    res.status(500).send('PDF 출력 실패');
  }
});

module.exports = router;
