// 📁 server/src/utils/admin/account/generateAccountPettyMoneyPDF.js
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

function generateAccountPettyMoneyPDF(res, { rows, start, end }) {
  const fontPath = path.resolve('public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    res.status(500).send('폰트 파일이 없습니다.');
    return;
  }

  const doc = new PDFDocument({ size: 'letter', layout: 'portrait', margin: 40 });
  doc.registerFont('Korean', fontPath).font('Korean');

  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=petty_ledger.pdf');
    res.send(pdfData);
  });

  doc.fontSize(14).text(`Petty Money Ledger`, { align: 'center' });
  doc.fontSize(10).text(`( ${start} ~ ${end} )`, { align: 'center' });
  doc.moveDown(1);

  const tableTop = doc.y;
  const colX = { date: 40, credit: 120, debit: 200, balance: 280, comment: 360 };
  const colWidths = { date: 70, credit: 70, debit: 70, balance: 70, comment: 200 };

  doc.fontSize(10)
    .text('Date', colX.date, tableTop, { width: colWidths.date, align: 'center' })
    .text('Credit', colX.credit, tableTop, { width: colWidths.credit, align: 'center' })
    .text('Debit', colX.debit, tableTop, { width: colWidths.debit, align: 'center' })
    .text('Balance', colX.balance, tableTop, { width: colWidths.balance, align: 'center' })
    .text('Comment', colX.comment, tableTop, { width: colWidths.comment, align: 'center' });

  doc.moveTo(40, tableTop + 15).lineTo(550, tableTop + 15).stroke();
  let y = tableTop + 20;

  rows.forEach(row => {
    if (y > 730) {
      doc.addPage();
      y = 40;
    }
    const credit = parseFloat(row.plcredit || 0);
    const debit = parseFloat(row.pldebit || 0);
    const balance = parseFloat(row.plbalance || 0);
    const dateObj = new Date(row.pldate);
    const formattedDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}/${dateObj.getFullYear()}`;

    doc
      .text(formattedDate, colX.date, y)
      .text(credit.toFixed(2), colX.credit-20, y, { width: colWidths.credit, align: 'right' })
      .text(debit.toFixed(2), colX.debit-20, y, { width: colWidths.debit, align: 'right' })
      .text(balance.toFixed(2), colX.balance-20, y, { width: colWidths.balance, align: 'right' })
      .text(row.plcomment || '', colX.comment, y, { width: colWidths.comment });

    y += 14;
  });

  doc.end();
}

module.exports = generateAccountPettyMoneyPDF;