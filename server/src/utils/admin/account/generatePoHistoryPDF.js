// server/src/utils/admin/account/generatePoHistoryPDF.js

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const formatDate = (date) => {
  return date instanceof Date ? date.toISOString().slice(0, 10) : '';
};


const generatePoHistoryPDF = async (res, records) => {
  const fontPath = path.join(__dirname, '../../../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) return res.status(500).send('폰트 파일이 존재하지 않습니다.');

  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'landscape' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=po_history.pdf');
  doc.pipe(res);

  doc.fontSize(13).text('PO History Summary', { align: 'center' });
  doc.moveDown(1);

  const headers = ['PO No', 'PO Date', 'PO Amount (USD)', 'Deposit Date', 'Deposit (USD)', 'Balance Date', 'Balance (USD)'];
  const colWidths = [120, 90, 110, 90, 100, 90, 100];
  const startX = doc.page.margins.left;
  const rowHeight = 20;

  let y = doc.y + 5;
  let x = startX;
  doc.fontSize(9).lineWidth(0.2); // table 선 굵기 조절
  headers.forEach((header, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).stroke();
    doc.text(header, x + 2, y + 5, { width: colWidths[i] - 4, align: 'center' });
    x += colWidths[i];
  });
  y += rowHeight;

  for (const row of records) {
    x = startX;
    const dataRow = [
      row.po_no || '',
      formatDate(row.po_date),
      Number(row.po_amount_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      formatDate(row.dp_date),
      Number(row.dp_amount_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      formatDate(row.bp_date),
      Number(row.bp_amount_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })
    ];

    dataRow.forEach((cell, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(cell, x + 2, y + 5, {
        width: colWidths[i] - 4,
        align: 'center'
      });
      x += colWidths[i];
    });
    y += rowHeight;

    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
      x = startX;
      headers.forEach((header, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(header, x + 2, y + 5, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }
  }

  doc.end();
};

module.exports = generatePoHistoryPDF;
