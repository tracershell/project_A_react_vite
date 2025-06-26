// 📁 server/routes/admin/personal/personalmoviepage.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../../../lib/db');

const MOVIE_DIR = path.join(__dirname, '../../../../public/uploads/personal/movie_upload');
const THUMBNAIL_DIR = path.join(__dirname, '../../../../public/uploads/personal/movie-thumbnail_upload');

// Ensure folders exist
if (!fs.existsSync(MOVIE_DIR)) fs.mkdirSync(MOVIE_DIR, { recursive: true });
if (!fs.existsSync(THUMBNAIL_DIR)) fs.mkdirSync(THUMBNAIL_DIR, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'movie') cb(null, MOVIE_DIR);
    else cb(null, THUMBNAIL_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({ storage });

// ✅ GET: 전체 영화 목록 (keyword 검색)
router.get('/', async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const [rows] = await db.query(
      `SELECT * FROM personal_movie WHERE keyword LIKE ? ORDER BY id DESC`,
      [`%${keyword}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error('영화 목록 오류:', err);
    res.status(500).json({ error: '목록 불러오기 실패' });
  }
});

// ✅ POST: 업로드
router.post('/upload', upload.fields([
  { name: 'movie', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { date, comment, keyword } = req.body;
    const movieFile = req.files['movie']?.[0]?.filename;
    const thumbnail = req.files['thumbnail']?.[0]?.filename;

    if (!movieFile || !thumbnail || !date || !comment || !keyword) {
      return res.status(400).json({ error: '모든 필수 항목을 입력하세요.' });
    }

    await db.query(
      `INSERT INTO personal_movie (original, thumbnail, date, comment, keyword) VALUES (?, ?, ?, ?, ?)`,
      [movieFile, thumbnail, date, comment, keyword]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('업로드 오류:', err);
    res.status(500).json({ error: '업로드 실패' });
  }
});

// ✅ PUT: 수정
router.put('/:id', upload.fields([
  { name: 'movie', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const id = req.params.id;
    const { date, comment, keyword } = req.body;

    const [[existing]] = await db.query(
      `SELECT * FROM personal_movie WHERE id = ?`,
      [id]
    );
    if (!existing) return res.status(404).json({ error: '영화 정보 없음' });

    let movieFile = existing.original;
    let thumbnailFile = existing.thumbnail;

    // 새로 업로드된 파일이 있으면 기존 파일 삭제 후 교체
    if (req.files['movie']) {
      const newMovie = req.files['movie'][0].filename;
      const oldPath = path.join(MOVIE_DIR, movieFile);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      movieFile = newMovie;
    }

    if (req.files['thumbnail']) {
      const newThumb = req.files['thumbnail'][0].filename;
      const oldThumbPath = path.join(THUMBNAIL_DIR, thumbnailFile);
      if (fs.existsSync(oldThumbPath)) fs.unlinkSync(oldThumbPath);
      thumbnailFile = newThumb;
    }

    await db.query(
      `UPDATE personal_movie SET original=?, thumbnail=?, date=?, comment=?, keyword=? WHERE id=?`,
      [movieFile, thumbnailFile, date, comment, keyword, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('수정 오류:', err);
    res.status(500).json({ error: '수정 실패' });
  }
});

// ✅ DELETE: 삭제
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [[row]] = await db.query(
      `SELECT original, thumbnail FROM personal_movie WHERE id = ?`,
      [id]
    );
    if (!row) return res.status(404).json({ error: '기록 없음' });

    const moviePath = path.join(MOVIE_DIR, row.original);
    const thumbPath = path.join(THUMBNAIL_DIR, row.thumbnail);
    if (fs.existsSync(moviePath)) fs.unlinkSync(moviePath);
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

    await db.query(`DELETE FROM personal_movie WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

// ✅ 다운로드
router.get('/download/:filename', (req, res) => {
  const filePath = path.join(MOVIE_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('파일이 존재하지 않습니다.');
  res.download(filePath);
});

// ✅ keyword 목록
router.get('/keywords', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT keyword FROM personal_movie WHERE keyword IS NOT NULL AND keyword != '' ORDER BY keyword ASC`
    );
    res.json({ keywords: rows.map(r => r.keyword) });
  } catch (err) {
    console.error('Keyword 목록 오류:', err);
    res.status(500).json({ error: 'keyword 조회 실패' });
  }
});

module.exports = router;
