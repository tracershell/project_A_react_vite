// server/src/utils/generateDepositPDF.js
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateDepositPDF = async (res, records, info = {}) => {
  // 한글 폰트 경로 (직원 PDF와 동일)
  const fontPath = path.join(__dirname, '../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    return res.status(500).send('폰트 파일이 존재하지 않습니다.');
  }

  // PDF 기본 세팅
  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'landscape' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=deposit_pay_list.pdf');
  doc.pipe(res);

  // 제목 및 상단 정보
  doc.fontSize(12).text(`Deposit Pay List`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(9).text(
    `Pay Date: ${info.date || '-'}    Exchange Rate: ${info.exrate || '-'}`,
    { align: 'left' }
  );
  doc.moveDown(0.5);

  // 헤더/열 너비 정의
  const headers = [
    'Vendor Name', 'PO No', 'Style', 'DP Amount(RMB)', 'DP Amount(USD)', 'DP E.rate', 'DP Date', 'Comment'
  ];
  const colWidths = [80, 60, 60, 80, 80, 55, 65, 120];
  const startX = doc.page.margins.left;
  let y = doc.y + 8;
  const rowHeight = 20;

  // 헤더 그리기
  let x = startX;
  doc.fontSize(8).lineWidth(0.4).fillColor('black');
  headers.forEach((header, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).stroke();
    doc.text(header, x + 2, y + 5, { width: colWidths[i] - 4, align: 'center' });
    x += colWidths[i];
  });
  y += rowHeight;

  // 데이터 출력
  let totalRmb = 0, totalUsd = 0;
  records.forEach(row => {
    x = startX;
    const dataRow = [
      row.vendor_name || '',
      row.po_no || '',
      row.style_no || '',
      row.dp_amount_rmb || '',
      row.dp_amount_usd || '',
      row.dp_exrate || '',
      row.dp_date ? (typeof row.dp_date === 'string' ? row.dp_date : row.dp_date.toISOString().slice(0, 10)) : '',
      row.comment || ''
    ];

    // 합계용
    if (Number(row.dp_amount_rmb)) totalRmb += Number(row.dp_amount_rmb);
    if (row.dp_amount_usd && !isNaN(Number(row.dp_amount_usd))) totalUsd += Number(row.dp_amount_usd);

    dataRow.forEach((cell, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(cell !== undefined && cell !== null ? String(cell) : '', x + 2, y + 5, {
        width: colWidths[i] - 4,
        align: (i === 3 || i === 4) ? 'right' : 'center'
      });
      x += colWidths[i];
    });
    y += rowHeight;

    // 페이지 넘김 체크
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      doc.font('Korean').fontSize(8).lineWidth(0.4);
      y = doc.page.margins.top;
      x = startX;
      headers.forEach((header, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(header, x + 2, y + 5, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }
  });

  // 합계 표시 (마지막에 붉은 선, 강조)
  doc.moveTo(startX, y + 7)
    .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y + 7)
    .strokeColor('red').lineWidth(1).stroke();
  doc.strokeColor('black').lineWidth(0.4);

  doc.font('Korean').fontSize(11).fillColor('darkred').text(
    `Total Deposit : ${totalRmb.toLocaleString()} (RMB)   ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })} (USD)`,
    startX, y + 14,
    { align: 'right', width: colWidths.reduce((a, b) => a + b, 0) }
  );

  doc.end();
};

module.exports = generateDepositPDF;
