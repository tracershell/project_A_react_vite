// server/src/routes/admin/payroll/payrollsalaryadjustpage.js

const express = require('express');
const router = express.Router();
const generateSalaryAdjustPDF = require('../../../utils/admin/payroll/generateSalaryAdjustPDF');

// 📌 '/salary_adjust_viewpdf' 경로에서 PDF 생성 요청 처리
router.get('/salary_adjust_viewpdf', (req, res) => {
  const {
    deduction = '0',
    fixSalary = '0.00',
    originalSalary = '0.00',
    adjustedWorkDays = '0',
    workDays = '0',
    adjSalary = '0.00'
  } = req.query;

  // PDF 생성 유틸 호출
  generateSalaryAdjustPDF(
    res,
    { deduction, fixSalary, originalSalary, adjustedWorkDays, workDays, adjSalary }
  );
});

module.exports = router;
