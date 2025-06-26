// 📁 server/routes/admin/personal/personalphotopage.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../../../lib/db'); // MySQL pool

const UPLOAD_DIR = path.join(__dirname, '../../../../public/uploads/personal/photo_upload');

// 디렉토리 생성
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const isValid = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
    isValid ? cb(null, true) : cb(new Error('이미지 파일만 업로드 가능합니다.'));
  }
});

// GET 모든 사진
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, original, thumbnail, date, comment, place, created_at FROM personal_photo ORDER BY created_at DESC'
    );
    res.json({ photos: rows });
  } catch (err) {
    console.error('사진 목록 오류:', err);
    res.status(500).json({ error: '사진 목록 로드 실패', details: err.message });
  }
});

// POST 업로드 (썸네일 없이 원본만 저장)
router.post('/upload', (req, res) => {
  upload.single('photo')(req, res, async (err) => {
    if (err || !req.file) return res.status(400).json({ error: '업로드 실패', details: err?.message || '파일 없음' });

    const { date, comment, place } = req.body;
    if (!date || !comment || !place) return res.status(400).json({ error: '모든 필드를 입력해주세요.' });

    const original = req.file.filename;

    try {
      const [result] = await db.query(
        'INSERT INTO personal_photo (original, thumbnail, date, comment, place) VALUES (?, ?, ?, ?, ?)',
        [original, original, date, comment, place]
      );

      res.json({ success: true, id: result.insertId });
    } catch (dbErr) {
      console.error('DB 저장 오류:', dbErr);
      const filePath = path.join(UPLOAD_DIR, original);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ error: 'DB 저장 실패', details: dbErr.message });
    }
  });
});

// DELETE 사진
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await db.query('SELECT original FROM personal_photo WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: '사진을 찾을 수 없습니다.' });

    const { original } = rows[0];
    const filePath = path.join(UPLOAD_DIR, original);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query('DELETE FROM personal_photo WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: '삭제 실패', details: err.message });
  }
});

// GET 다운로드
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: '파일이 존재하지 않습니다.' });
  res.download(filePath);
});

module.exports = router;
