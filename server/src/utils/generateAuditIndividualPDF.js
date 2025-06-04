const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateAuditIndividualPDF = async (res, payrecords, start, end) => {
  const fontPath = path.join(__dirname, '../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) return res.status(500).send('폰트 파일이 존재하지 않습니다.');

  if (!Array.isArray(payrecords) || payrecords.length === 0) {
    return res.status(400).send('유효한 데이터가 전달되지 않았습니다.');
  }

  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'portrait' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=individual_audit.pdf');
  doc.pipe(res);

  doc.fontSize(14).text('Payroll Audit by Individual', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Audit Period: ${start} ~ ${end}`);
  doc.moveDown(1);

  const grouped = payrecords.reduce((acc, cur) => {
    const key = `${cur.eid}||${cur.name}`;
    if (!acc[key]) acc[key] = { info: cur, rows: [] };
    acc[key].rows.push(cur);
    return acc;
  }, {});

  const headers = ['Date', 'Check No', 'Wages', 'RTime', 'O.Time', 'D.Time', 'Remark'];
  const colWidths = [60, 60, 60, 60, 60, 60, 100];
  const rowHeight = 14;  // ✅ 줄 높이 축소
  const startX = doc.page.margins.left;

  for (const key in grouped) {
    const { info, rows } = grouped[key];

    doc.fontSize(8).text(`EID: ${info.eid}   Name: ${info.name}   Job Title: ${info.jtitle}   Code: ${info.jcode}`);
   doc.moveDown(0.2);

    let x = startX;
    let y = doc.y;
    doc.fontSize(7).lineWidth(0.2);   // ✅ 글씨 및 선 두께 축소
    headers.forEach((h, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(h, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
      x += colWidths[i];
    });
    y += rowHeight;

    for (const r of rows) {
      // 페이지 끝에 가까우면 자동 새 페이지 + 헤더 재출력
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;

        x = startX;
        headers.forEach((h, i) => {
          doc.rect(x, y, colWidths[i], rowHeight).stroke();
          doc.text(h, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
          x += colWidths[i];
        });
        y += rowHeight;
      }

      x = startX;
      const vals = [
        r.pdate?.split('T')[0] || '',
        r.ckno || '',
        r.gross != null ? Number(r.gross).toFixed(2) : '',
        r.rtime != null ? Number(r.rtime).toFixed(2) : '',
        r.otime != null ? Number(r.otime).toFixed(2) : '',
        r.dtime != null ? Number(r.dtime).toFixed(2) : '',
        r.remark || ''
      ];
      vals.forEach((v, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(v, x + 2, y + 5, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }

    doc.moveDown(0.4);
  }

  doc.end();
};

module.exports = generateAuditIndividualPDF;
