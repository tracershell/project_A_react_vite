const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateBankBalancePDF = async (res, rows) => {
  const doc = new PDFDocument({ size: 'letter', layout: 'portrait', margin: 40 });

  const fontPath = path.resolve('public/fonts/NotoSansKR-Regular.ttf');
  if (fs.existsSync(fontPath)) {
    doc.registerFont('Korean', fontPath).font('Korean');
  } else {
    doc.font('Helvetica');
  }

  const todayStr = new Date().toLocaleDateString('en-US');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=bankbalance.pdf');
  doc.pipe(res);

  // ✅ Header
  doc.fontSize(10).text('ARGUS US INC', { align: 'left' });
  doc.fontSize(16).text('Bank Balance', { align: 'center' });
  doc.fontSize(10).text(todayStr, { align: 'right' });
  doc.moveDown(1);
  doc.moveTo(40, doc.y).lineTo(575, doc.y).stroke(); // 상단 가로줄
  doc.moveDown(3);

  // ✅ row 정렬 + 그룹화
  const sorted = rows.filter(r => r.category && r.item);
  const groups = {};
  const groupOrder = [];

  sorted.forEach(r => {
    const key = r.category || '기타';
    if (!groups[key]) {
      groups[key] = [];
      groupOrder.push(key);
    }
    groups[key].push(r);
  });

  let y = doc.y;
  const indentX = 56; // 4rem 오른쪽으로 이동
  let isFirstGroup = true;

  for (const cat of groupOrder) {
    // ✅ 그룹 간 여백 강제 보장
    if (!isFirstGroup) {
      y += 42;  // 📌 3rem 여백 수동으로 적용
    } else {
      isFirstGroup = false;
    }

    // ✅ 카테고리 박스
    const boxX = 70;
    const boxY = y;
    const boxWidth = 100;
    const boxHeight = 18;

    doc.rect(boxX, boxY, boxWidth, boxHeight).stroke();
    doc.lineWidth(0.5);  // 기본값은 1 → 0.5로 줄이면 가늘어집니다.
    doc.fontSize(11).text(cat, boxX, boxY + 0, { width: boxWidth, align: 'center' }); // ✅ Group box 안 글자 살짝 위로 boxY + 2 -> boxY + 0
    y = boxY + boxHeight + 6;

    // ✅ 그룹 내 아이템 출력 (모두 indentX 만큼 오른쪽으로 이동)
    groups[cat].forEach(row => {
      const amount = parseFloat(row.amount || 0);
      const formattedAmount =
        amount < 0
          ? `($${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })})`
          : `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      const amountColor = amount < 0 ? 'red' : 'black';

      doc.fontSize(10).fillColor('black').text(`- ${row.item}`, 120 + indentX, y);
      doc.fillColor(amountColor).text(formattedAmount, 300 + indentX, y, { width: 80, align: 'right' });
      doc.fillColor('black').text(row.comment || '', 400 + indentX, y, { width: 160 });

      y += 14;
    });
  }

  // ✅ 하단 고정 가로줄
  const bottomY = 760;
  doc.moveTo(40, bottomY).lineTo(575, bottomY).stroke();

  doc.end();
};

module.exports = generateBankBalancePDF;
