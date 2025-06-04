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
  doc.fontSize(14).text('Payroll Audit by Individual', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Audit Period: ${start} ~ ${end}`, { align: 'left' });
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

  const headers = ['Pay Date', 'Check No', 'Wages', 'Regular Time', 'OverTime', 'Double Time', 'Remark'];
  const colWidths = [60, 60, 70, 70, 70, 70, 100];
  const rowHeight = 14;
  const startX = doc.page.margins.left;
  const pageBottom = doc.page.height - doc.page.margins.bottom;

  // 각 그룹별로 PDF에 출력
  for (const key in grouped) {
    const { info, rows } = grouped[key];

    // 📌 직원 정보 출력 시, 명시적으로 x 위치(startX)를 지정
    const infoText = `${info.eid}   ${info.name}         ${info.jtitle}       ${info.jcode}`;
    doc.fontSize(8).text(infoText, startX, doc.y);  // ✅ x를 startX로 고정
    const topY = doc.y + 2;

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
        doc.text(v, x + 2, y + 2, { width: colWidths[i] - 4, align: 'center' });
        x += colWidths[i];
      });
      y += rowHeight;
    }

    // 📌 표가 끝난 위치를 기준으로 내부 커서 doc.y를 최신화
    doc.y = y + 4;  // 약간의 여백(4pt) 추가
    doc.moveDown(0.4); // 그룹 간 간격 축소
  }

  doc.end();
};

module.exports = generateAuditIndividualPDF;
