const PDFDocument = require('pdfkit');

const generateCashpayPDF = (res, query) => {
  const {
    cdate, cname = 'Edgar', crate = '3.00',
    crhour = 0, crmin = 0, cohour = 0, comin = 0
  } = query;

  const rhr = parseFloat(crhour);
  const rmn = parseFloat(crmin) / 60;
  const ohr = parseFloat(cohour);
  const omn = parseFloat(comin) / 60;
  const rate = parseFloat(crate);

  const ramount = (rhr + rmn) * rate;
  const oamount = (ohr + omn) * (rate * 1.5);
  const stotal = ramount + oamount;
  const total = Math.round(stotal * 10) / 10;

  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=cashpay.pdf');
  doc.pipe(res);

  doc.fontSize(9);

  // ⬇ Box 위치: 왼쪽 상단, 크기 축소
  const boxX = 10;      // box 왼쪽 상단 위치
  const boxY = 10;      // box 위쪽 위치  
  const boxW = 200;     // box 폭을 줄여서 200으로 설정// 
  const boxH = 80;

  doc.rect(boxX, boxY, boxW, boxH).stroke();

  const leftX = boxX + 8;
  const line1Y = boxY + 8;
  const line2Y = boxY + 22;
  const line3Y = boxY + 35;
  const line4Y = boxY + 55;

  const descWidth = 90;         // 설명 (e.g. Regular Time)
  const calcWidth = 70;         // 계산식 폭
  const amountWidth = 45;       // 금액 폭
  const spacing = 6;            // 계산식과 금액 사이 여백

  // 1️⃣ Pay Date & Name
  doc.text(`Pay Date: ${cdate || ''}`, leftX, line1Y, { continued: true });
  doc.text(`${cname}`, leftX + 100, line1Y, { width: 110, align: 'right' });

  // 2️⃣ Regular Time
  const regCalc = `${crhour}:${crmin} x $${rate.toFixed(2)}`;
  doc.text(`Regular Time:`, leftX, line2Y);
  doc.text(regCalc, leftX + descWidth - 40, line2Y, {
    width: calcWidth,
    align: 'right'
  });
  doc.text(`$${ramount.toFixed(2)}`, leftX + descWidth - 40 + calcWidth + spacing, line2Y, {
    width: amountWidth,
    align: 'right'
  });

  // 3️⃣ Over Time
  const overCalc = `${cohour}:${comin} x $${(rate * 1.5).toFixed(2)}`;
  doc.text(`Over Time:`, leftX, line3Y);
  doc.text(overCalc, leftX + descWidth - 40, line3Y, {
    width: calcWidth,
    align: 'right'
  });
  doc.text(`$${oamount.toFixed(2)}`, leftX + descWidth - 40 + calcWidth + spacing, line3Y, {
    width: amountWidth,
    align: 'right'
  });

  // 4️⃣ Total
  doc.moveTo(leftX, line4Y).lineTo(boxX + boxW - 8, line4Y).stroke();
  doc.text(`[Total Amount]`, leftX, line4Y + 5);
  doc.text(`$${total.toFixed(2)}`, leftX + descWidth - 40 + calcWidth + spacing, line4Y + 5, {
    width: amountWidth,
    align: 'right'
  });

  doc.end();
};

module.exports = generateCashpayPDF;
