// ✅ generateArReportPDF.js
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const formatDate = (date) => {
  if (!date) return '';
  if (date instanceof Date) return date.toISOString().slice(0, 10);
  const d = new Date(date);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
};

const generateArReportPDF = async (res, options) => {
  const { rows, year } = options;
  const fontPath = path.join(__dirname, '../../../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    console.error('폰트 파일 없음:', fontPath);
    return res.status(500).send('폰트 파일이 존재하지 않습니다.');
  }

  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'portrait' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=AR_Report_${year}.pdf`);
  doc.pipe(res);

  doc.fontSize(15).text(`AR Report - ${year}년`, { align: 'center' });
  doc.moveDown(0.5);

  const headers = ['End Date', 'HQ Sales', 'Showroom Sales', 'Total Sales', 'AR Report'];
  const colWidths = [110, 110, 110, 110, 110];
  const rowHeight = 20;
  const startX = doc.page.margins.left;
  let y = doc.y + 5;

  // Header
  let x = startX;
  doc.fontSize(10).fillColor('black').lineWidth(0.2);
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
      formatDate(row.ar_date),
      Number(row.hq_sales || 0).toLocaleString(),
      Number(row.sr_sales || 0).toLocaleString(),
      (Number(row.hq_sales || 0) + Number(row.sr_sales || 0)).toLocaleString(),
      Number(row.ar_report || 0).toLocaleString(),
    ];

    // page break
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

module.exports = generateArReportPDF;
