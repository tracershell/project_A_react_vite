// 📁 server/src/utils/admin/account/generateBankBalancePDF.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateBankBalancePDF = async (res, rows) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // ✅ 폰트 설정 (Korean 또는 Helvetica fallback)
  const fontPath = path.resolve('public/fonts/cour.ttf');
  if (fs.existsSync(fontPath)) {
    doc.registerFont('Korean', fontPath).font('Korean');
  } else {
    doc.font('Helvetica');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=bankbalance.pdf');
  doc.pipe(res);

  doc.fontSize(16).text('Bank Balance Summary', { align: 'center' });
  doc.moveDown();

  // ✅ row_index 기준 정렬
  const sorted = rows
    .filter(r => r.category && r.item)
    .map((r, idx) => ({
      ...r,
      row_index: idx + 1,
    }));

  // ✅ category 기준 그룹핑 (단, row_index 순서 유지)
  const groupOrder = [];
  const groups = {};

  sorted.forEach(r => {
    const cat = r.category || '기타';
    if (!groups[cat]) {
      groups[cat] = [];
      groupOrder.push(cat);
    }
    groups[cat].push(r);
  });

  // ✅ 출력: 그룹 순서대로 (정렬된 row_index 유지)
  for (const cat of groupOrder) {
    doc.moveDown().fontSize(12).text(`❇️ ${cat}`, { underline: true });

    groups[cat].forEach(item => {
      const amountStr = `$${parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      const line = `- ${item.item.padEnd(20)} ${amountStr.padStart(10)}   ${item.comment || ''}`;
      doc.fontSize(10).text(line);
    });
  }

  doc.end();
};

module.exports = generateBankBalancePDF;
