// server/src/utils/generatePayrollAuditAllPDF.js

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * Payroll Audit 전체 요약 PDF 생성
 * - res: Express 응답 객체
 * - records: DB에서 조회한 레코드 배열
 * - start, end: 감사 기간 문자열
 */
const generatePayrollAuditAllPDF = async (res, records, start, end) => {
  const fontPath = path.join(__dirname, '../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    return res.status(500).send('폰트 파일이 존재하지 않습니다.');
  }

  // 숫자 포맷 헬퍼 (천단위 콤마 + 소수점 2자리)
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // PDFDocument 초기화 (portrait 모드)
  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'portrait' });
  doc.registerFont('Korean', fontPath).font('Korean');

  // 브라우저로 PDF 스트리밍
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=payroll_audit_all.pdf');
  doc.pipe(res);

  // --- 타이틀 및 기간 정보 ---
  doc.fontSize(12).text('Payroll Summary by Period', { align: 'center' });
  doc.moveDown(0.4);
  doc.fontSize(8).text(`Audit Period: ${start} ~ ${end}`);
  doc.moveDown(1);

  // --- 테이블 헤더 설정 ---
  const headers = ['Pay Date', 'Check No', 'EID', 'Name', 'J.Title', 'J.Code', 'Wages', 'R.Time', 'O.Time', 'D.Time'];
  // 컬럼 너비(px)
  const colWidths = [50, 50, 35, 90, 90, 35, 50, 50, 50, 50];

  const startX = doc.page.margins.left;
  let y = doc.y;
  const rowHeight = 18;

  // 테두리 선을 더 가늘게 (0.2pt)
  doc.fontSize(8).lineWidth(0.2);

  // --- 헤더 출력 ---
  let x = startX;
  headers.forEach((h, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).stroke();
    doc.text(h, x + 2, y + 3, { width: colWidths[i] - 4, align: 'center' });
    x += colWidths[i];
  });
  y += rowHeight;

  // --- 합계 계산 변수 초기화 ---
  let totalWages = 0;
  let totalRTime = 0;
  let totalOTime = 0;
  let totalDTime = 0;

  // --- 데이터 행 출력 ---
  for (const r of records) {
    // 페이지 넘침 체크
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      doc.fontSize(8).lineWidth(0.2);
      y = doc.page.margins.top;

      // 새 페이지에서 헤더 재출력
      x = startX;
      headers.forEach((h, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(h, x + 2, y + 3, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }

    // 수치형 필드 합계 누적
    const wVal = Number(r.gross)   || 0;
    const rtVal = Number(r.rtime)   || 0;
    const otVal = Number(r.otime)   || 0;
    const dtVal = Number(r.dtime)   || 0;
    totalWages  += wVal;
    totalRTime  += rtVal;
    totalOTime  += otVal;
    totalDTime  += dtVal;

    // 각 열에 들어갈 값 (문자열)
    const values = [
      r.pdate?.toISOString().split('T')[0] || '',
      r.ckno || '',
      r.eid || '',
      r.name || '',
      r.jtitle || '',
      r.jcode || '',
      // 천 단위 콤마를 포함한 문자열로 변환
      formatNumber(wVal.toFixed(2)),
      formatNumber(rtVal.toFixed(2)),
      formatNumber(otVal.toFixed(2)),
      formatNumber(dtVal.toFixed(2))
    ];

    // 한 행씩 출력
    x = startX;
    values.forEach((val, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(val, x + 2, y + 3, { width: colWidths[i] - 4, align: 'center' });
      x += colWidths[i];
    });
    y += rowHeight;
  }

  // --- 합계 행 출력 전 페이지 넘침 체크 ---
  if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
    doc.fontSize(8).lineWidth(0.2);
    y = doc.page.margins.top;

    // 헤더 재출력
    x = startX;
    headers.forEach((h, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(h, x + 2, y + 3, { width: colWidths[i] - 4, align: 'center' });
      x += colWidths[i];
    });
    y += rowHeight;
  }

  // --- 총합계 행 ---
  x = startX;
  doc.fontSize(8).lineWidth(0.2);

  // (1) 나머지 컬럼과 구분하기 위해 "Total" 레이블을 첫 번째 컬럼에 병합 없이 출력
  doc.rect(x, y, colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], rowHeight).stroke();
  doc.text('Total', x + 2, y + 3, {
    width: (colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5]) - 4,
    align: 'center'
  });
  // x 좌표를 합친 너비만큼 이동 (Pay Date~J.Code 부분을 모두 합친 너비)
  x += colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5];

  // (2) Wages 합계
  doc.rect(x, y, colWidths[6], rowHeight).stroke();
  doc.text(formatNumber(totalWages.toFixed(2)), x + 2, y + 3, { width: colWidths[6] - 4, align: 'center' });
  x += colWidths[6];

  // (3) R.Time 합계
  doc.rect(x, y, colWidths[7], rowHeight).stroke();
  doc.text(formatNumber(totalRTime.toFixed(2)), x + 2, y + 3, { width: colWidths[7] - 4, align: 'center' });
  x += colWidths[7];

  // (4) O.Time 합계
  doc.rect(x, y, colWidths[8], rowHeight).stroke();
  doc.text(formatNumber(totalOTime.toFixed(2)), x + 2, y + 3, { width: colWidths[8] - 4, align: 'center' });
  x += colWidths[8];

  // (5) D.Time 합계
  doc.rect(x, y, colWidths[9], rowHeight).stroke();
  doc.text(formatNumber(totalDTime.toFixed(2)), x + 2, y + 3, { width: colWidths[9] - 4, align: 'center' });
  x += colWidths[9];

  // 한 행 높이만큼 내려주기
  y += rowHeight;

  // --- PDF 스트리밍 종료 ---
  doc.end();
};

module.exports = generatePayrollAuditAllPDF;
