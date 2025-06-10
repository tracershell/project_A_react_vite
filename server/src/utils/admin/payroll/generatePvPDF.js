// server/src/utils/admin/payroll/generatePvPDF.js


const PDFDocument = require('pdfkit');
const path = require('path');

const generatePVPDF = async (res, summaryData) => {
  const fontPath = path.join(__dirname, '../../../public/fonts/NotoSansKR-Regular.ttf');
  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'landscape' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=pv_summary.pdf');
  doc.pipe(res);

  doc.fontSize(12).text('PV Summary Report', { align: 'center' });
  doc.moveDown(1);

  const monthAbbr = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString('en-US', { month: 'short' })
  );
  const headers = ['EID', 'Name', 'PV Given', 'PV Remain', ...monthAbbr];
  const colWidths = [40, 100, 70, 70, ...Array(12).fill(40)];
  const rowHeight = 14;
  const startX = doc.page.margins.left;
  const pageBottom = doc.page.height - doc.page.margins.bottom;

  let y = doc.y;
  let x = startX;

  headers.forEach((header, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).stroke();
    doc.text(header, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
    x += colWidths[i];
  });
  y += rowHeight;

  summaryData.forEach(row => {
    if (y + rowHeight > pageBottom) {
      doc.addPage();
      y = doc.page.margins.top;
      x = startX;
      headers.forEach((header, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(header, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }

    const values = [
      row.EID,
      row.NAME,
      row.PVGiven,
      row.PVRemain,
      ...monthAbbr.map(m => row[`${m}_PV`] || 0)
    ];

    x = startX;
    values.forEach((val, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(val.toString(), x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
      x += colWidths[i];
    });
    y += rowHeight;
  });

  doc.end();
};

module.exports = generatePVPDF;


