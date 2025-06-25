// 📁 server/src/utils/admin/account/generateBankRecordPDF.js
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const formatDate = (date) => {
  if (!date) return '';
  if (date instanceof Date) return date.toISOString().slice(0, 10);
  const d = new Date(date);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
};

const generateBankRecordPDF = async (res, options) => {
  const { rows, start, end } = options;
  const fontPath = path.join(__dirname, '../../../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    console.error('폰트 없음:', fontPath);
    return res.status(500).send('폰트 파일 없음');
  }

  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'portrait' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=BankRecord_${start}_to_${end}.pdf`);
  doc.pipe(res);

  doc.fontSize(15).text(`Bank Record Report`, { align: 'center' });
  doc.moveDown(0.2);
  doc.fontSize(10).text(`기간: ${start} ~ ${end}`, { align: 'center' });
  doc.moveDown(0.5);
  doc.lineWidth(0.2);  // table 선의 굵기 조절

  const headers = ['Date', 'Record Type', 'Amount', 'Comment'];
  const colWidths = [80, 80, 80, 300];
  const rowHeight = 20;
  const startX = doc.page.margins.left;
  let y = doc.y + 5;

  // Header
  let x = startX;
  headers.forEach((header, i) => {
    const w = colWidths[i];
    doc.rect(x, y, w, rowHeight).stroke();
    doc.text(header, x + 2, y + 3, { width: w - 4, align: 'center' });
    x += w;
  });
  y += rowHeight;

  for (const row of rows) {
    x = startX;
    const dataRow = [
      formatDate(row.date),
      row.rtype,
      Number(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      row.comment || '',
    ];

    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
      let hx = startX;
      headers.forEach((h, hi) => {
        const hw = colWidths[hi];
        doc.rect(hx, y, hw, rowHeight).stroke();
        doc.text(h, hx + 2, y + 3, { width: hw - 4, align: 'center' });
        hx += hw;
      });
      y += rowHeight;
    }

    dataRow.forEach((cell, i) => {
      const w = colWidths[i];
      doc.rect(x, y, w, rowHeight).stroke();
      doc.text(cell, x + 2, y + 3, { width: w - 4, align: 'center' });
      x += w;
    });
    y += rowHeight;
  }

  doc.end();
};

module.exports = generateBankRecordPDF;
