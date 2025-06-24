
// 📁 server/src/utils/admin/account/generateApReportDF.js

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// 날짜 포맷 헬퍼: Date → 'YYYY-MM-DD'
const formatDate = (date) => {
  if (!date) return '';
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }
  // 문자열로 들어온 경우
  const d = new Date(date);
  if (isNaN(d)) return '';
  return d.toISOString().slice(0, 10);
};

/**
 * AP 리포트 PDF 생성
 * @param {object} res - Express response 객체
 * @param {object} options
 *    - beginning_amount: 숫자
 *    - monthly: [{ month_name, end_date, pur_sum, pay_sum, ap_sum }, ...]
 *    - year: 연도 (옵션)
 */
const generateApReportPDF = async (res, options) => {
  const { beginning_amount, monthly, year } = options;

  // 한글 폰트 경로 (프로젝트 public/fonts 또는 서버 리소스 위치에 따라 조정)
  const fontPath = path.join(__dirname, '../../../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    console.error('폰트 파일이 없습니다:', fontPath);
    return res.status(500).send('폰트 파일이 존재하지 않습니다.');
  }

  // PDFDocument 생성: margin, size, layout 등 설정
  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'portrait' });
  doc.registerFont('Korean', fontPath).font('Korean');

  // 응답 헤더 설정: inline 또는 attachment
  res.setHeader('Content-Type', 'application/pdf');
  // inline: 브라우저에서 바로 보기, attachment: 다운로드
  res.setHeader('Content-Disposition', `inline; filename=AP_Report_${year}.pdf`);
  doc.pipe(res);

  // 제목
  doc.fontSize(15).text(`AP Report - ${year}년`, { align: 'center' });
  doc.moveDown(0.5);

  // 시작잔액 표시
  doc.fontSize(12).text(`Beginning Amount: ${Number(beginning_amount).toLocaleString()}`, {
    align: 'left',
  });
  doc.moveDown(0.5);

  // 표 헤더 설정
  const headers = ['Month', 'End Date', 'Purchase', 'Payment', 'AP Report'];
  // 각 열 너비: landscape 너비에 맞춰 적절히 분배
  // 예시: 총 너비 = 페이지 폭 - 좌우 margin
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  // 비율로 나눌 수 있으나, 여기서는 고정 비율 예시
  const colWidths = [
    120,  // Month
    90,   // End Date
    110,  // Purchase
    110,  // Payment
    110,  // AP Report
  ];
  // 만약 총합이 pageWidth보다 작거나 크면 조정 필요. 간단히 합이 작으면 가운데 정렬, 크면 자동 줄 바꿈.
  // 여기서는 간단히 고정 너비 사용.

  // 표 그리기 시작 위치
  let y = doc.y + 5;
  const rowHeight = 20;
  const startX = doc.page.margins.left;

  // 헤더 그리기
  let x = startX;
  doc.fontSize(10).fillColor('black').lineWidth(0.2);
  headers.forEach((header, i) => {
    const w = colWidths[i] || 80;
    doc.rect(x, y, w, rowHeight).stroke();
    doc.text(header, x + 2, y + 3, { width: w - 4, align: 'center' });
    x += w;
  });
  y += rowHeight;

  // 데이터 행 그리기
  for (const row of monthly) {
    x = startX;
    // format each cell
    const dataRow = [
      row.month_name || '',
      formatDate(row.end_date),
      Number(row.pur_sum || 0).toLocaleString(),
      Number(row.pay_sum || 0).toLocaleString(),
      Number(row.ap_sum || 0).toLocaleString(),
    ];
    dataRow.forEach((cell, i) => {
      const w = colWidths[i] || 80;
      // 페이지 바닥 근처일 경우 새 페이지 추가
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
        // 새로운 페이지에도 헤더 다시 그리기
        let hx = startX;
        headers.forEach((h, hi) => {
          const hw = colWidths[hi] || 80;
          doc.rect(hx, y, hw, rowHeight).stroke();
          doc.text(h, hx + 2, y + 3, { width: hw - 4, align: 'center' });
          hx += hw;
        });
        y += rowHeight;
      }
      doc.rect(x, y, w, rowHeight).stroke();
      doc.text(cell, x + 2, y + 3, { width: w - 4, align: 'center' });
      x += w;
    });
    y += rowHeight;
  }

  doc.end();
};

module.exports = generateApReportPDF;
