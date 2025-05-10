// server/app.js
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Redis v3 방식
const redis = require('redis');
const connectRedis = require('connect-redis');
const RedisStore = connectRedis(session);
const redisClient = redis.createClient(
  parseInt(process.env.REDIS_PORT, 10) || 6379,
  process.env.REDIS_HOST || 'localhost'
);

redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('error', err => console.error('❌ Redis error:', err));

const app = express();
const PORT = process.env.PORT || 3000;

// 1) CORS, body-parsing, session 설정
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store: new RedisStore({ client: redisClient, prefix: 'sess:' }),
  secret: process.env.SESSION_SECRET || 'my-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 1000 * 60 * 60 }
}));

// 2) 정적 파일 서빙 (React 빌드 결과)
const distPath = path.join(__dirname, '../../client/dist');
app.use(express.static(distPath));

// 3) 절대 경로 /assets/* 도 dist/assets 에서 바로 서빙
app.use('/assets', express.static(path.join(distPath, 'assets')));

// 4) nested assets (예: /admin/.../assets/foo.js) 처리
//    URL에 /assets/ 가 포함된 요청을 캐치해서 dist/assets/* 에서 제공
app.get(/\/assets\/.+/, (req, res) => {
  // '/admin/.../assets/index-abc.js' → 'index-abc.js'
  const assetFile = req.path.split('/assets/')[1];
  res.sendFile(path.join(distPath, 'assets', assetFile));
});

// 5) API 라우터 연결
app.use('/api/auth', require('./routes/auth/auth'));
app.use('/api/auth/register', require('./routes/auth/register'));
app.use('/api/log', require('./routes/log'));

app.use('/api/admin/main/bpage', require('./routes/admin/main/bpage'));
app.use('/api/admin/main/cpage', require('./routes/admin/main/cpage'));
app.use('/api/admin/employees/employeeslistpage',
  require('./routes/admin/employees/employeeslistpage'));

app.use(
  '/api/admin/main/fpageview',
  require('./routes/admin/main/fpageview')
);

// 6) SPA fallback: 그 외 (확장자 없는) 모든 요청에 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 7) 서버 실행
app.listen(PORT, () => {
  console.log(`✅ Express server running at http://localhost:${PORT}`);
});
