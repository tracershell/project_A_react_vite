// server/src/utils/admin/payroll/generateTimeaddPDF.js

const PDFDocument = require('pdfkit');

const generateTimeaddPDF = (res, query) => {
  const { rhour, rmin, ohour, omin, dhour, dmin, ltimes, comment } = query;

  const rtotal = (parseInt(rhour || 0) * 60) + parseInt(rmin || 0);
  const ctotal = parseInt(ltimes || 0) * 10;
  const total = rtotal + ctotal;

  const ahour = Math.floor(total / 60);
  const amin = total % 60;

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=timesheet.pdf');
  doc.pipe(res);

  doc.fontSize(10);
  const boxX = 200;
  const boxY = 80;
  const boxWidth = 390;
  const boxHeight = 50;

  doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();
  doc.text(`* ADD. Minutes: ${ltimes} x 10min = ${ctotal} min     : ${comment}`, boxX + 10, boxY + 10);
  doc.text(`* Regular Time: ${String(ahour).padStart(2, '0')}:${String(amin).padStart(2, '0')}   * Over Time: ${ohour}:${omin}   * Double Time: ${dhour}:${dmin}`, boxX + 10, boxY + 30);

  doc.end();
};

module.exports = generateTimeaddPDF;
