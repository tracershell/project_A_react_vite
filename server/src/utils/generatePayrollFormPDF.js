// ✅ File: server/src/utils/generatePayrollFormPDF.js
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generatePayrollFormPDF = async (res, records, { startCkno, endCkno }) => {
  const fontPath = path.resolve('public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    return res.status(500).send('폰트 파일이 존재하지 않습니다.');
  }

  const doc = new PDFDocument({ margin: 40, size: 'letter', layout: 'portrait' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=payroll_form_dual.pdf');
  doc.pipe(res);

  if (records.length === 0) {
    doc.fontSize(12).text('선택된 Check No 범위에 해당하는 레코드가 없습니다.', 100, 100);
    doc.end();
    return;
  }

  doc.fontSize(9);
  for (let i = 0; i < records.length; i += 2) {
    const pair = records.slice(i, i + 2);

    pair.forEach((item, idx) => {
      const top = idx === 0 ? 680 : 720;

      doc.lineWidth(0.5);
      doc.rect(40, top - 10, 520, 30).stroke();

      const formattedDate = new Date(item.pdate).toLocaleDateString('en-US');
      const gross = parseFloat(item.gross || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
      });

      doc.fontSize(9);
      doc.text(`Check No: ${item.ckno}`, 50, top + 1);
      doc.text(`Date: ${formattedDate}`, 160, top + 1);
      doc.text(`${item.name}`, 330, top + 1);
      doc.text(`$${gross}`, 460, top + 1);
    });

    if (i + 2 < records.length) doc.addPage();
  }

  doc.end();
};

module.exports = generatePayrollFormPDF;
