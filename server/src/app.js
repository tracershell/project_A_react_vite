require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// ✅ Redis v3 방식 (connect() 없음)
const redis = require('redis');
const connectRedis = require('connect-redis');

// ✅ RedisStore 생성자 정의
const RedisStore = connectRedis(session);

// ✅ Redis client 생성 (v3)
const redisClient = redis.createClient(
  parseInt(process.env.REDIS_PORT) || 6379,
  process.env.REDIS_HOST || 'localhost'
);

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 세션 설정
app.use(
  session({
    store: new RedisStore({ client: redisClient, prefix: 'sess:' }),
    secret: process.env.SESSION_SECRET || 'my-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60, // 1시간
    },
  })
);

// ✅ 정적 파일 서비스 (React 빌드 폴더) 
app.use(express.static(path.join(__dirname, '../../client/dist')));

// ✅ API 라우터 연결
app.use('/api/hello', require('./routes/hello'));                   // 🔥 /api/hello → auth/hello.js로 연결
app.use('/api/auth', require('./routes/auth'));                     // 🔥 /api/auth → auth/index.js로 연결
app.use('/api/auth/register', require('./routes/auth/register'));   // 🔥 /api/auth/register → register.js로 연결
app.use('/api/log', require('./routes/log'));                       // ✅ log 라우터

// ✅ SPA fallback 처리 (React 라우터 대응)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`✅ Express server running at http://localhost:${PORT}`);
});
