// server/src/utils/admin/employees/generateEmployeesPDF.js

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateEmployeesPDF = async (res, records, title) => {


  const fontPath = path.join(__dirname, '../../../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    return res.status(500).send('폰트 파일이 존재하지 않습니다.');
  }

  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'landscape' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=employees_list.pdf');
  doc.pipe(res);

  doc.fontSize(12).text(`Employees List (${title})`, { align: 'center' });
  doc.moveDown();

  // ✅ 제외한 header 목록
  const headers = ['EID', 'Name', 'SS No', 'Birthday', 'Email', 'Phone', 'Sick', 'Vac', 'Address', 'City', 'State', 'Zip'];

  const colWidths = [40, 100, 60, 60, 120, 60, 30, 30, 90, 60, 30, 45];
  const startX = doc.page.margins.left;
  let y = doc.y + 10;
  const rowHeight = 20;

  // Draw header
  let x = startX;
  doc.fontSize(8).fillColor('black');
  doc.lineWidth(0.2);
  headers.forEach((header, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).stroke();
    doc.text(header, x + 2, y + 5, { width: colWidths[i] - 4, align: 'center' });
    x += colWidths[i];
  });
  y += rowHeight;

  // Draw rows
  records.forEach(emp => {
    x = startX;
    const row = [
      emp.eid,
      emp.name,
      emp.ss,
      emp.birth ? emp.birth.toISOString().split('T')[0] : '',
      emp.email,
      emp.phone,
      emp.sick,
      emp.vac,
      emp.address,
      emp.city,
      emp.state,
      emp.zip,
    ];

    row.forEach((cell, i) => {
  doc.rect(x, y, colWidths[i], rowHeight).stroke();
  doc.text(
    cell !== undefined && cell !== null
      ? (['sick', 'vac', 'zip'].includes(headers[i].toLowerCase()) && !isNaN(cell)
          ? Number(cell).toLocaleString('en-US', { minimumFractionDigits: 2 })
          : String(cell))
      : '',
    x + 2,
    y + 5,
    { width: colWidths[i] - 4, align: 'center' }
  );
  x += colWidths[i];
});


    y += rowHeight;

    // Check for page break
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      doc.lineWidth(0.2);
      y = doc.page.margins.top;

      // Redraw header on new page
      x = startX;
      headers.forEach((header, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(header, x + 2, y + 5, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }
  });

  doc.end();
};

module.exports = generateEmployeesPDF;
