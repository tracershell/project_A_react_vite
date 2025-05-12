const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../../../public/uploads/ep_uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.body.eid}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  const [employees] = await db.query(
    `SELECT eid, name FROM employees
     WHERE eid NOT IN (SELECT eid FROM employees_photo)
     ORDER BY name`
  );
  const [photos] = await db.query(`
    SELECT ep.*, e.name FROM employees_photo ep
    LEFT JOIN employees e ON ep.eid = e.eid
    ORDER BY ep.upload_date DESC
  `);
  res.json({ employees, photos });
});

router.post('/upload', upload.single('file'), async (req, res) => {
  const { eid, comment } = req.body;
  const file = req.file;

  console.log('📦 업로드 데이터:', { eid, comment, file });

  if (!eid || !file) {
    return res.status(400).json({ error: '필수 데이터 누락' });
  }

  try {
    await db.query(
      'INSERT INTO employees_photo (eid, filename, originalname, comment) VALUES (?, ?, ?, ?)',
      [eid, file.filename, file.originalname, comment || '']
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ DB 저장 실패:', err);
    res.status(500).json({ error: 'DB 저장 실패' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  const [[fileRec]] = await db.query('SELECT filename FROM employees_photo WHERE id = ?', [id]);
  if (!fileRec) return res.status(404).json({ error: '사진 없음' });

  const filePath = path.join(uploadDir, fileRec.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await db.query('DELETE FROM employees_photo WHERE id = ?', [id]);
  res.json({ success: true });
});

module.exports = router;
