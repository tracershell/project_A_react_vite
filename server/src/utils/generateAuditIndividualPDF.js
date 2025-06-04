// server/src/utils/generateAuditIndividualPDF.js

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateAuditIndividualPDF = async (res, payrecords, start, end) => {
  const fontPath = path.join(__dirname, '../../public/fonts/NotoSansKR-Regular.ttf');
  if (!fs.existsSync(fontPath)) return res.status(500).send('폰트 파일이 존재하지 않습니다.');

  if (!Array.isArray(payrecords) || payrecords.length === 0) {
    return res.status(400).send('유효한 데이터가 전달되지 않았습니다.');
  }

  // PDF 기본 세팅
  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'portrait' });
  doc.registerFont('Korean', fontPath).font('Korean');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=individual_audit.pdf');
  doc.pipe(res);

  // 헤더 타이틀
  doc.fontSize(12).text('Wages by Individual', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(8).text(`Period: ${start} ~ ${end}`, { align: 'left' });
  doc.moveDown(1);

  // 그룹핑 로직: 같은 EID+Name 키를 기준으로, info를 항상 최신 레코드로 업데이트
  const grouped = payrecords.reduce((acc, cur) => {
    const key = `${cur.eid}||${cur.name}`;
    if (!acc[key]) {
      acc[key] = { info: cur, rows: [] };
    }
    // ✅ info 를 항상 현재 레코드로 갱신하여 Job Title/Code 일관성 유지
    acc[key].info = cur;
    acc[key].rows.push(cur);
    return acc;
  }, {});

  const headers = ['Pay Date', 'Check No.', 'Wages', 'Regular Time', 'Over Time', 'DoubleTime', 'Remark'];
  const colWidths = [60, 60, 85, 85, 85, 85, 100];
  const rowHeight = 14;
  const startX = doc.page.margins.left;
  const pageBottom = doc.page.height - doc.page.margins.bottom;
  
  // 숫자 포맷 함수 추가
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

  // 각 그룹별로 PDF에 출력
  for (const key in grouped) {
    const { info, rows } = grouped[key];

    // 📌 직원 정보 출력 시, 명시적으로 x 위치(startX)를 지정
    const infoText = `${info.eid}         ${info.name}              ${info.jtitle}         ${info.jcode}`;
    doc.fontSize(8).text(infoText, startX, doc.y);  // ✅ x를 startX로 고정
    const topY = doc.y + 2;

    // *** 합계 계산용 변수 초기화 ***
    let totalWages = 0;
    let totalRTime = 0;
    let totalOTime = 0;
    let totalDTime = 0;

    // 테이블 머리글 그리기
    let x = startX;
    let y = topY;
    doc.fontSize(7).lineWidth(0.2);

    headers.forEach((h, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(h, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
      x += colWidths[i];
    });
    y += rowHeight;

    // 각 레코드(행)를 그리기
    for (const r of rows) {
      // 📌 페이지 끝을 넘어가면 새 페이지 추가 및 커서 동기화
      if (y + rowHeight > pageBottom) {
        doc.addPage();
        y = doc.page.margins.top;
        doc.y = y;  // ✅ doc.y도 함께 맞춰줌

        // 새 페이지에서 다시 머리글 그리기
        x = startX;
        headers.forEach((h, i) => {
          doc.rect(x, y, colWidths[i], rowHeight).stroke();
          doc.text(h, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
          x += colWidths[i];
        });
        y += rowHeight;
      }

      // 행 데이터 그리기
      x = startX;
      const wageVal = r.gross != null ? Number(r.gross) : 0;
      const rtimeVal = r.rtime != null ? Number(r.rtime) : 0;
      const otimeVal = r.otime != null ? Number(r.otime) : 0;
      const dtimeVal = r.dtime != null ? Number(r.dtime) : 0;

      // *** 현재 레코드 값 누적 ***
      totalWages += wageVal;
      totalRTime += rtimeVal;
      totalOTime += otimeVal;
      totalDTime += dtimeVal;

      const vals = [
        r.pdate?.split('T')[0] || '',
        r.ckno || '',
        formatNumber(wageVal.toFixed(2)),
        formatNumber(rtimeVal.toFixed(2)),
        formatNumber(otimeVal.toFixed(2)),
        formatNumber(dtimeVal.toFixed(2)),
        r.remark || ''
      ];
      vals.forEach((v, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(v, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }

    // 📌 표가 끝난 후 ‘합계 행’ 그리기
    //    페이지 넘침 체크: 합계행을 그릴 공간이 없으면 새로운 페이지 추가
    if (y + rowHeight > pageBottom) { 
      doc.addPage();
      y = doc.page.margins.top;
      doc.y = y;
    }
    x = startX;
    doc.fontSize(7).lineWidth(0.2);

    // ‘Total’ 라벨 셀
    doc.rect(x, y, colWidths[0] + colWidths[1], rowHeight).stroke();  // Date + Check No 영역 합쳐서
    doc.text('Total', x + 2, y + 2, { width: colWidths[0] + colWidths[1] - 4, align: 'center' });
    x += colWidths[0] + colWidths[1];

    // 합계값 셀들
    const totalVals = [
      formatNumber(totalWages.toFixed(2)),
      formatNumber(totalRTime.toFixed(2)),
      formatNumber(totalOTime.toFixed(2)),
      formatNumber(totalDTime.toFixed(2))
    ];
    // colIndexes: 2 → Wages, 3 → RTime, 4 → O.Time, 5 → D.Time
    totalVals.forEach((tv, idx) => {
      doc.rect(x, y, colWidths[idx + 2], rowHeight).stroke();
      doc.text(tv, x + 2, y + 2, { width: colWidths[idx + 2] - 4, align: 'center' });
      x += colWidths[idx + 2];
    });
    // Remark 컬럼은 빈 셀로 남겨두기
    doc.rect(x, y, colWidths[6], rowHeight).stroke();
    y += rowHeight;

    // 📌 표 및 합계가 끝난 위치를 기준으로 내부 커서 doc.y를 최신화
    doc.y = y + 4;  // 약간의 여백(4pt) 추가
    doc.moveDown(1); // 그룹 간 간격 축소
  }

  doc.end();
};

module.exports = generateAuditIndividualPDF;
