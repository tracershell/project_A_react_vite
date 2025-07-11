const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ 업로드 폴더 경로 설정
const uploadPath = path.join(__dirname, '../../../../public/uploads/employees/edoc_upload');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ multer 설정 - 파일명에 eid prefix 포함
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const eid = req.body.eid || 'unknown';
    cb(null, `${eid}_${timestamp}${ext}`); // ✅ prefix로 eid 포함
  },
});
const upload = multer({ storage });

// ✅ 직원 + 파일 목록 조회
router.get('/', async (req, res) => {
  try {
    const [employees] = await db.query(
      'SELECT eid, name FROM employees ORDER BY name'
    );
    const [files] = await db.query(`
      SELECT ed.id, ed.eid, ed.filename, ed.originalname, ed.comment,
             ed.upload_date, e.name
      FROM employees_data ed
      LEFT JOIN employees e ON ed.eid = e.eid
      ORDER BY ed.upload_date DESC
    `);
    res.json({ employees, files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB 조회 오류' });
  }
});

// ✅ 파일 업로드 처리
router.post('/upload', upload.single('file'), async (req, res) => {
  const { eid, comment } = req.body;
  const file = req.file;
  if (!eid || !file) {
    return res.status(400).json({ error: '필수 데이터 누락' });
  }
  try {
    await db.query(
      `INSERT INTO employees_data 
         (eid, filename, originalname, comment)
       VALUES (?, ?, ?, ?)`,
      [eid, file.filename, file.originalname, comment || '']
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '업로드 DB 오류' });
  }
});

// ✅ 파일 삭제 처리
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [[fileRec]] = await db.query(
      'SELECT filename FROM employees_data WHERE id = ?',
      [id]
    );
    if (!fileRec) {
      return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
    }
    const filePath = path.join(uploadPath, fileRec.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query('DELETE FROM employees_data WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '삭제 오류' });
  }
});

// ✅ 특정 직원(eid)의 문서 목록 조회 API
router.get('/docs/:eid', async (req, res) => {
  const { eid } = req.params;
  try {
    const [files] = await db.query(`
      SELECT ed.id, ed.eid, ed.filename, ed.originalname, ed.comment,
             ed.upload_date
      FROM employees_data ed
      WHERE ed.eid = ?
      ORDER BY ed.upload_date DESC
    `, [eid]);

    res.json(files);
  } catch (err) {
    console.error('문서 조회 실패:', err);
    res.status(500).json({ error: '문서 조회 실패' });
  }
});

module.exports = router;
