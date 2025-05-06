const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envMode = process.env.NODE_ENV || 'local';
const envFileName = `.env.${envMode}`;

// ✅ 수정된 경로 계산: 실행 디렉토리 기준으로 탐색
const envFilePath = path.resolve(process.cwd(), envFileName);

if (fs.existsSync(envFilePath)) {
  dotenv.config({ path: envFilePath });
  console.log(`✅ Loaded ${envFileName}`);
} else {
  console.warn(`⚠️ ${envFileName} not found. Using defaults or system env.`);
}
