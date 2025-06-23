// server/src/app.js
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Redis v3 방식 (connect() 없음)
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

// 2) React 빌드 결과물 정적 서빙
const distPath = path.join(__dirname, '../../client/dist');
app.use(express.static(distPath));

// 3) 절대 경로 /assets/* → dist/assets
app.use('/assets', express.static(path.join(distPath, 'assets')));

// 4) URL 중간에 /assets/ 포함된 nested asset 요청 처리
app.get(/\/assets\/.+/, (req, res, next) => {
  const [, assetPath] = req.path.split('/assets/');
  if (!assetPath) return next();
  res.sendFile(path.join(distPath, 'assets', assetPath));
});

//  employees data /e_uploads location 처리
app.use('/e_uploads', express.static(path.join(__dirname, '../public/uploads/e_uploads'))
);


// 5) API 라우터 연결 (static 서빙보다 위, SPA fallback보다 아래)
app.use('/api/auth', require('./routes/auth/auth'));
app.use('/api/auth/register', require('./routes/auth/register'));
app.use('/api/log', require('./routes/log'));

app.use('/api/admin/main/bpage', require('./routes/admin/main/bpage'));
app.use('/api/admin/main/cpage', require('./routes/admin/main/cpage'));
app.use('/api/admin/main/cpage', require('./routes/admin/main/cpage'));
app.use('/api/admin/main/fpage', require('./routes/admin/main/fpage'));
app.use('/api/admin/employees/employeeslistpage', require('./routes/admin/employees/employeeslistpage'));
app.use('/api/admin/employees/employeesdata', require('./routes/admin/employees/employeesdatapage'));
app.use('/api/admin/employees/employeesphotopage', require('./routes/admin/employees/employeesphotopage'));
app.use('/api/admin/employees/employeesphotofetch', require('./routes/admin/employees/employeesphotofetch'));

app.use('/api/admin/import/vendors', require('./routes/admin/import/importvendorspage'));
app.use('/api/admin/import/po', require('./routes/admin/import/importpopage'));
app.use('/api/admin/import/deposit', require('./routes/admin/import/importdepositpage'));
app.use('/api/admin/import/deposit', require('./routes/admin/import/deposit_temp'));
app.use('/api/admin/import/balance', require('./routes/admin/import/importbalancepage'));
app.use('/api/admin/import/balance', require('./routes/admin/import/balance_temp'));
app.use('/api/admin/import/pdf', require('./routes/admin/import/import_payments_pdf'));
app.use('/api/admin/import/extra', require('./routes/admin/import/importextraitemspage'));

app.use('/api/admin/payroll/payrolltax', require('./routes/admin/payroll/payrolltaxpage'));
app.use('/api/admin/payroll/payrolltaxaudit', require('./routes/admin/payroll/payrolltaxauditpage'));
app.use('/api/admin/payroll/payrollindividual', require('./routes/admin/payroll/payrollindividualpage'));
app.use('/api/admin/payroll/payrollclassification', require('./routes/admin/payroll/payrollclassificationpage'));
app.use('/api/admin/payroll/payrollsalaryadjust', require('./routes/admin/payroll/payrollsalaryadjustpage'));

app.use('/api/admin/payroll/sick', require('./routes/admin/payroll/payrollsickpage'));
app.use('/api/admin/payroll/sickinput', require('./routes/admin/payroll/payrollsickinputpage'));
app.use('/api/admin/payroll/pvinput', require('./routes/admin/payroll/payrollpvinputpage'));
app.use('/api/admin/payroll/giveninput', require('./routes/admin/payroll/payrollgiveninputpage'));

app.use('/api/admin/payroll/payrolldoc', require('./routes/admin/payroll/payrolldocpage'));

//app.use('/api/admin/import/extra/pdf', require('./routes/admin/import/import_extra_pdf'));    server/src/utils/generateSalaryAdjustPDF.js
app.use('/api/admin/account/accountbankbalance', require('./routes/admin/account/accountbankbalancepage'));
app.use('/api/admin/account/accountcreditcardpage', require('./routes/admin/account/accountcreditcardpage'));
app.use('/api/admin/account/accountccpaypage', require('./routes/admin/account/accountccpaypage'));
app.use('/api/admin/account/accountccitempage', require('./routes/admin/account/accountccitempage'));
app.use('/api/admin/account/accountccholderpage', require('./routes/admin/account/accountccholderpage'));
app.use('/api/admin/account/apar', require('./routes/admin/account/accountaparpage'));
app.use('/api/admin/account/ap', require('./routes/admin/account/accountappage'));

app.use('/api/admin/general/generalenvelopeinput', require('./routes/admin/general/generalenvelopeinputpage'));
app.use('/api/admin/general/generalenvelope', require('./routes/admin/general/generalenvelopepage'));

app.use('/api/admin/account/accountpettymoney', require('./routes/admin/account/accountpettymoneypage'));
app.use('/api/admin/account/accountpettymoneysubmit', require('./routes/admin/account/accountpettymoneysubmitpage'));


app.use('/api/admin/general/companydoc', require('./routes/admin/general/generalcompanydocpage'));


// ✔️ fpage 확인용
console.log('🔌 Mounting fpageview router at /api/admin/main/fpage');


// 6) SPA fallback: 확장자 없는 모든 요청에 index.html 반환
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 7) 서버 시작
app.listen(PORT, () => {
  console.log(`✅ Express server running at http://localhost:${PORT}`);
});
