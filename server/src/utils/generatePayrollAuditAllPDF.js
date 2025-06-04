// server/src/utils/generatePayrollAuditAllPDF.js

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generatePayrollAuditAllPDF = async (res, records, start, end) => {
  const fontPath = path.join(__dirname, '../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) return res.status(500).send('폰트 파일이 존재하지 않습니다.');

  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'portrait' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=payroll_audit_all.pdf');
  doc.pipe(res); // ✅ 직접 스트리밍

  // Title and date
  doc.fontSize(14).text('Payroll Audit Summary', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Audit Period: ${start} ~ ${end}`);
  doc.moveDown(1);

  const headers = ['Pay Date', 'Check No', 'EID', 'Name', 'J.Title', 'J.Code', 'Wages', 'R.Time', 'O.Time', 'D.Time'];
  const colWidths = [50, 50, 35, 90, 90, 35, 50, 50, 50, 50];

  const startX = doc.page.margins.left;
  let y = doc.y;
  const rowHeight = 18;
  doc.fontSize(8).lineWidth(0.6);

  // Header
  let x = startX;
  headers.forEach((h, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).stroke();
    doc.text(h, x + 2, y + 3, { width: colWidths[i] - 4, align: 'center' });
    x += colWidths[i];
  });
  y += rowHeight;

  // Rows
  records.forEach(r => {
    x = startX;
    const values = [
      r.pdate?.toISOString().split('T')[0] || '',
      r.ckno || '', r.eid, r.name, r.jtitle, r.jcode,
      Number(r.gross).toFixed(2),
      Number(r.rtime).toFixed(2), Number(r.otime).toFixed(2), Number(r.dtime).toFixed(2)
    ];

    values.forEach((val, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(val, x + 2, y + 3, { width: colWidths[i] - 4, align: 'center' });
      x += colWidths[i];
    });

    y += rowHeight;

    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
      x = startX;
      headers.forEach((h, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(h, x + 2, y + 3, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }
  });

  doc.end(); // ✅ 중요
};

module.exports = generatePayrollAuditAllPDF;
