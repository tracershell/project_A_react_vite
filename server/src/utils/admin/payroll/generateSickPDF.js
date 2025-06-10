const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateSickPDF = async (res, records) => {
  const fontPath = path.join(__dirname, '../../../public/fonts/NotoSansKR-Regular.ttf');

  if (!records || !Array.isArray(records)) {
    return res.status(400).send('records 배열이 필요합니다.');
  }

  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'landscape' });

  try {
    if (fs.existsSync(fontPath)) {
      doc.registerFont('Korean', fontPath);
      doc.font('Korean');
    } else {
      doc.font('Helvetica');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=sick_summary_${Date.now()}.pdf`);
    doc.pipe(res);

    // Title
    doc.fontSize(12).text('Sick Summary Report', { align: 'center' }).moveDown(1);

    // Header row (Sick Only)
    const headers = ['EID', 'Name', 'Given', 'Remain', ...Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString('en-US', { month: 'short' })
    )];
    const colWidths = [40, 100, 42, 42, ...Array(12).fill(42)];
    const rowHeight = 13;
    const startX = doc.page.margins.left;
    doc.fontSize(8).lineWidth(0.4);
    let y = doc.y + 4;

    const drawRow = (rowData) => {
      let x = startX;
      rowData.forEach((cell, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(cell, x + 2, y + 3, { width: colWidths[i] - 4, align: 'center' });

        // 특정 선만 0.5로 다시 그리기
    if (i === 2) { // 'Given' 왼쪽
      doc.save()
        .lineWidth(0.6)
        .moveTo(x, y)
        .lineTo(x, y + rowHeight)
        .stroke()
        .restore();
    }
    if (i === 3) { // 'Remain' 오른쪽
      const rightX = x + colWidths[i];
      doc.save()
        .lineWidth(0.6)
        .moveTo(rightX, y)
        .lineTo(rightX, y + rowHeight)
        .stroke()
        .restore();
    }
    
        x += colWidths[i];
      });
      y += rowHeight;
    };

    // Draw header
    drawRow(headers);

    // Draw records (Sick Only)
    records.forEach(row => {
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
        drawRow(headers);
      }
      const dataRow = [
        row.EID || '',
        row.NAME || '',
        Number(row.SickGiven || 0).toFixed(2),
        Number(row.SickRemain || 0).toFixed(2),
        ...Array.from({ length: 12 }, (_, i) => {
          const mon = new Date(0, i).toLocaleString('en-US', { month: 'short' });
          const key = `${mon}_S`;
          return Number(row[key] || 0).toFixed(2);
        })
      ];
      drawRow(dataRow);
    });

    doc.end();
  } catch (err) {
    console.error('PDF 생성 중 오류:', err);
    res.end();
  }
};

module.exports = generateSickPDF;