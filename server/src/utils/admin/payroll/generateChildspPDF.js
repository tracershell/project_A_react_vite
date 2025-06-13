const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const generateChildspPDF = async (res, query) => {
  const { paydate, name, ckno, amount, filename } = query;
  try {
    const filePath = path.join(__dirname, '../../../../public/uploads/payroll/pdoc_upload', filename);
    if (!fs.existsSync(filePath)) return res.status(404).send('PDF file not found');

    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width } = firstPage.getSize();
    const yBase = 40;

    firstPage.drawLine({
      start: { x: 50, y: yBase + 50 },
      end: { x: width - 50, y: yBase + 50 },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`Name: ${name}`, {
      x: 50,
      y: yBase + 35,
      size: 10,
      font,
    });

    firstPage.drawText(`Pay Date: ${paydate}    Check No: ${ckno}    Amount: ${amount}`, {
      x: 50,
      y: yBase + 20,
      size: 10,
      font,
    });

    firstPage.drawLine({
      start: { x: 50, y: yBase + 10 },
      end: { x: width - 50, y: yBase + 10 },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=child_support_view.pdf');
    res.send(pdfBytes);
  } catch (err) {
    console.error('Error generating Child Support PDF:', err);
    res.status(500).send('PDF generation failed');
  }
};

module.exports = generateChildspPDF;