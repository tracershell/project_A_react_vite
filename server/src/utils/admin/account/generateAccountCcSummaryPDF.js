//server/src/utils/admin/account/generateAccountCcSummaryPDF.js

const PDFDocument = require('pdfkit');

function generateAccountCcSummaryPDF(res, { pdate, ptname, pamount, anumber, provider, details }) {
  const formattedDate = pdate ? new Date(pdate).toISOString().slice(0, 10) : '';
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

  // 기본 위치 설정
  let y = 120;
  const leftX = 50;

  // 상단 가로선
  doc
    .moveTo(leftX - 10, y - 40)
    .lineTo(570, y - 40)
    .lineWidth(1)
    .stroke();

  // 헤더
  doc.fontSize(12).text(`# ${anumber}  :  ( ${provider || ''} )`, leftX, y);
  doc.fontSize(11).text(`Pay Date : ${formattedDate}`, leftX + 20, y + 40);
  doc.text(`Check No. : ${ptname || ''}`, leftX + 160, y + 40);
  doc.text(`Pay Amount : $${format(pamount)}`, leftX + 350, y + 40);

  // 하단 가로선
  doc
    .moveTo(leftX - 10, y + 100)
    .lineTo(570, y + 100)
    .lineWidth(1)
    .stroke();

  y += 200;

  // CATEGORIZATION 타이틀
  doc.fontSize(12).text(`CATEGORIZATION`, leftX + 50, y, { underline: true });
  y += 40;

  // 총합 계산
  const total = details.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);

  // 상세 항목 출력
  doc.fontSize(11);
  details.forEach(({ aitem, total }) => {
    doc.text(`${aitem}`, leftX + 100, y);
    doc.text(`$${format(total)}`, leftX + 300, y, {
      align: 'right',
      width: 50
    });
    y += 18;
  });

  // 총합 출력
  y += 20;
  doc.fontSize(11).text(`Total :`, leftX + 250, y);
  doc.text(`$${format(total)}`, leftX + 300, y, {
    align: 'right',
    width: 50
  });

  doc.end();
}

module.exports = generateAccountCcSummaryPDF;
