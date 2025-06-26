// ✅ personalmusicpage.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../../../lib/db');

const musicDir = path.join(__dirname, '../../../../public/uploads/personal/music_upload');
const textDir = path.join(__dirname, '../../../../public/uploads/personal/text_upload');
if (!fs.existsSync(musicDir)) fs.mkdirSync(musicDir, { recursive: true });
if (!fs.existsSync(textDir)) fs.mkdirSync(textDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'music') cb(null, musicDir);
      else cb(null, textDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
    }
  })
});

// ✅ GET list (optional keyword filter)
router.get('/', async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const [rows] = await db.query(
      `SELECT * FROM personal_music WHERE keyword LIKE ? ORDER BY id DESC`,
      [`%${keyword}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error('음악 목록 조회 오류:', err);
    res.status(500).json({ error: '음악 목록 로드 실패' });
  }
});

// ✅ POST upload
router.post('/upload', upload.fields([{ name: 'music' }, { name: 'text' }]), async (req, res) => {
  try {
    const { date, comment, keyword } = req.body;
    const musicFile = req.files['music']?.[0]?.filename;
    const textFile = req.files['text']?.[0]?.filename || null;

    if (!musicFile || !date || !comment || !keyword) {
      return res.status(400).json({ error: '필수 항목 누락' });
    }

    await db.query(
      `INSERT INTO personal_music (original, textfile, date, comment, keyword) VALUES (?, ?, ?, ?, ?)`,
      [musicFile, textFile, date, comment, keyword]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('업로드 오류:', err);
    res.status(500).json({ error: '업로드 실패' });
  }
});

// ✅ PUT edit
router.put('/:id', upload.fields([{ name: 'music' }, { name: 'text' }]), async (req, res) => {
  try {
    const { date, comment, keyword } = req.body;
    const id = req.params.id;
    const [[row]] = await db.query(`SELECT * FROM personal_music WHERE id = ?`, [id]);
    if (!row) return res.status(404).json({ error: '기록 없음' });

    let musicFile = row.original;
    let textFile = row.textfile;

    if (req.files['music']) {
      const newMusic = req.files['music'][0].filename;
      const oldPath = path.join(musicDir, musicFile);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      musicFile = newMusic;
    }

    if (req.files['text']) {
      const newText = req.files['text'][0].filename;
      const oldPath = path.join(textDir, textFile || '');
      if (textFile && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      textFile = newText;
    }

    await db.query(
      `UPDATE personal_music SET original=?, textfile=?, date=?, comment=?, keyword=? WHERE id=?`,
      [musicFile, textFile, date, comment, keyword, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('수정 오류:', err);
    res.status(500).json({ error: '수정 실패' });
  }
});

// ✅ DELETE
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [[row]] = await db.query(`SELECT original, textfile FROM personal_music WHERE id = ?`, [id]);
    if (!row) return res.status(404).json({ error: '파일 없음' });

    const musicPath = path.join(musicDir, row.original);
    const textPath = row.textfile ? path.join(textDir, row.textfile) : null;
    if (fs.existsSync(musicPath)) fs.unlinkSync(musicPath);
    if (textPath && fs.existsSync(textPath)) fs.unlinkSync(textPath);

    await db.query(`DELETE FROM personal_music WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

// ✅ download
router.get('/download/:filename', (req, res) => {
  const filePath = path.join(musicDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('파일 없음');
  res.download(filePath);
});

// ✅ get text content
router.get('/text/:filename', (req, res) => {
  const filePath = path.join(textDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('텍스트 없음');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).send('읽기 실패');
    res.send(data);
  });
});

// ✅ distinct keyword 목록 반환
router.get('/keywords', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT keyword FROM personal_music 
      WHERE keyword IS NOT NULL AND keyword != ''
      ORDER BY keyword ASC
    `);
    res.json({ keywords: rows.map(r => r.keyword) });
  } catch (err) {
    console.error('Keyword 목록 조회 오류:', err);
    res.status(500).json({ error: 'Keyword 조회 실패' });
  }
});


module.exports = router;
