const PDFDocument = require('pdfkit');

const generateCashpayPDF = (res, query) => {
  console.log('✅ 받은 query:', query);  // 디버깅용 로그

  const {
    cdate,
    cname: rawName,
    crate = '3.00',
    crhour = 0, crmin = 0, cohour = 0, comin = 0
  } = query;

  // ✅ 이름 처리 (기본값 'Edgar')
  const name = (typeof rawName === 'string' && rawName.trim() !== '') ? rawName.trim() : 'Edgar';

  const rate = !isNaN(crate) ? parseFloat(crate) : 3.00;
  const rhr = parseFloat(crhour);
  const rmn = parseFloat(crmin) / 60;
  const ohr = parseFloat(cohour);
  const omn = parseFloat(comin) / 60;

  const ramount = (rhr + rmn) * rate;
  const oamount = (ohr + omn) * (rate * 1.5);
  const stotal = ramount + oamount;
  const total = Math.round(stotal * 10) / 10;

  //====================== Regular Time 정수부, 소수부 ======================
  const rthr = rhr + rmn;
  // 정수부: RXX
  const RXX = Math.floor(rthr);
  // 소수부: RYY
  const RYY = Number((rthr - RXX).toFixed(2)) * 100;
//====================== Over Time 정수부, 소수부 ======================
  const othr = ohr + omn;
  // 정수부: OXX
  const OXX = Math.floor(othr);
  // 소수부: OYY
  const OYY = Number((othr - OXX).toFixed(2)) * 100;


  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=cashpay.pdf');
  doc.pipe(res);

  doc.fontSize(9);

  // ⬇ Box 설정
  const boxX = 10;
  const boxY = 10;
  const boxW = 200;
  const boxH = 80;

  doc.rect(boxX, boxY, boxW, boxH).stroke();

  const leftX = boxX + 8;
  const line1Y = boxY + 8;
  const line2Y = boxY + 22;
  const line3Y = boxY + 35;
  const line4Y = boxY + 55;

  const descWidth = 90;
  const calcWidth = 70;
  const amountWidth = 45;
  const spacing = 6;

  // 1️⃣ Pay Date & Name
  doc.text(`Pay Date: ${cdate || ''}`, leftX, line1Y);
  doc.text(`${name}`, leftX + 95, line1Y);

  // 2️⃣ Regular Time
  const regCalc = `${RXX}.${RYY} x $${rate.toFixed(2)}`;
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
  const overCalc = `${OXX}.${OYY} x $${(rate * 1.5).toFixed(2)}`;
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
  doc.text(`$${Math.round(total)}`, leftX + descWidth - 40 + calcWidth + spacing, line4Y + 5, {
  width: amountWidth,
  align: 'right'
});

  doc.end();
};

module.exports = generateCashpayPDF;
