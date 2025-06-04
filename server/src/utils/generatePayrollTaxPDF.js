// server/src/utils/generatePayrollTaxPDF.js

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * Payroll Tax PDF 생성
 * - res: Express 응답 객체
 * - records: DB에서 조회한 레코드 배열
 * - info: 추가 정보 객체 (예: { pdate: '2025-06-05' })
 */
const generatePayrollTaxPDF = async (res, records, info = {}) => {
  // 한글 폰트 경로 확인
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

  // PDFDocument 초기화 (landscape 모드)
  const doc = new PDFDocument({ margin: 30, size: 'letter', layout: 'landscape' });
  doc.registerFont('Korean', fontPath).font('Korean');

  // 브라우저로 PDF 스트리밍
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=payroll_tax_list.pdf');
  doc.pipe(res);

  // --- 타이틀 및 정보 ---
  doc.fontSize(12).text('Payroll Tax Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(8).text(`Pay Date: ${info.pdate || '-'}`, { align: 'left' });
  doc.moveDown(1);

  // --- 테이블 설정 ---
  const headers = [
    'EID', 'Name',
    'Check No', 'R.T', 'O.T', 'D.T',
    'FW', 'SSE', 'ME',
    'CA-W', 'CA-de',
    'ADV.', 'C.S', 'D.D',
    'Gross', 'Tax', 'Net'
  ];

  // 각 컬럼 너비 (픽셀 단위)
  const colWidths = [
     25,  80,   // → EID, Name
     35,  40,  40,  40,  // → Check No, R.T, O.T, D.T
     45,  45,  45,       // → FW, SSE, ME
     45,  45,            // → CA-W, CA-de
     40,  40,            // → ADV., C.S
     40,                 // → D.D
     45,  45,  45        // → Gross, Tax, Net
  ];
  const startX = doc.page.margins.left;
  let y = doc.y + 5;                // 표가 시작될 Y 좌표
  const rowHeight = 16;             // 한 행 높이
  const pageBottom = doc.page.height - doc.page.margins.bottom;

  // --- 테이블 헤더 그리기 ---
  let x = startX;
  doc.fontSize(6).lineWidth(0.2);   // 선을 얇게
  headers.forEach((header, i) => {
    doc.rect(x, y, colWidths[i], rowHeight).stroke();
    doc.text(header, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
    x += colWidths[i];
  });
  y += rowHeight;

  // --- 합계를 위한 초기값 ---
  const totals = {
    rtime: 0, otime: 0, dtime: 0,
    fw: 0, sse: 0, me: 0,
    caw: 0, cade: 0,
    adv: 0, csp: 0, dd: 0,
    gross: 0, tax: 0, net: 0
  };

  // --- 데이터 행 그리기 ---
  records.forEach(row => {
    // 페이지 바닥 체크 → 새 페이지
    if (y + rowHeight > pageBottom) {
      doc.addPage();
      doc.fontSize(6).lineWidth(0.2);
      y = doc.page.margins.top;

      // 새 페이지에서 헤더 재출력
      x = startX;
      headers.forEach((header, i) => {
        doc.rect(x, y, colWidths[i], rowHeight).stroke();
        doc.text(header, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }

    // 합계 집계
    totals.rtime += Number(row.rtime) || 0;
    totals.otime += Number(row.otime) || 0;
    totals.dtime += Number(row.dtime) || 0;
    totals.fw    += Number(row.fw)    || 0;
    totals.sse   += Number(row.sse)   || 0;
    totals.me    += Number(row.me)    || 0;
    totals.caw   += Number(row.caw)   || 0;
    totals.cade  += Number(row.cade)  || 0;
    totals.adv   += Number(row.adv)   || 0;
    totals.csp   += Number(row.csp)   || 0;
    totals.dd    += Number(row.dd)    || 0;
    totals.gross += Number(row.gross) || 0;
    totals.tax   += Number(row.tax)   || 0;
    totals.net   += Number(row.net)   || 0;

    // 한 행씩 그리기
    const values = [
      row.eid    || '',
      row.name   || '',
      row.ckno   || '',
      (row.rtime != null ? formatNumber(Number(row.rtime).toFixed(2)) : ''),
      (row.otime != null ? formatNumber(Number(row.otime).toFixed(2)) : ''),
      (row.dtime != null ? formatNumber(Number(row.dtime).toFixed(2)) : ''),
      (row.fw != null    ? formatNumber(Number(row.fw).toFixed(2))    : ''),
      (row.sse != null   ? formatNumber(Number(row.sse).toFixed(2))   : ''),
      (row.me != null    ? formatNumber(Number(row.me).toFixed(2))    : ''),
      (row.caw != null   ? formatNumber(Number(row.caw).toFixed(2))   : ''),
      (row.cade != null  ? formatNumber(Number(row.cade).toFixed(2))  : ''),
      (row.adv != null   ? formatNumber(Number(row.adv).toFixed(2))   : ''),
      (row.csp != null   ? formatNumber(Number(row.csp).toFixed(2))   : ''),
      (row.dd != null    ? formatNumber(Number(row.dd).toFixed(2))    : ''),
      (row.gross != null ? formatNumber(Number(row.gross).toFixed(2)): ''),
      (row.tax != null   ? formatNumber(Number(row.tax).toFixed(2))   : ''),
      (row.net != null   ? formatNumber(Number(row.net).toFixed(2))   : '')
    ];

    x = startX;
    values.forEach((val, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(val, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
      x += colWidths[i];
    });
    y += rowHeight;
  });

  // --- 합계 행 그리기 전, 페이지 넘김 체크 ---
  if (y + rowHeight > pageBottom) {
    doc.addPage();
    doc.fontSize(6).lineWidth(0.2);
    y = doc.page.margins.top;

    // 헤더 재출력 (필요시)
    x = startX;
    headers.forEach((header, i) => {
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(header, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
      x += colWidths[i];
    });
    y += rowHeight;
  }

  // --- 합계 행 그리기 ---
  x = startX;
  doc.fontSize(6).lineWidth(0.2);

  // 1) EID 컬럼(완전 사각형 → 오른쪽 경계 제외)
  // └ ‘Total’ 은 Name 셀로 옮길 예정이므로, EID 셀은 빈 칸으로만 둠
  // → 왼쪽 수직선, 위/아래 수평선만 그린 후, x를 옮김
  const eidW = colWidths[0];
  // (a) 왼쪽 수직선
  doc.moveTo(x, y).lineTo(x, y + rowHeight).stroke();
  // (b) 위쪽 수평선
  doc.moveTo(x, y).lineTo(x + eidW, y).stroke();
  // (c) 아래쪽 수평선
  doc.moveTo(x, y + rowHeight).lineTo(x + eidW, y + rowHeight).stroke();
  x += eidW;

  // 2) Name 컬럼(“Total” 텍스트 찍고, 좌우 수직선 모두 제거)
  const nameW = colWidths[1];
  // (a) 위쪽 수평선만
  doc.moveTo(x, y).lineTo(x + nameW, y).stroke();
  // (b) 아래쪽 수평선만
  doc.moveTo(x, y + rowHeight).lineTo(x + nameW, y + rowHeight).stroke();
  // (c) 텍스트 “Total” 중앙 정렬
  doc.text('Total', x + 2, y + 2, { width: nameW - 4, align: 'center' });
  x += nameW;

  // 3) Check No 컬럼(왼쪽 경계만 제외한 사각형 → 빈 칸으로 두기)
  const ckW = colWidths[2];
  // (a) 오른쪽 수직선
  doc.moveTo(x + ckW, y).lineTo(x + ckW, y + rowHeight).stroke();
  // (b) 위쪽 수평선
  doc.moveTo(x, y).lineTo(x + ckW, y).stroke();
  // (c) 아래쪽 수평선
  doc.moveTo(x, y + rowHeight).lineTo(x + ckW, y + rowHeight).stroke();
  x += ckW;

  // 4) 나머지 컬럼(R.T부터 Net까지)의 합계 출력
  const totalValues = [
    formatNumber(totals.rtime.toFixed(2)),  // R.T
    formatNumber(totals.otime.toFixed(2)),  // O.T
    formatNumber(totals.dtime.toFixed(2)),  // D.T
    formatNumber(totals.fw.toFixed(2)),     // FW
    formatNumber(totals.sse.toFixed(2)),    // SSE
    formatNumber(totals.me.toFixed(2)),     // ME
    formatNumber(totals.caw.toFixed(2)),    // CA-W
    formatNumber(totals.cade.toFixed(2)),   // CA-de
    formatNumber(totals.adv.toFixed(2)),    // ADV.
    formatNumber(totals.csp.toFixed(2)),    // C.S
    formatNumber(totals.dd.toFixed(2)),     // D.D
    formatNumber(totals.gross.toFixed(2)),  // Gross
    formatNumber(totals.tax.toFixed(2)),    // Tax
    formatNumber(totals.net.toFixed(2))     // Net
  ];

  totalValues.forEach((val, i) => {
    // i = 0 → R.T(헤더 인덱스 3), i = 1 → O.T(4), …, i = 13 → Net(16)
    const colIndex = i + 3;
    doc.rect(x, y, colWidths[colIndex], rowHeight).stroke();
    doc.text(val, x + 2, y + 2, { width: colWidths[colIndex] - 4, align: 'center' });
    x += colWidths[colIndex];
  });

  y += rowHeight;

  // --- PDF 스트리밍 종료 ---
  doc.end();
};

module.exports = generatePayrollTaxPDF;
