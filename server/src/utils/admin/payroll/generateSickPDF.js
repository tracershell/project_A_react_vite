const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateSickPDF = async (res, records) => {
  const fontPath = path.join(__dirname, '../../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    return res.status(500).send('폰트 파일이 존재하지 않습니다.');
  }

  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'landscape' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=sick_summary.pdf');
  doc.pipe(res);

  doc.fontSize(13).text('Sick Summary Report', { align: 'center' });
  doc.moveDown(1);

  const headers = [
    'EID',
    'Name',
    'Sick Given',
    'Sick Remain',
    ...Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('en-US', { month: 'short' })),
  ];
  const colWidths = [40, 100, 70, 70, ...Array(12).fill(40)];
  const rowHeight = 16;
  const startX = doc.page.margins.left;

  let y = doc.y + 5;

  // 헤더 출력
  let x = startX;
  doc.fontSize(8).lineWidth(0.4);
  headers.forEach((header, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).stroke();
    doc.text(header, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
    x += colWidths[i];
  });
  y += rowHeight;

  // 데이터 출력
  for (const row of records) {
    x = startX;
    const dataRow = [
      row.EID || '',
      row.NAME || '',
      Number(row.SickGiven || 0).toFixed(2),
      Number(row.SickRemain || 0).toFixed(2),
      ...Array.from({ length: 12 }, (_, i) => {
        const monthKey = `${new Date(0, i).toLocaleString('en-US', { month: 'short' })}_S`;
        return Number(row[monthKey] || 0).toFixed(2);
      }),
    ];

    dataRow.forEach((cell, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(cell, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
      x += colWidths[i];
    });
    y += rowHeight;

    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
      x = startX;
      headers.forEach((header, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(header, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }
  }

  // 합계 행 추가
  const totalSickGiven = records.reduce((sum, row) => sum + Number(row.SickGiven || 0), 0);
  const totalSickRemain = records.reduce((sum, row) => sum + Number(row.SickRemain || 0), 0);
  const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
    const monthKey = `${new Date(0, i).toLocaleString('en-US', { month: 'short' })}_S`;
    return records.reduce((sum, row) => sum + Number(row[monthKey] || 0), 0);
  });

  x = startX;
  const totalRow = [
    'TOTAL',
    '',
    totalSickGiven.toFixed(2),
    totalSickRemain.toFixed(2),
    ...monthlyTotals.map(total => total.toFixed(2)),
  ];
  totalRow.forEach((cell, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).stroke();
    doc.text(cell, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
    x += colWidths[i];
  });

  doc.end();
};

module.exports = generateSickPDF;