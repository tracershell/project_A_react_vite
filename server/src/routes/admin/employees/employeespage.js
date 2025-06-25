// 📁 server/src/routes/admin/employees/employeespage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const generateEmployeesIndividualPDF = require('../../../utils/admin/employees/generateEmployeesIndividualPDF');
const generateEmployeesPDF = require('../../../utils/admin/employees/generateEmployeesPDF');

// ✅ 개별 직원 PDF 생성
router.get('/pdf/individual/:eid', async (req, res) => {
  const { eid } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM employees WHERE eid = ?', [eid]);
    if (rows.length === 0) return res.status(404).send('해당 직원이 존재하지 않습니다.');
    await generateEmployeesIndividualPDF(res, rows[0]);
  } catch (err) {
    console.error('개인 PDF 생성 오류:', err);
    res.status(500).send('PDF 생성 실패');
  }
});

// ✅ 전체 직원 PDF 보기 (기존 로직 재사용 가능)
router.get('/pdf/all', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees WHERE status = "active" ORDER BY id ASC');
    await generateEmployeesPDF(res, rows, 'active');
  } catch (err) {
    console.error('전체 PDF 생성 오류:', err);
    res.status(500).send('PDF 생성 실패');
  }
});

// ✅ 직원 리스트 전체 조회 (EmployeesPage에서 테이블 표시용)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM employees ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error('직원 목록 조회 오류:', err);
    res.status(500).json({ error: '직원 목록을 불러올 수 없습니다.' });
  }
});

module.exports = router;
