// server/routes/admin/employees/employeesphotofetch.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../../../public/uploads/ep_uploads');

router.get('/:eid', async (req, res) => {
  const { eid } = req.params;

  try {
    const files = fs.readdirSync(uploadDir);
    const matched = files.find(name => name.startsWith(eid + '_'));

    if (matched) {
      return res.json({ success: true, filename: matched });
    } else {
      return res.status(404).json({ success: false, error: '사진 없음' });
    }
  } catch (err) {
    console.error('❌ 사진 검색 오류:', err);
    return res.status(500).json({ success: false, error: '서버 오류' });
  }
});

module.exports = router;
