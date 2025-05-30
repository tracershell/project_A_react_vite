// 📄 generatePayrollTaxPDF.js
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generatePayrollTaxPDF = async (res, records, info = {}) => {
  const fontPath = path.join(__dirname, '../../../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) return res.status(500).send('폰트 파일이 존재하지 않습니다.');

  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'landscape' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=payroll_tax_list.pdf');
  doc.pipe(res);

  doc.fontSize(13).text('Payroll Tax Report', { align: 'center' });
  doc.moveDown(0.5);

  doc.fontSize(9).text(`Pay Date: ${info.pdate || '-'}`, { align: 'left' });
  doc.moveDown(1);

  const headers = [
    'Check No', 'R.T', 'O.T', 'D.T',
    'FW', 'SSE', 'ME',
    'CA-W', 'CA-de',
    'ADV.', 'C.S', 'D.D',
    'Gross', 'Tax', 'Net'
  ];

  const colWidths = [60, 40, 40, 40, 45, 45, 45, 45, 45, 45, 45, 45, 60, 60, 60];
  const startX = doc.page.margins.left;
  let y = doc.y + 5;
  const rowHeight = 16;

  // header
  let x = startX;
  doc.fontSize(8).lineWidth(0.8);
  headers.forEach((header, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).stroke();
    doc.text(header, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
    x += colWidths[i];
  });
  y += rowHeight;

  // data rows
  records.forEach(row => {
    x = startX;
    const values = [
      row.ckno || '',
      row.rtime, row.otime, row.dtime,
      row.fw, row.sse, row.me,
      row.caw, row.cade,
      row.adv, row.csp, row.dd,
      row.gross, row.tax, row.net
    ].map(val => typeof val === 'number' ? val.toFixed(2) : val);

    values.forEach((val, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(val, x + 2, y + 2, {
        width: colWidths[i] - 4,
        align: 'center'
      });
      x += colWidths[i];
    });

    y += rowHeight;

    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      doc.fontSize(8);
      y = doc.page.margins.top;
      x = startX;
      headers.forEach((header, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(header, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }
  });

  doc.end();
};

module.exports = generatePayrollTaxPDF;
