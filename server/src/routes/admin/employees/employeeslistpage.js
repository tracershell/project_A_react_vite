// server/src/routes/admin/employees/employeeslistpage.js

const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateEmployeesPDF = require('../../../utils/admin/employees/generateEmployeesPDF');

const safeDate = (val) => {
  return val && val !== 'Invalid Date' ? val : null;
};

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees');
    res.json(rows);
  } catch (err) {
    console.error('DB 오류:', err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

router.post('/add', async (req, res) => {
  const emp = req.body;
  try {
    const [dup] = await db.query('SELECT COUNT(*) AS count FROM employees WHERE eid = ?', [emp.eid]);
    if (dup[0].count > 0) {
      return res.status(400).json({ success: false, error: `이미 존재하는 직원 ID: ${emp.eid}` });
    }

    await db.query(
      `INSERT INTO employees (status, eid, name, ss, birth, email, phone, jcode, jtitle, sdate, edate, sick, vac, workl, address, city, state, zip, remark)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        emp.status, emp.eid, emp.name, emp.ss, safeDate(emp.birth), emp.email, emp.phone,
        emp.jcode, emp.jtitle, safeDate(emp.sdate), safeDate(emp.edate), emp.sick || 0,
        emp.vac || 0, emp.workl, emp.address, emp.city, emp.state, emp.zip, emp.remark
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('직원 추가 오류:', err);
    res.status(500).json({ success: false, error: '직원 추가 중 오류' });
  }
});

router.post('/edit/:eid', async (req, res) => {
  const eid = req.params.eid;
  const emp = req.body;
  try {
    const [result] = await db.query(
      `UPDATE employees SET status=?, name=?, ss=?, birth=?, email=?, phone=?, jcode=?, jtitle=?, sdate=?, edate=?, sick=?, vac=?, workl=?, address=?, city=?, state=?, zip=?, remark=? WHERE eid=?`,
      [
        emp.status, emp.name, emp.ss, safeDate(emp.birth), emp.email, emp.phone,
        emp.jcode, emp.jtitle, safeDate(emp.sdate), safeDate(emp.edate), emp.sick || 0,
        emp.vac || 0, emp.workl, emp.address, emp.city, emp.state, emp.zip, emp.remark, eid
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: `직원 정보 없음: ${eid}` });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('직원 수정 오류:', err);
    res.status(500).json({ success: false, error: '직원 수정 중 오류' });
  }
});

router.post('/delete/:eid', async (req, res) => {
  const eid = req.params.eid;
  try {
    const [result] = await db.query('DELETE FROM employees WHERE eid = ?', [eid]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: `삭제할 직원 없음: ${eid}` });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('직원 삭제 오류:', err);
    res.status(500).json({ success: false, error: '직원 삭제 중 오류' });
  }
});

router.get('/pdf', async (req, res) => {
  const { status } = req.query;
  try {
    const [rows] = await db.query(
      'SELECT * FROM employees WHERE status = ? ORDER BY id ASC',
      [status]
    );

    // ✅ PDF로 넘길 데이터 로그 출력 (점검용)
    // console.log('===== PDF EXPORT RECORDS =====');
    // console.log(JSON.stringify(rows, null, 2));
    // console.log('================================');

    await generateEmployeesPDF(res, rows, status);
  } catch (err) {
    console.error('PDF 생성 오류:', err);
    res.status(500).send('PDF 생성 오류: ' + err.message);
  }
});


router.get('/print/:eid', async (req, res) => {
  const { eid } = req.params;

  console.log(`직원 상세 정보 출력 요청: ${eid}`);

  try {
    const [rows] = await db.query('SELECT * FROM employees WHERE eid = ?', [eid]);
    if (rows.length === 0) {
      console.log(`직원을 찾을 수 없음: ${eid}`);
      return res.status(404).json({ error: '직원을 찾을 수 없습니다.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('직원 정보 조회 중 오류:', err);
    console.error('출력용 데이터 오류:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});


module.exports = router;
