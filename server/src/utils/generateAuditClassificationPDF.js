// server/src/utils/generateAuditClassificationPDF.js

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * Classification(분류별) PDF 생성
 * - res: Express 응답 객체
 * - payrecords: 프론트에서 전달한 payrecords 배열
 * - start, end: 기간 문자열
 *
 * 각 그룹(job code)마다 테이블을 그리고,
 * 테이블 하단에 Wages, R.Time, O.Time, D.Time 합계를 표시합니다.
 * 테이블에서 Remark 열은 완전히 제거되었습니다.
 */
const generateAuditClassificationPDF = async (res, payrecords, start, end) => {
  // 한글 폰트 경로
  const fontPath = path.join(__dirname, '../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    return res.status(500).send('폰트 파일이 존재하지 않습니다.');
  }

  if (!Array.isArray(payrecords) || payrecords.length === 0) {
    return res.status(400).send('유효한 데이터가 전달되지 않았습니다.');
  }

  // PDF 기본 세팅
  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'portrait' });
  doc.registerFont('Korean', fontPath).font('Korean');

  // 브라우저로 스트리밍
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=classification_audit.pdf');
  doc.pipe(res);

  // 타이틀
  doc.fontSize(12).text('Wages by Classification', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(8).text(`Period: ${start} ~ ${end}`, { align: 'left' });
  doc.moveDown(1);

  // 1) payrecords를 서버에서도 job code별로 그룹핑
  const grouped = payrecords.reduce((acc, cur) => {
    const key = cur.jcode;
    if (!acc[key]) acc[key] = { code: cur.jcode, title: cur.jtitle, rows: [] };
    acc[key].rows.push(cur);
    return acc;
  }, {});

  // 2) 테이블 컬럼 정의 (Remark 삭제)
  const headers = [
    'Pay Date',
    'Check No',
    'EID',
    'Name',
    'Job Title',
    'Wages',
    'Regular Time',
    'Over Time',
    'DoubleTime'
  ];
  // 열 개수가 9개로 줄었으므로 colWidths 배열도 9개로 맞춥니다.
  const colWidths = [50, 50, 30, 90, 90, 60, 60, 60, 60];
  const rowHeight = 14;
  const startX = doc.page.margins.left;
  const pageBottom = doc.page.height - doc.page.margins.bottom;

  // 숫자 포맷 헬퍼 (천단위 콤마 + 소수점 2자리)
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // 3) job code별로 섹션을 나누어 출력
  for (const key in grouped) {
    const { code, title, rows } = grouped[key];

    // 3-1) Job Code / Title 출력
    doc.fontSize(8).text(`Classification Code: ${code}`, startX, doc.y);
    const topY = doc.y + 2;

    // 3-2) 테이블 헤더 그리기
    let x = startX;
    let y = topY;
    doc.fontSize(7).lineWidth(0.2);
    headers.forEach((h, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(h, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
      x += colWidths[i];
    });
    y += rowHeight;

    // 3-3) 각 그룹(rows) 안의 각 행을 순회하며 테이블 본문에 찍기
    //     이때 합계를 구하기 위한 변수도 함께 초기화
    let totalWages = 0;
    let totalRTime = 0;
    let totalOTime = 0;
    let totalDTime = 0;

    for (const r of rows) {
      // 페이지 끝에서 다음 페이지로 넘어갈지 체크
      if (y + rowHeight > pageBottom) {
        doc.addPage();
        y = doc.page.margins.top;
        doc.y = y;

        // 새 페이지에서 머리글 재출력
        x = startX;
        headers.forEach((h, i) => {
          doc.rect(x, y, colWidths[i], rowHeight).stroke();
          doc.text(h, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
          x += colWidths[i];
        });
        y += rowHeight;
      }

      // 각 컬럼 데이터를 문자열로 변환
      const dateStr =
        typeof r.pdate === 'string'
          ? r.pdate.split('T')[0]
          : r.pdate instanceof Date
            ? r.pdate.toISOString().split('T')[0]
            : '';

      const wageVal = r.gross != null ? Number(r.gross) : 0;
      const rtimeVal = r.rtime != null ? Number(r.rtime) : 0;
      const otimeVal = r.otime != null ? Number(r.otime) : 0;
      const dtimeVal = r.dtime != null ? Number(r.dtime) : 0;

      // 합계 누적
      totalWages += wageVal;
      totalRTime += rtimeVal;
      totalOTime += otimeVal;
      totalDTime += dtimeVal;

      const vals = [
        dateStr,
        r.ckno || '',
        r.eid || '',
        r.name || '',
        r.jtitle || '',
        formatNumber(wageVal.toFixed(2)),
        formatNumber(rtimeVal.toFixed(2)),
        formatNumber(otimeVal.toFixed(2)),
        formatNumber(dtimeVal.toFixed(2))
      ];

      x = startX;
      vals.forEach((v, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(v, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }

    // 3-4) 테이블 행(데이터) 출력이 끝난 후 “합계 행”을 그리기 전 페이지 여부 체크
    if (y + rowHeight > pageBottom) {
      doc.addPage();
      y = doc.page.margins.top;
      doc.y = y;

      // 새 페이지에서 머리글 재출력
      x = startX;
      headers.forEach((h, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(h, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }

    // 3-5) “합계 행” 그리기
    x = startX;
    doc.fontSize(7).lineWidth(0.2);

    // (1) 앞 5개 열을 합쳐서 “Total” 레이블 셀로 만들기
    const mergedWidth = colWidths.slice(0, 5).reduce((a, b) => a + b, 0);
    doc.rect(x, y, mergedWidth, rowHeight).stroke();
    doc.text('Total', x + 2, y + 2, { width: mergedWidth - 4, align: 'center' });
    x += mergedWidth;

    // (2) 합계값 셀들 (Wages, R.Time, O.Time, D.Time) 출력
    const totalVals = [
      formatNumber(totalWages.toFixed(2)),
      formatNumber(totalRTime.toFixed(2)),
      formatNumber(totalOTime.toFixed(2)),
      formatNumber(totalDTime.toFixed(2))
    ];
    // colIndexes: 5 → Wages, 6 → R.Time, 7 → O.Time, 8 → D.Time
    totalVals.forEach((tv, idx) => {
      const colIdx = idx + 5;
      doc.rect(x, y, colWidths[colIdx], rowHeight).stroke();
      doc.text(tv, x + 2, y + 2, { width: colWidths[colIdx] - 4, align: 'center' });
      x += colWidths[colIdx];
    });

    y += rowHeight;

    // 3-6) 다음 그룹을 위해 cursor 위치(문단 커서) 갱신
    doc.y = y + 4;   // 합계 행 끝에서 약간의 여백(4pt)을 더한다
    doc.moveDown(1); // 그룹 간 간격을 1줄 정도 띄운다
  }

  doc.end();
};

module.exports = generateAuditClassificationPDF;
