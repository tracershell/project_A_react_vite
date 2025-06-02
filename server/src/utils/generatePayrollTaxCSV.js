const { format } = require('@fast-csv/format');

async function generatePayrollTaxCSV(res, records) {
  res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
  res.setHeader('Content-Disposition', 'attachment; filename=payroll_tax_export.csv');

  const csvStream = format({ headers: true });
  csvStream.pipe(res);

  for (const r of records) {
    csvStream.write({
      EID: r.eid,
      Name: r.name,
      'Check No': r.ckno,
     'R.T': Number(r.rtime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'O.T': Number(r.otime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'D.T': Number(r.dtime).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      FW: Number(r.fw).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      SSE: Number(r.sse).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      ME: Number(r.me).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'CA-W': Number(r.caw).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'CA-de': Number(r.cade).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'ADV.': Number(r.adv).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'C.S': Number(r.csp).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      'D.D': Number(r.dd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      Gross: Number(r.gross).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      Tax: Number(r.tax).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      Net: Number(r.net).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      Remark: r.remark
    });
  }

  csvStream.end();
}

module.exports = generatePayrollTaxCSV;
