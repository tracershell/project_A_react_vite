//server/src/routes/admin/payroll/payrolldocpage.js

const express = require('express');
const router = express.Router();
const generateDeductionPDF = require('../../../utils/admin/payroll/generateTimeaddPDF');
const generateCashpayPDF = require('../../../utils/admin/payroll/generateCashpayPDF');

router.get('/timesheetpdf', (req, res) => {
  generateDeductionPDF(res, req.query);
});

router.get('/cashpaypdf', (req, res) => {
  generateCashpayPDF(res, req.query);
});



module.exports = router;
