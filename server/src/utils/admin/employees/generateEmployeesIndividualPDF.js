// 📁 server/src/utils/admin/employees/generateEmployeesIndividualPDF.js
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateEmployeesIndividualPDF = async (res, employee) => {
  const fontPath = path.join(__dirname, '../../../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    console.error('❌ 폰트 파일 없음:', fontPath);
    return res.status(500).send('폰트 파일을 찾을 수 없습니다.');
  }

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=employee_${employee.eid}.pdf`);
  doc.pipe(res);

  // 🔹 제목
  doc.fontSize(18).text(`Employee Profile: ${employee.name}`, { align: 'center' });
  doc.moveDown(1);

  const fieldPairs = [
    ['Employee ID (eid)', employee.eid],
    ['Name', employee.name],
    ['Status', employee.status],
    ['Social Security No', employee.ss],
    ['Birthday', employee.birth ? employee.birth.toISOString().split('T')[0] : ''],
    ['Email', employee.email],
    ['Phone', employee.phone],
    ['Job Code', employee.jcode],
    ['Job Title', employee.jtitle],
    ['Start Date', employee.sdate ? employee.sdate.toISOString().split('T')[0] : ''],
    ['End Date', employee.edate ? employee.edate.toISOString().split('T')[0] : ''],
    ['Sick Days', employee.sick],
    ['Vacation Days', employee.vac],
    ['Work Limit', employee.workl],
    ['Address', employee.address],
    ['City', employee.city],
    ['State', employee.state],
    ['ZIP', employee.zip],
    ['Remark', employee.remark],
  ];

  doc.fontSize(11);
  const labelWidth = 150;
  const valueWidth = 370;
  const rowHeight = 20;
  let y = doc.y;

  fieldPairs.forEach(([label, value]) => {
    doc.rect(40, y, labelWidth, rowHeight).stroke();
    doc.rect(40 + labelWidth, y, valueWidth, rowHeight).stroke();
    doc.text(label, 45, y + 5);
    doc.text(String(value ?? ''), 45 + labelWidth, y + 5);
    y += rowHeight;

    // 페이지 넘어감 방지
    if (y > doc.page.height - 50) {
      doc.addPage();
      y = doc.y;
    }
  });

  doc.end();
};

module.exports = generateEmployeesIndividualPDF;
