import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helloRouter from './routes/hello';  // 👈 추가된 라우터 import (/server/src/routes/hello.ts)

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ API 라우터 등록
app.use('/api/hello', helloRouter);  // 👈 /api/hello 경로로 접근

// ✅ 루트 요청 시 응답 (테스트용)
app.get('/', (req, res) => {
  res.send('🍎 Welcome to APPLE2NE1 Backend');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
