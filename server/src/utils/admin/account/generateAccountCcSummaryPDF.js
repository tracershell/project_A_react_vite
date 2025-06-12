const PDFDocument = require('pdfkit');

function generateAccountCcSummaryPDF(res, { pdate, ptname, pamount, anumber, details }) {
  const doc = new PDFDocument({ size: 'LETTER', layout: 'portrait', margin: 40 });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=cc_summary.pdf');
    res.send(pdfData);
  });

  const format = (num) =>
    Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // 헤더
  doc.fontSize(12).text(`# ${anumber}`, { align: 'left' });
  doc.moveDown(0.5);
  doc.text(`Pay Date : ${pdate}      Check No. : ${ptname || ''}      Pay Amount : $${format(pamount)}`);
  doc.moveDown(1);

  // 총액
  const total = details.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
  doc.fontSize(11).text(`Electronic Debits : $${format(total)}`, { align: 'left' });
  doc.text(`${format(total)}`, { align: 'right' });
  doc.moveDown(1);

  // CATEGORIZATION 타이틀
  doc.fontSize(12).text(`CATEGORIZAION`, { underline: true });
  doc.moveDown(0.5);

  // 상세 항목 출력
  doc.fontSize(10);
  details.forEach(({ aitem, total }) => {
    doc.text(`_${aitem}  $${format(total)}`);
  });

  // 총합 하단 표시
  doc.moveDown(1);
  doc.fontSize(11).text(`$${format(total)}`, { align: 'right' });

  doc.end();
}

module.exports = generateAccountCcSummaryPDF;
