// 📁 server/routes/admin/personal/personalphotopage.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Image } = require('@napi-rs/image');
const path = require('path');
const fs = require('fs');
const db = require('../../../lib/db'); // MySQL pool

// 업로드·썸네일 디렉토리 설정
const UPLOAD_DIR = path.join(__dirname, '../../../../public/uploads/personal/photo_upload');
const THUMB_DIR  = path.join(UPLOAD_DIR, 'thumbnails');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(THUMB_DIR,  { recursive: true });

// Multer 설정
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const filename = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

/**
 * GET /api/admin/personal/photo
 *   모든 사진 목록 반환
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, original, thumbnail, date, comment, place FROM personal_photo ORDER BY created_at DESC'
    );
    res.json({ photos: rows });
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ error: '사진 목록 로드 실패' });
  }
});

/**
 * POST /api/admin/personal/photo/upload
 *   formData: { photo: File, date, comment, place }
 */
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const { date, comment, place } = req.body;
    const original = req.file.filename;
    const thumbnail = `thumb_${original}`;

    // 썸네일 생성
    const inputPath  = path.join(UPLOAD_DIR, original);
    const outputPath = path.join(THUMB_DIR, thumbnail);

    const buffer = fs.readFileSync(inputPath);
    const img    = Image.fromBufferSync(buffer);
    img.resize(200);          // 너비 200px, 자동 비율 유지
    img.save(outputPath);     // 동기 저장

    // DB에 저장
    await db.query(
      'INSERT INTO personal_photo (original, thumbnail, date, comment, place) VALUES (?, ?, ?, ?, ?)',
      [original, thumbnail, date, comment, place]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: '사진 업로드 실패' });
  }
});

/**
 * DELETE /api/admin/personal/photo/:id
 *   사진 및 썸네일 삭제, DB 레코드 삭제
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [[row]] = await db.query(
      'SELECT original, thumbnail FROM personal_photo WHERE id = ?',
      [id]
    );
    if (!row) return res.status(404).json({ error: '사진을 찾을 수 없습니다.' });

    // 파일 시스템에서 삭제
    [row.original, row.thumbnail].forEach(name => {
      const filePath = name.startsWith('thumb_')
        ? path.join(THUMB_DIR, name)
        : path.join(UPLOAD_DIR, name);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    // DB 레코드 삭제
    await db.query('DELETE FROM personal_photo WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({ error: '사진 삭제 실패' });
  }
});

module.exports = router;
