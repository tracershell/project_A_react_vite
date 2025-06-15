const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateChildspPDF = (res, query) => {
  const {
    cs_date = '',
    cs_name = 'Jonathan Gutierrez',
    cs_checkno = '',
    cs_amount = '50.01',
    filename = ''
  } = query;

  const imagePath = path.join(__dirname, '../../../../public/uploads/payroll/pdoc_upload', filename);

  if (!fs.existsSync(imagePath)) {
    return res.status(404).send('Background image not found');
  }

  const doc = new PDFDocument({ autoFirstPage: false });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=child_support.pdf');
  doc.pipe(res);

  // ✅ 새 페이지 추가
  doc.addPage();

  // ✅ .jpg 또는 .png만 image 삽입 가능
  doc.image(imagePath, 50, 100, { width: doc.page.width - 100, height: 220 });

  // ✅ 텍스트 삽입
  doc.fontSize(15);
  doc.text(`${cs_amount}`, 420, 185);

  // ✅ 텍스트 삽입 전: 가로선 추가
  doc.moveTo(50, 650).lineTo(doc.page.width - 50, 650).stroke();

  doc.fontSize(12);
  doc.text(`Date: ${cs_date}`, 60, 680);
  doc.text(`Check No.  ${cs_checkno}`, 200, 680);
  doc.text(`$${cs_amount}`, 340, 680);
  doc.text(`( Name: ${cs_name} )`, 420, 680);

  // ✅ 텍스트 삽입 후: 가로선 추가
  doc.moveTo(50, 720).lineTo(doc.page.width - 50, 720).stroke();

  doc.end();
};

module.exports = generateChildspPDF;
