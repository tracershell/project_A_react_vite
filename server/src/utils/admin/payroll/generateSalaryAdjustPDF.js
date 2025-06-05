// server/src/utils/generateSalaryAdjustPDF.js

const PDFDocument = require('pdfkit');

function generateSalaryAdjustPDF(res, data) {
  const {
    deduction = '0',
    fixSalary = '0.00',
    originalSalary = '0.00',
    adjustedWorkDays = '0',
    workDays = '0',
    adjSalary = '0.00'
  } = data;

  const fixSalaryNum = Number(fixSalary);
  const originalSalaryNum = Number(originalSalary);
  const adjSalaryNum = Number(adjSalary);
  const roundedAdjSalary = Math.round(adjSalaryNum);

  const format = (num) => num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const doc = new PDFDocument({ margin: 40 });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=salary_adjust.pdf');
    res.send(pdfData);
  });

  doc.fontSize(8).font('Helvetica');

  doc.text('Deduction Day :', 40, 40);
  doc.text(`${deduction} day(s)`, 120, 40);

  doc.text('Adjusted Salary :', 40, 55);
  doc.text(`$ ${format(roundedAdjSalary)}`, 120, 55);

  doc.text(`$${format(originalSalaryNum)}`, 40, 90);
  doc.text('X', 105, 90);
  doc.text(`${adjustedWorkDays}`, 120, 85);
  doc.text('=', 150, 90);
  doc.text(`${format(adjSalaryNum)}`, 170, 90);

  const numeratorWidth = doc.widthOfString(adjustedWorkDays);
  doc.moveTo(120, 93).lineTo(120 + numeratorWidth, 93).stroke();
  doc.text(`${workDays}`, 120, 95);

  doc.end();
}

module.exports = generateSalaryAdjustPDF;
