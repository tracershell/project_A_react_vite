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
  doc.image(imagePath, 0, 0, { width: doc.page.width });

  // ✅ 텍스트 삽입
  doc.fontSize(10);
  doc.text(`$${cs_amount}`, 450, 200);
  doc.text(`Date: ${cs_date}    ${cs_checkno}   ${cs_name}`, 60, 400);

  doc.end();
};

module.exports = generateChildspPDF;
