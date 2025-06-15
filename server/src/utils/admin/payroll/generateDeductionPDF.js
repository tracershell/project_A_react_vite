const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const generateDeductionPDF = async (res, query) => {
  const { paydate, name, ckno, amount, filename } = query;
  try {
    const filePath = path.join(__dirname, '../../../../public/uploads/payroll/pdoc_upload', filename);
    if (!fs.existsSync(filePath)) return res.status(404).send('PDF file not found');

    // PDFKit은 기존 PDF에 덧붙일 수 없으므로 새 PDF 페이지 생성
    const doc = new PDFDocument({ autoFirstPage: false });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=payroll_deduction_view.pdf');
      res.send(pdfData);
    });

    doc.addPage();
    doc.fontSize(10);
    const yBase = 40;

    doc.moveTo(50, yBase + 50).lineTo(550, yBase + 50).lineWidth(0.5).stroke();
    doc.text(`Name: ${name}`, 50, yBase + 35);
    doc.text(`Pay Date: ${paydate}    Check No: ${ckno}    Amount: ${amount}`, 50, yBase + 20);
    doc.moveTo(50, yBase + 10).lineTo(550, yBase + 10).lineWidth(0.5).stroke();

    doc.end();
  } catch (err) {
    console.error('Error generating Payroll Deduction PDF:', err);
    res.status(500).send('PDF generation failed');
  }
};

module.exports = generateDeductionPDF;