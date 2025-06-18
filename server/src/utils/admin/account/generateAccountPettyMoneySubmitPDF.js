// server/src/utils/admin/account/generateAccountPettyMoneySubmitPDF.js

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

function generateAccountPettyMoneyPDF(res, { rows, start, end, items = [] }) {
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

  // 제목
  doc.fontSize(14).text(`Petty Money Ledger`, { align: 'center' });
  doc.fontSize(10).text(`( ${start} ~ ${end} )`, { align: 'center' });


// ================================================
  // 오른쪽 상단 항목 추가 (Item1~4, 금액 및 합계)
 if (items.length > 0) {
  const boxX = 400;
  let boxY = 60;
  const labelWidth = 90;
  const amountWidth = 60;

  doc.fontSize(9);

  items.forEach((item, idx) => {
    const label = item.label || `Item ${idx + 1}`;
    const amount = typeof item.amount === 'number'
      ? item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : '0.00';

    // ❇️ 붙여서 왼쪽 정렬
    doc.text(`* ${label}`, boxX, boxY, {
      width: labelWidth,
      align: 'left'
    });

    // 금액: 오른쪽 정렬
    doc.text(`$${amount}`, boxX + labelWidth, boxY, {
      width: amountWidth,
      align: 'right'
    });

    boxY += 12;
  });

  // 총합계
  const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  doc.moveTo(boxX, boxY + 2).lineTo(boxX + labelWidth + amountWidth, boxY + 2).lineWidth(0.25).stroke();
  doc.text(`Total:`, boxX, boxY + 6, { width: labelWidth, align: 'center' });
  doc.text(`$${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, boxX + labelWidth, boxY + 6, {
    width: amountWidth,
    align: 'right'
  });
}

// ================================================

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

  doc.lineWidth(0.25).moveTo(40, tableTop + 15).lineTo(550, tableTop + 15).stroke();
  let y = tableTop + 20;

  let lastBalance = 0;

  rows.forEach(row => {
    if (y > 730) {
      doc.addPage();
      y = 40;
    }
    const credit = parseFloat(row.plcredit || 0);
    const debit = parseFloat(row.pldebit || 0);
    const balance = parseFloat(row.plbalance || 0);
    lastBalance = balance;
    const dateObj = new Date(row.pldate);
    const formattedDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}/${dateObj.getFullYear()}`;

    doc.text(formattedDate, colX.date, y);
    if (credit !== 0) {
      doc.text(credit.toLocaleString(undefined, { minimumFractionDigits: 2 }), colX.credit - 20, y, { width: colWidths.credit, align: 'right' });
    }
    if (debit !== 0) {
      doc.text(debit.toLocaleString(undefined, { minimumFractionDigits: 2 }), colX.debit - 20, y, { width: colWidths.debit, align: 'right' });
    }
    if (balance !== 0) {
      doc.text(balance.toLocaleString(undefined, { minimumFractionDigits: 2 }), colX.balance - 20, y, { width: colWidths.balance, align: 'right' });
    }
    doc.text(row.plcomment || '', colX.comment, y, { width: colWidths.comment });

    y += 14;
  });

  y += 5;
  doc.lineWidth(0.25).moveTo(40, y).lineTo(550, y).stroke();
  y += 5;
  doc.fontSize(10).text('Balance :', colX.balance - 60, y, { width: colWidths.balance, align: 'left' });
  doc.text(`$${lastBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, colX.balance - 20, y, { width: colWidths.balance, align: 'right' });

  doc.end();
}

module.exports = generateAccountPettyMoneyPDF;
