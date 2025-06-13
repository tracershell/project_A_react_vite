const PDFDocument = require('pdfkit');

const generateCashpayPDF = async (res, query) => {
  const { paydate, name, rtime, otime, rate } = query;
  const [rH, rM] = rtime.split(':').map(Number);
  const [oH, oM] = otime.split(':').map(Number);
  const cashRate = parseFloat(rate);

  const regTotalHours = rH + rM / 60;
  const otTotalHours = oH + oM / 60;

  const regAmount = regTotalHours * cashRate;
  const otAmount = otTotalHours * (cashRate * 1.5);
  const totalAmount = Math.round((regAmount + otAmount) * 100) / 100;

  const formattedDate = new Date(paydate);
  const mm = String(formattedDate.getMonth() + 1).padStart(2, '0');
  const dd = String(formattedDate.getDate()).padStart(2, '0');
  const yyyy = formattedDate.getFullYear();
  const paydateFormatted = `${mm}/${dd}/${yyyy}`;

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=cashpay.pdf');
  doc.pipe(res);

  doc.fontSize(10);
  const boxX = 15;
  const boxY = 20;
  const boxWidth = 200;
  const boxHeight = 78;
  const boxBorderWidth = 0.3;
  doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();

  const labelX = boxX + 10;
  const amountX = boxX + boxWidth - 80;

  doc.text(`Pay Date: ${paydateFormatted}`, labelX, boxY + 10);
  doc.text(`${name}`, amountX, boxY + 10, { align: 'right', width: 70 });
  doc.text(`Regular Time: ${rtime} × $${cashRate.toFixed(2)}`, labelX, boxY + 25);
  doc.text(`$${regAmount.toFixed(2)}`, amountX, boxY + 25, { align: 'right', width: 70 });
  doc.text(`Over Time: ${otime} × $${(cashRate * 1.5).toFixed(2)}`, labelX, boxY + 40);
  doc.text(`$${otAmount.toFixed(2)}`, amountX, boxY + 40, { align: 'right', width: 70 });
  doc.text(`[Total Amount]`, labelX, boxY + 55);
  doc.text(`$${totalAmount.toFixed(2)}`, amountX, boxY + 55, { align: 'right', width: 70 });

  doc.end();
};

module.exports = generateCashpayPDF;