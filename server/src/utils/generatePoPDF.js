const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generatePoPDF = async (res, records) => {
  const fontPath = path.join(__dirname, '../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) return res.status(500).send('폰트 파일이 존재하지 않습니다.');

  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'landscape' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=po_list.pdf');
  doc.pipe(res);

  doc.fontSize(13).text('Import PO List', { align: 'center' });
  doc.moveDown(1);

  const headers = ['PO Date', 'Deposit', 'Style', 'PO No', 'PCS', 'Cost', 'Total', 'Deposit', 'Status', 'Balance', 'Status'];
  const colWidths = [70, 50, 90, 90, 50, 50, 80, 80, 50, 80, 50];
  const startX = doc.page.margins.left;
  const rowHeight = 16;

  const grouped = {};
  records.forEach(r => {
    if (!grouped[r.vendor_name]) grouped[r.vendor_name] = [];
    grouped[r.vendor_name].push(r);
  });

  let y = doc.y + 5;
  for (const [vendorName, rows] of Object.entries(grouped)) {
    doc.fontSize(10).text(`□ ${vendorName}`, startX, y);
    y += rowHeight;

    let x = startX;
    doc.fontSize(8).lineWidth(0.4);
    headers.forEach((header, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(header, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
      x += colWidths[i];
    });
    y += rowHeight;

    // ✅ 그룹별 합계 누적용 변수
    let groupTAmount = 0, groupDp = 0, groupBp = 0;

    for (const row of rows) {
      x = startX;
      const t_amount = Number(row.pcs || 0) * Number(row.cost_rmb || 0);
      const dp_amount_rmb = Number(row.dp_amount_rmb || 0);
      let bp_amount_rmb = Number(row.bp_amount_rmb || 0);

      // ✅ 조건에 따른 BP 보정 계산
      if (row.dp_status === 'paid' && row.bp_status !== 'paid' && t_amount > 0) {
        bp_amount_rmb = t_amount - dp_amount_rmb;
      }

      // ✅ 그룹합계 누적
      groupTAmount += t_amount;
      groupDp += dp_amount_rmb;
      groupBp += bp_amount_rmb;

      const dataRow = [
        row.po_date?.slice(0, 10) || '',
        row.deposit_rate != null ? row.deposit_rate + '%' : '',
        row.style_no || '',
        row.po_no || '',
        Number(row.pcs || 0).toLocaleString(),
        Number(row.cost_rmb || 0).toFixed(2),
        t_amount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        dp_amount_rmb.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        row.dp_status || '',
        bp_amount_rmb.toLocaleString(undefined, { minimumFractionDigits: 2 }),
        row.bp_status || ''
      ];

      dataRow.forEach((cell, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(cell, x + 2, y + 2, {
          width: colWidths[i] - 4,
          align: 'center'
        });
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

    // ✅ 그룹 합계 행 출력
    x = startX;
    const groupTotalRow = [
      'TOTAL', '', '', '', '', '',
      groupTAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      '', '',
      groupBp.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      ''
    ];

    groupTotalRow.forEach((cell, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(cell, x + 2, y + 2, {
        width: colWidths[i] - 4,
        align: 'center'
      });
      x += colWidths[i];
    });
    y += rowHeight;

    // ✅ 그룹 간격 추가
    y += 2 * rowHeight;
  }

  doc.end();
};

module.exports = generatePoPDF;
