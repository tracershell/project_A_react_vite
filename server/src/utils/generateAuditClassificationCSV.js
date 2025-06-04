// server/src/utils/generateAuditClassificationCSV.js

const { format } = require('@fast-csv/format');

/**
 * 분류별 감사(CSV) 생성
 * - res: Express 응답 객체
 * - records: DB에서 조회한 payrecords 전체 배열
 *
 * CSV 컬럼: Pay Date, Check No, EID, Name, J.Title, J.Code, Wages, Regular Time, Over Time, DoubleTime, Remark
 */
async function generateAuditClassificationCSV(res, records) {
  res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
  res.setHeader('Content-Disposition', 'attachment; filename=payroll_classification_export.csv');

  const csvStream = format({ headers: true });
  csvStream.pipe(res);

  for (const r of records) {
    // pdate가 문자열 혹은 Date 객체일 수 있으므로 분기 처리
    let dateStr = '';
    if (r.pdate instanceof Date) {
      dateStr = r.pdate.toISOString().split('T')[0];
    } else if (typeof r.pdate === 'string') {
      dateStr = r.pdate.split('T')[0];
    }

    csvStream.write({
      'Pay Date': dateStr,
      'Check No': r.ckno || '',
      EID: r.eid,
      Name: r.name,
      'J.Title': r.jtitle,
      'J.Code': r.jcode,
      Wages: Number(r.gross).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'Regular Time': Number(r.rtime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'Over Time': Number(r.otime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      DoubleTime: Number(r.dtime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      Remark: r.remark || ''
    });
  }

  csvStream.end();
}

module.exports = generateAuditClassificationCSV;
