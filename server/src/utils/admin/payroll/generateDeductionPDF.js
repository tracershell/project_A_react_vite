const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateDeductionPDF = (res, query) => {
  const {
    ddate = '',
    dname = 'Jonathan Gutierrez',
    dnumber = '',
    damount = '25.00',
    filename = ''
  } = query;

  const imagePath = path.join(__dirname, '../../../../public/uploads/payroll/pdoc_upload', filename);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).send('Background image not found');
  }

  const doc = new PDFDocument({ autoFirstPage: false });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=deduction_voucher.pdf');
  doc.pipe(res);

  // ✅ 새 페이지
  doc.addPage();

  // ✅ 배경 이미지 삽입
  doc.image(imagePath, 100, 100, {
    width: doc.page.width - 200,
    height: 400
  });


  // ✅ 텍스트 위 가로선
  doc.moveTo(50, 650).lineTo(doc.page.width - 50, 650).stroke();

  // ✅ 텍스트 삽입
  doc.fontSize(12);
  doc.text(`Date: ${ddate}`, 60, 680);
  doc.text(`Check No.  ${dnumber}`, 200, 680);
  doc.text(`$${damount}`, 340, 680);
  doc.text(`( ${dname} )`, 420, 680);

  // ✅ 텍스트 아래 가로선
  doc.moveTo(50, 720).lineTo(doc.page.width - 50, 720).stroke();

  doc.end();
};

module.exports = generateDeductionPDF;
