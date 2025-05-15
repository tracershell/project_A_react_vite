const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const db = require('../../../lib/db');

const fontPath = __dirname + '/../../../public/fonts/NotoSansKR-Regular.ttf'; // 필요시 경로 조정

router.get('/deposit/pdf', async (req, res) => {
  const { date, exrate } = req.query;
  const [rows] = await db.query(
    `SELECT * FROM import_deposit_pay WHERE dp_date = ? ORDER BY vendor_id, po_no`,
    [date]
  );

  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
  doc.font(fontPath).fontSize(12);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=deposit_${date}.pdf`);
  doc.pipe(res);

  doc.text(`Deposit Payments - ${date} (Exrate: ${exrate})`, { align: 'center' });
  doc.moveDown();

  const headers = ['PO No', 'Vendor', 'RMB', 'Exrate', 'USD'];
  const colWidths = [120, 120, 100, 80, 100];

  headers.forEach((h, i) => {
    doc.text(h, 50 + i * 120, doc.y, { continued: true });
  });
  doc.moveDown();

  rows.forEach(r => {
    doc.text(r.po_no, 50, doc.y, { continued: true });
    doc.text(r.vendor_id, 170, doc.y, { continued: true });
    doc.text(String(r.dp_amount_rmb), 290, doc.y, { continued: true });
    doc.text(String(r.exrate), 410, doc.y, { continued: true });
    doc.text(String(r.dp_amount_usd), 530, doc.y);
  });

  doc.end();
});

router.get('/balance/pdf', async (req, res) => {
  const { date, exrate } = req.query;
  const [rows] = await db.query(
    `SELECT * FROM import_balance_pay WHERE bp_date = ? ORDER BY vendor_id, po_no`,
    [date]
  );

  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
  doc.font(fontPath).fontSize(12);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=balance_${date}.pdf`);
  doc.pipe(res);

  doc.text(`Balance Payments - ${date} (Exrate: ${exrate})`, { align: 'center' });
  doc.moveDown();

  const headers = ['PO No', 'Vendor', 'RMB', 'Exrate', 'USD'];
  const colWidths = [120, 120, 100, 80, 100];

  headers.forEach((h, i) => {
    doc.text(h, 50 + i * 120, doc.y, { continued: true });
  });
  doc.moveDown();

  rows.forEach(r => {
    doc.text(r.po_no, 50, doc.y, { continued: true });
    doc.text(r.vendor_id, 170, doc.y, { continued: true });
    doc.text(String(r.bp_amount_rmb), 290, doc.y, { continued: true });
    doc.text(String(r.exrate), 410, doc.y, { continued: true });
    doc.text(String(r.bp_amount_usd), 530, doc.y);
  });

  doc.end();
});

module.exports = router;
