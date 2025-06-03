// server/src/utils/generatePayrollTaxAuditPDF.js

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generatePayrollTaxAuditPDF = async (res, grouped, start, end, isDownload = false) => {
  const fontPath = path.join(__dirname, '../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    return res.status(500).send('폰트 파일이 존재하지 않습니다.');
  }

  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'landscape' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `${isDownload ? 'attachment' : 'inline'}; filename=payroll_tax_audit.pdf`
  );
  doc.pipe(res);

  const headers = ['EID', 'Name', 'Job Title', 'Job Code', 'Wages', 'Regular Time', '1.5 Times', '2 Times'];
  const colWidths = [50, 160, 180, 60, 70, 70, 70, 70];
  const rowHeight = 16;

  const drawRow = (data, y) => {
    let x = doc.page.margins.left;
    data.forEach((text, i) => {
      doc.lineWidth(0.3);
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.fontSize(7).text(String(text), x + 2, y + 3, {
        width: colWidths[i] - 4,
        align: 'center',
        ellipsis: true
      });
      x += colWidths[i];
    });
  };

  const checkPageEnd = (y) => {
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      return doc.page.margins.top;
    }
    return y;
  };

  let y = 40;
  doc.fontSize(10).text('ARGUS US INC.', { align: 'left' });
  doc.fontSize(10).text('Payroll Tax Audit Summary', { align: 'center' });
  doc.fontSize(8).text(`기간: ${start} ~ ${end}`, doc.page.width - 200, 40, { align: 'right' });
  y += 40;

  drawRow(headers, y);
  y += rowHeight;

  for (const key in grouped) {
    const list = grouped[key];
    const [eid, name] = key.split('||');
    const jtitle = list[0].jtitle || '';
    const jcode = list[0].jcode || '';
    let gross = 0, rtime = 0, otime = 0, dtime = 0;

    list.forEach(row => {
      gross += parseFloat(row.gross || 0);
      rtime += parseFloat(row.rtime || 0);
      otime += parseFloat(row.otime || 0);
      dtime += parseFloat(row.dtime || 0);
    });

    y = checkPageEnd(y);
    drawRow([
      eid,
      name,
      jtitle,
      jcode,
      gross.toFixed(2),
      rtime.toFixed(2),
      otime.toFixed(2),
      dtime.toFixed(2)
    ], y);
    y += rowHeight;
  }

  doc.end();
};

module.exports = generatePayrollTaxAuditPDF;
