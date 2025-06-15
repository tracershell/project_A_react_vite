//server/src/routes/admin/payroll/payrolldocpage.js

const express = require('express');
const router = express.Router();
const generateDeductionPDF = require('../../../utils/admin/payroll/generateTimeaddPDF');
const generateCashpayPDF = require('../../../utils/admin/payroll/generateCashpayPDF');
const generateChildspPDF = require('../../../utils/admin/payroll/generateChildspPDF');

// ---------------------------------------------------

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ---------------------------------------------------
router.get('/timesheetpdf', (req, res) => {
  generateDeductionPDF(res, req.query);
});

router.get('/cashpaypdf', (req, res) => {
  generateCashpayPDF(res, req.query);
});

// ✅ Child Support PDF 생성 라우터
router.get('/childsp-pdf', (req, res) => {
  generateChildspPDF(res, req.query);
});

// ---------------------------------------------------


// 🔹 업로드 경로 설정
const uploadDir = path.join(__dirname, '../../../../public/uploads/payroll/pdoc_upload');
const db = require('../../../lib/db');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 🔹 multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// ✅ 업로드 라우터 (업로드시 DB에 저장)
router.post('/upload-childsp', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const filename = req.file.filename;
  try {
    // 기존 파일 있으면 삭제
    await db.query(`DELETE FROM payroll_doc WHERE dtype = 'child_support'`);

    // 새 파일 등록
    await db.query(`INSERT INTO payroll_doc (dtype, filename) VALUES (?, ?)`, ['child_support', filename]);

    res.json({ filename });
  } catch (err) {
    console.error('DB 저장 실패:', err);
    res.status(500).json({ error: 'DB 저장 실패' });
  }
});

// ✅ 파일 정보 불러오기
router.get('/childsp-info', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT filename FROM payroll_doc WHERE dtype = 'child_support' LIMIT 1`);
    if (rows.length === 0) return res.json({ filename: null });
    res.json({ filename: rows[0].filename });
  } catch (err) {
    res.status(500).json({ error: 'DB 조회 실패' });
  }
});

// ✅ 삭제 라우터
router.delete('/delete-childsp', async (req, res) => {
  const filename = req.query.filename;
  if (!filename) return res.status(400).json({ error: 'No filename provided' });

  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

  try {
    fs.unlinkSync(filePath);
    await db.query(`DELETE FROM payroll_doc WHERE dtype = 'child_support'`);
    res.json({ success: true });
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: 'File delete failed' });
  }
});

// ---------------------------------------------------


module.exports = router;
