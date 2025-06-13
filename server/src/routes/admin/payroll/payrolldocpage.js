const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const generateCashpayPDF = require('../../../utils/admin/payroll/generateCashpayPDF');
const generateChildspPDF = require('../../../utils/admin/payroll/generateChildspPDF');
const generateDeductionPDF = require('../../../utils/admin/payroll/generateDeductionPDF');
const generateTimeaddPDF = require('../../../utils/admin/payroll/generateTimeaddPDF');

const uploadPath = path.join(__dirname, '../../../../public/uploads/payroll/pdoc_upload');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    cb(null, `${base}_${timestamp}${ext}`);
  },
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const [childRows] = await db.query(
      `SELECT * FROM simple_doc WHERE category = 'childsupport' ORDER BY uploaded_at DESC LIMIT 1`
    );
    const [deductRows] = await db.query(
      `SELECT * FROM simple_doc WHERE category = 'deduction' ORDER BY uploaded_at DESC LIMIT 1`
    );
    res.json({
      uploadedChildFile: childRows.length > 0 ? childRows[0] : null,
      uploadedDeductFile: deductRows.length > 0 ? deductRows[0] : null,
    });
  } catch (err) {
    console.error('Error fetching uploaded files:', err);
    res.status(500).json({ error: 'Failed to fetch uploaded files' });
  }
});

router.post('/upload/:category', upload.single('file'), async (req, res) => {
  const { category } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file selected' });
  if (!['childsupport', 'deduction'].includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  try {
    await db.query(
      'INSERT INTO simple_doc (filename, originalname, category) VALUES (?, ?, ?)',
      [file.filename, file.originalname, category]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(`Error uploading ${category} file:`, err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.post('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [[row]] = await db.query('SELECT filename FROM simple_doc WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ error: 'File not found' });
    const filePath = path.join(uploadPath, row.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await db.query('DELETE FROM simple_doc WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting file:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

router.get('/cashpay/viewpdf', async (req, res) => {
  await generateCashpayPDF(res, req.query);
});

router.get('/childsupport/viewpdf', async (req, res) => {
  await generateChildspPDF(res, req.query);
});

router.get('/deduction/viewpdf', async (req, res) => {
  await generateDeductionPDF(res, req.query);
});

router.get('/timeadd/viewpdf', async (req, res) => {
  await generateTimeaddPDF(res, req.query);
});

module.exports = router;