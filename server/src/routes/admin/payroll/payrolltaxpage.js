// server/src/routes/admin/payroll/payrolltaxpage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generatePayrollTaxPDF = require('../../../utils/generatePayrollTaxPDF');
const generatePayrollTaxCSV = require('../../../utils/generatePayrollTaxCSV');
const generatePayrollFormPDF = require('../../../utils/generatePayrollFormPDF');

// 파일 상단 또는 내부에 정의
const cleanDate = (date) => {
  if (!date) return null;
  return date.split('T')[0]; // '2025-06-06T00:00:00.000Z' → '2025-06-06'
};

// 1) 직원 목록
router.get('/employees', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT eid, name, jcode, jtitle, workl
       FROM employees WHERE status='active'`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '직원 목록 조회 실패' });
  }
});

// 2) 지급일 목록
router.get('/dates', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT DISTINCT pdate FROM payroll_tax ORDER BY pdate DESC'
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '날짜 조회 실패' });
  }
});

// 3) 특정 날짜의 지급내역
router.get('/', async (req, res) => {
  const { pdate } = req.query;
  try {
    const [rows] = await db.query(
      'SELECT * FROM payroll_tax WHERE pdate=? ORDER BY id DESC',
      [pdate]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '내역 조회 실패' });
  }
});

// 4) 최신 내역 (Reference)
router.get('/latest', async (req, res) => {
  const { eid } = req.query;
  if (!eid) return res.json({ success: false, message: 'eid 누락' });
  try {
    const [rows] = await db.query(
      'SELECT * FROM payroll_tax WHERE eid=? ORDER BY pdate DESC LIMIT 1',
      [eid]
    );
    if (!rows.length) return res.json({ success: false, message: '이전 기록 없음' });
    res.json({ success: true, ...rows[0] });
  } catch (e) {
    console.error(e);
    res.json({ success: false, message: '조회 실패' });
  }
});

// 5) 추가
router.post('/add', async (req, res) => {
  const b = req.body;  
  try {
    // ✅ 1. Check 중복 여부
    const [dupe] = await db.query(
      'SELECT COUNT(*) AS count FROM payroll_tax WHERE ckno = ?',
      [b.ckno]
    );
    if (dupe[0].count > 0) {
      return res.status(400).json({ success: false, message: 'Check 번호가 중복되었습니다.' });
    }
    // ✅ 2. Insert 진행
    await db.query(
      `INSERT INTO payroll_tax (
         eid,name,jcode,jtitle,workl,
         pdate,ckno,rtime,otime,dtime,
         fw,sse,me,caw,cade,adv,csp,dd,
         gross,tax,net,remark
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        b.eid, b.name, b.jcode, b.jtitle, b.workl,
        cleanDate(b.pdate), b.ckno,
        parseFloat(b.rtime) || 0, parseFloat(b.otime) || 0, parseFloat(b.dtime) || 0,
        parseFloat(b.fw) || 0, parseFloat(b.sse) || 0, parseFloat(b.me) || 0,
        parseFloat(b.caw) || 0, parseFloat(b.cade) || 0,
        parseFloat(b.adv) || 0, parseFloat(b.csp) || 0, parseFloat(b.dd) || 0,
        parseFloat(b.gross) || 0, parseFloat(b.tax) || 0, parseFloat(b.net) || 0,
        b.remark
      ]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '저장 실패' });
  }
});

// 6) 수정
router.post('/update', async (req, res) => {
  const b = req.body;
  try {
    const [r] = await db.query(
      `UPDATE payroll_tax SET
         eid=?,name=?,jcode=?,jtitle=?,workl=?,
         pdate=?,ckno=?,rtime=?,otime=?,dtime=?,
         fw=?,sse=?,me=?,caw=?,cade=?,adv=?,csp=?,dd=?,
         gross=?,tax=?,net=?,remark=?
       WHERE ckno=?`,
      [
        b.eid, b.name, b.jcode, b.jtitle, b.workl,
        cleanDate(b.pdate), b.ckno,
        parseFloat(b.rtime) || 0, parseFloat(b.otime) || 0, parseFloat(b.dtime) || 0,
        parseFloat(b.fw) || 0, parseFloat(b.sse) || 0, parseFloat(b.me) || 0,
        parseFloat(b.caw) || 0, parseFloat(b.cade) || 0,
        parseFloat(b.adv) || 0, parseFloat(b.csp) || 0, parseFloat(b.dd) || 0,
        parseFloat(b.gross) || 0, parseFloat(b.tax) || 0, parseFloat(b.net) || 0,
        b.remark,
        b.ckno
      ]
    );
    res.json({ success: r.affectedRows > 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '수정 실패' });
  }
});

// 7) 삭제
router.post('/delete', async (req, res) => {
  const { ckno } = req.body;
  try {
    const [r] = await db.query('DELETE FROM payroll_tax WHERE ckno=?', [ckno]);
    res.json({ success: r.affectedRows > 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '삭제 실패' });
  }
});



// 8) PDF 보기 (인라인) 또는 PDF 다운로드
//    요청 경로에 "/pdf" 혹은 "/pdfdownload" 가 포함되면 attachment/inline을 결정합니다.
router.get(['/pdf', '/pdfdownload'], async (req, res) => {
  const { pdate } = req.query;
  if (!pdate) {
    return res.status(400).send('pdate 쿼리 파라미터가 필요합니다.');
  }

  try {
    // 해당 날짜의 모든 레코드를 조회
    const [records] = await db.query(
      'SELECT * FROM payroll_tax WHERE pdate = ? ORDER BY ckno ASC',
      [pdate]
    );
    if (records.length === 0) {
      return res.status(404).send('해당 날짜의 데이터가 없습니다.');
    }

    // PDF 생성 유틸 함수 호출
    // generatePayrollTaxPDF(res, records, isDownload, pdate)
    const isDownload = req.path.includes('download');
    await generatePayrollTaxPDF(res, records, { pdate, isDownload });
  } catch (err) {
    console.error('PDF 생성 오류:', err);
    res.status(500).send('PDF 생성 중 오류가 발생했습니다: ' + err.message);
  }
});

// 9) CSV 저장
router.get('/csv-export', async (req, res) => {
  const { pdate } = req.query;
  if (!pdate) return res.status(400).send('pdate 쿼리 파라미터가 필요합니다.');

  try {
    const [records] = await db.query('SELECT * FROM payroll_tax WHERE pdate = ? ORDER BY id ASC', [pdate]);
    if (!records.length) return res.status(404).send('해당 날짜 데이터 없음');

    await generatePayrollTaxCSV(res, records);
  } catch (err) {
    console.error('CSV 생성 오류:', err);
    res.status(500).send('CSV 생성 중 오류가 발생했습니다: ' + err.message);
  }
});

router.get('/formpdf', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).send('Check No 범위가 필요합니다.');

  try {
    const [records] = await db.query(
      'SELECT ckno, pdate, name, gross FROM payroll_tax WHERE CAST(ckno AS UNSIGNED) >= ? AND CAST(ckno AS UNSIGNED) <= ? ORDER BY CAST(ckno AS UNSIGNED) ASC',
      [start, end]
    );

    await generatePayrollFormPDF(res, records, { startCkno: start, endCkno: end });
  } catch (err) {
    console.error('Form PDF 생성 오류:', err);
    res.status(500).send('PDF 생성 오류: ' + err.message);
  }
});



module.exports = router;
