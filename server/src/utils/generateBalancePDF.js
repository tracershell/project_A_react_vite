const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateBalancePDF = async (res, records, info = {}) => {
  const fontPath = path.join(__dirname, '../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) return res.status(500).send('폰트 파일이 존재하지 않습니다.');

  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'landscape' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=balance_pay_list.pdf');
  doc.pipe(res);

  doc.font('Korean').fontSize(13).text('Balance Pay List', { align: 'center' });
  doc.moveDown(0.5);

  doc.font('Korean').fontSize(9).text(records[0]?.vendor_name || '-', {
    align: 'left',
    continued: false
  });
  doc.font('Korean').text(
    `Pay Date: ${info.date || '-'}   Exchange Rate: ${info.exrate || '-'}`,
    { align: 'right' }
  );
  doc.moveDown(1);

  const headers = ['PO Date', 'Style', 'PO No', 'pcs', 'cost(RMB)', 'T.Amount(RMB)', 'DP Amount(RMB)', 'BP Amount(RMB)', 'BP E.rate', 'BP Amount(USD)', 'Comment'];
  const colWidths = [60, 60, 110, 40, 50, 80, 80, 80, 50, 80, 120];
  const startX = doc.page.margins.left;
  let y = doc.y + 5;
  const rowHeight = 16;

  let x = startX;
  doc.fontSize(8).lineWidth(0.4).fillColor('black');
  headers.forEach((header, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).stroke();
    doc.text(header, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
    x += colWidths[i];
  });
  y += rowHeight;

  let totalRmb = 0, totalUsd = 0;
  records.forEach(row => {
    x = startX;
    const t_amount = Number(row.pcs) * Number(row.cost_rmb);
    const dp_amount_rmb = Number(row.dp_amount_rmb || 0);
    const bp_amount_rmb = Number(row.bp_amount_rmb || 0);
    const bp_amount_usd = Number(row.bp_amount_usd || 0);
    const bp_exrate = row.bp_exrate ? parseFloat(row.bp_exrate).toFixed(3) : '';

    const dataRow = [
      row.po_date ? String(row.po_date).slice(0, 10) : '',
      row.style_no || '',
      row.po_no || '',
      Number(row.pcs || 0).toLocaleString(),
      Number(row.cost_rmb || 0).toFixed(2),
      t_amount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      dp_amount_rmb.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      bp_amount_rmb.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      bp_exrate,
      bp_amount_usd.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      row.comment || ''
    ];

    totalRmb += bp_amount_rmb;
    totalUsd += bp_amount_usd;

    dataRow.forEach((cell, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(cell, x + 2, y + 2, {
        width: colWidths[i] - 4,
        align: (i >= 3 && i <= 9) ? 'center' : 'center'
      });
      x += colWidths[i];
    });
    y += rowHeight;

    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      doc.font('Korean').fontSize(8).lineWidth(0.4);
      y = doc.page.margins.top;
      x = startX;
      headers.forEach((header, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(header, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }
  });

  x = startX;
  const totalRow = [
    'TOTAL', '', '', '', '', '', '',
    totalRmb.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    '',
    totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    ''
  ];
  totalRow.forEach((cell, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).stroke();
    doc.text(cell, x + 2, y + 2, {
      width: colWidths[i] - 4,
      align: (i >= 3 && i <= 9) ? 'center' : 'center'
    });
    x += colWidths[i];
  });
  y += rowHeight;

  doc.moveTo(startX, y + 6)
    .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y + 6)
    .strokeColor('red').lineWidth(1).stroke();
  doc.strokeColor('black').lineWidth(0.4);

  doc.font('Korean').fontSize(11).fillColor('darkred').text(
    `Total Balance : ${totalRmb.toLocaleString(undefined, { minimumFractionDigits: 2 })} (RMB)   ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })} (USD)`,
    startX,
    y + 12,
    { align: 'right', width: colWidths.reduce((a, b) => a + b, 0) }
  );

  doc.end();
};

module.exports = generateBalancePDF;
