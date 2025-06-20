// 📁 server/src/routes/admin/general/generalcompanydocpage.js

const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ 동적으로 cid 폴더 분기 저장 가능하게 설정
// __dirname = project/server/src/routes/admin/general
// 네 단계 올라가서 project/server/public/uploads/... 으로 연결
const rootPath = path.join(__dirname, '../../../../public/uploads/company/cdoc_upload');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const cid = req.body.cid || 'unknown';
    const targetPath = path.join(rootPath, cid);
    if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath, { recursive: true });
    cb(null, targetPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const cid = req.body.cid || 'unknown';
    const filename = `${cid}_${timestamp}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// 📄 전체 목록 조회
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, cid, filename, originalname, comment, upload_date
       FROM company_data
       ORDER BY upload_date DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '목록 조회 실패' });
  }
});

// 📄 CID 리스트 조회
router.get('/cidlist', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT cid
       FROM company_data
       ORDER BY cid ASC`
    );
    // 배열 형태로 ["cat1", "cat2", ...] 반환
    res.json(rows.map(r => r.cid));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'CID 리스트 조회 실패' });
  }
});

// ✅ 파일 업로드
router.post('/upload', upload.single('file'), async (req, res) => {
  const { cid, comment } = req.body;
  const file = req.file;
  if (!cid || !file) {
    return res.status(400).json({ error: '필수값 누락' });
  }

  try {
    await db.query(
      `INSERT INTO company_data (cid, filename, originalname, comment)
       VALUES (?, ?, ?, ?)`,
      [cid, `${cid}/${file.filename}`, file.originalname, comment || '']
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '업로드 실패' });
  }
});

// ✅ 삭제 (폴더 분기 포함)
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [[record]] = await db.query('SELECT filename FROM company_data WHERE id = ?', [id]);
    if (record?.filename) {
      const filePath = path.join(rootPath, record.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM company_data WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

module.exports = router; 
