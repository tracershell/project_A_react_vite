// ✅ File: server/src/routes/admin/payroll/payrollindividualpage.js

const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// ✅ 날짜 형식 정리 함수
const cleanDate = (date) => {
  if (!date) return null;
  return date.split('T')[0]; // '2025-06-06T00:00:00.000Z' → '2025-06-06'
};

// ✅ 직원 목록 (선택 필드가 필요할 경우)
router.get('/employees', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT eid, name, jcode, jtitle, workl FROM employees WHERE status='active'`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: '직원 목록 조회 실패' });
  }
});

// ✅ 개인별 감사 결과 조회 API
router.get('/audit-result', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: '시작일과 종료일을 입력해주세요.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT eid, name, jtitle, jcode, gross, rtime, otime, dtime, pdate, ckno, remark
       FROM payroll_tax
       WHERE pdate BETWEEN ? AND ?
       ORDER BY name, pdate ASC`,
      [start, end]
    );
    res.json(rows);
  } catch (e) {
    console.error('기간별 감사 데이터 조회 오류:', e);
    res.status(500).json({ error: '서버 오류로 데이터를 불러오지 못했습니다.' });
  }
});

module.exports = router;
