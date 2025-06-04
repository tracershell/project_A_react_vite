// server/src/utils/generatePayrollIndividualCSV.js

const { format } = require('@fast-csv/format');

/**
 * 개인별 감사(CSV) 생성
 * - res: Express 응답 객체
 * - records: DB에서 조회한 payrecords array
 */
async function generatePayrollIndividualCSV(res, records) {
  // CSV 헤더 설정
  res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
  res.setHeader('Content-Disposition', 'attachment; filename=payroll_individual_export.csv');

  const csvStream = format({ headers: true });
  csvStream.pipe(res);

  for (const r of records) {
    // r.pdate가 Date 객체인지, 문자열인지 확인해서 YYYY-MM-DD 형태로 변환
    let dateStr = '';
    if (r.pdate instanceof Date) {
      dateStr = r.pdate.toISOString().split('T')[0];
    } else if (typeof r.pdate === 'string') {
      // DB에서 이미 'YYYY-MM-DD' 혹은 'YYYY-MM-DDT...' 문자열로 받은 경우
      dateStr = r.pdate.split('T')[0];
    } else {
      // 혹시 null/undefined 등
      dateStr = '';
    }

    csvStream.write({
      'Pay Date': dateStr,
      EID: r.eid,
      Name: r.name,
      'Job Title': r.jtitle,
      'Job Code': r.jcode,
      'Check No.': r.ckno,
      Wages: Number(r.gross).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'Regular Time': Number(r.rtime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'Over Time': Number(r.otime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      DoubleTime: Number(r.dtime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      Remark: r.remark || ''
    });
  }

  csvStream.end();
}

module.exports = generatePayrollIndividualCSV;
