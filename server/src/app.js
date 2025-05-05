const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// ✅ 라우터 가져오기
const helloRouter = require('./routes/hello.js');         // /api/hello → 반드시 존재해야 함
const loginRouter = require('./routes/auth/login.js');    // /api/auth/login → 반드시 존재해야 함

dotenv.config();  // .env 파일 로드

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 공통 미들웨어 등록
app.use(cors());
app.use(express.json());

// ✅ API 라우터 연결
app.use('/api/hello', helloRouter);
app.use('/api/auth', loginRouter);

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
