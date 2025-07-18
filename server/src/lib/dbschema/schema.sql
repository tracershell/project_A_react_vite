CREATE DATABASE IF NOT EXISTS apple2ne1_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE apple2ne1_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,                    
  username VARCHAR(50) NOT NULL UNIQUE,                 
  password VARCHAR(255) NOT NULL,                       
  email VARCHAR(100),                                    
  name VARCHAR(100),                                    
  role ENUM('admin', 'user') DEFAULT 'user',            
  status ENUM('active', 'inactive', 'personal', 'family') DEFAULT 'active',    
  last_login DATETIME,                                   
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,       
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
              ON UPDATE CURRENT_TIMESTAMP                
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS employees (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  status VARCHAR(10),
  eid VARCHAR(10),
  name VARCHAR(60),
  ss VARCHAR(20),
  birth DATE,
  email VARCHAR(60),
  phone VARCHAR(60),
  jcode VARCHAR(10),
  jtitle VARCHAR(60),
  sdate DATE,
  edate DATE,
  sick DECIMAL(5,2),
  vac DECIMAL(5,2),
  workl VARCHAR(20),
  address VARCHAR(100),
  city VARCHAR(50),
  state VARCHAR(50),
  zip VARCHAR(20),
  remark TEXT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;



CREATE TABLE IF NOT EXISTS employees_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eid VARCHAR(50) NOT NULL,      
  filename VARCHAR(255) NOT NULL, 
  originalname VARCHAR(255),      
  comment VARCHAR(255),            
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;



CREATE TABLE IF NOT EXISTS employees_photo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eid VARCHAR(50) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  originalname VARCHAR(255),
  comment VARCHAR(255),
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;


-- 1) import_vendors 테이블
CREATE TABLE import_vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  deposit_rate DECIMAL(5,2) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(50),
  street VARCHAR(200),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  nation VARCHAR(50),
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;

-- 2) import_extra_items 테이블
CREATE TABLE import_extra_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  extra_no VARCHAR(100) NOT NULL UNIQUE,
  po_no VARCHAR(100) NOT NULL,
  rate_apply ENUM('환율적용', '환율비적용') NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;



==========================================================

CREATE TABLE import_po_list (
  id              INT               AUTO_INCREMENT PRIMARY KEY,
  vendor_id       INT               NOT NULL
    COMMENT 'import_vendors.id 참조',
  po_date         DATE              NOT NULL,
  style_no        VARCHAR(100),
  po_no           VARCHAR(100)      NOT NULL UNIQUE,
  pcs             INT               NOT NULL,
  cost_rmb        DECIMAL(12,2)     NOT NULL,
  -- 계산 컬럼: pcs * cost_rmb
  t_amount_rmb    DECIMAL(14,2)     AS (pcs * cost_rmb) STORED,
  note            TEXT,
  -- dp/bp 요약 필드 (중복 저장)
  dp_amount_rmb   DECIMAL(14,2)     NOT NULL DEFAULT 0.00,
  dp_status       ENUM('', 'paid')  NOT NULL DEFAULT '',
  bp_amount_rmb   DECIMAL(14,2)     NOT NULL DEFAULT 0.00,
  bp_status       ENUM('', 'paid')  NOT NULL DEFAULT '',
  created_at      TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP         DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (vendor_id)
    REFERENCES import_vendors(id)
      ON DELETE RESTRICT
      ON UPDATE CASCADE
) ENGINE=InnoDB
  CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

------------------------------------------------------------
vendor_name, deposit_rate는 import_vendors에서 조인해 꺼내 쓰는 걸 추천드립니다.

t_amount_rmb는 MySQL의 STORED Generated Column으로 선언해서 항상 pcs * cost_rmb를 보장합니다.

------------------------------------------------------------

CREATE TABLE import_temp (
  id               INT               AUTO_INCREMENT PRIMARY KEY,
  po_id            INT               NULL
    COMMENT 'import_po_list.id, 새 P/O면 NULL',
  vendor_id        INT               NOT NULL
    COMMENT 'import_vendors.id 참조',
  vendor_name      VARCHAR(100)      NOT NULL,
  deposit_rate     DECIMAL(5,2)      NOT NULL,
  po_date          DATE              NOT NULL,
  style_no         VARCHAR(100),
  po_no            VARCHAR(100)      NOT NULL,
  pcs              INT               NOT NULL,
  cost_rmb         DECIMAL(12,2)     NOT NULL,
  t_amount_rmb     DECIMAL(14,2)     AS (pcs * cost_rmb) STORED
    COMMENT '자동 계산: pcs * cost_rmb',
  -- 입금 필드
  dp_amount_rmb    DECIMAL(14,2)     DEFAULT 0.00,
  dp_date          DATE              DEFAULT NULL,
  dp_exrate        DECIMAL(10,4)     DEFAULT NULL,
  dp_amount_usd    DECIMAL(14,2)     DEFAULT 0.00,
  dp_status        ENUM('', 'paid')  NOT NULL DEFAULT '',
  -- 잔금 필드
  bp_amount_rmb    DECIMAL(14,2)     DEFAULT 0.00,
  bp_date          DATE              DEFAULT NULL,
  bp_exrate        DECIMAL(10,4)     DEFAULT NULL,
  bp_amount_usd    DECIMAL(14,2)     DEFAULT 0.00,
  bp_status        ENUM('', 'paid')  NOT NULL DEFAULT '',
  note             TEXT,
  user_id          VARCHAR(100)      NOT NULL
    COMMENT '세션에서 가져온 사용자 ID',
  created_at       TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (po_id)      REFERENCES import_po_list(id),
  FOREIGN KEY (vendor_id)  REFERENCES import_vendors(id)
) ENGINE=InnoDB
  CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  -----------------------------------------------------------


-- 1) 확정된 입금 이력 테이블
CREATE TABLE import_deposit_list (
  id               INT               AUTO_INCREMENT PRIMARY KEY,

  -- PO 마스터 참조
  po_id            INT               NOT NULL
    COMMENT 'import_po_list.id 참조',
  vendor_id        INT               NOT NULL
    COMMENT 'import_vendors.id 참조',
  vendor_name      VARCHAR(100)      NOT NULL,
  deposit_rate     DECIMAL(5,2)      NOT NULL,

  -- PO 기본 정보
  po_date          DATE              NOT NULL,
  style_no         VARCHAR(100),
  po_no            VARCHAR(100)      NOT NULL,
  pcs              INT               NOT NULL,
  cost_rmb         DECIMAL(12,2)     NOT NULL,
  t_amount_rmb     DECIMAL(14,2)     AS (pcs * cost_rmb) STORED
    COMMENT '자동 계산: pcs * cost_rmb',

  -- 입금 전용 필드
  dp_amount_rmb    DECIMAL(14,2)     NOT NULL,
  dp_date          DATE              NOT NULL,
  dp_exrate        DECIMAL(10,4)     NOT NULL
    COMMENT '사용된 환율',
  dp_amount_usd    DECIMAL(14,2)     NOT NULL,
  dp_status        ENUM('', 'paid')  NOT NULL DEFAULT ''
    COMMENT '입금 상태',

  note             TEXT,
  created_at       TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (po_id)     REFERENCES import_po_list(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES import_vendors(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

  -----------------------------------------------------------
-- 2) 확정된 잔금 이력 테이블
CREATE TABLE import_balance_list (
  id               INT               AUTO_INCREMENT PRIMARY KEY,

  -- PO 마스터 참조
  po_id            INT               NOT NULL
    COMMENT 'import_po_list.id 참조',
  vendor_id        INT               NOT NULL
    COMMENT 'import_vendors.id 참조',
  vendor_name      VARCHAR(100)      NOT NULL,
  deposit_rate     DECIMAL(5,2)      NOT NULL,

  -- PO 기본 정보
  po_date          DATE              NOT NULL,
  style_no         VARCHAR(100),
  po_no            VARCHAR(100)      NOT NULL,
  pcs              INT               NOT NULL,
  cost_rmb         DECIMAL(12,2)     NOT NULL,
  t_amount_rmb     DECIMAL(14,2)     AS (pcs * cost_rmb) STORED
    COMMENT '자동 계산: pcs * cost_rmb',

  -- 입금 요약 (balance에도 표시)
  dp_amount_rmb    DECIMAL(14,2)     NOT NULL
    COMMENT '누적/마지막 입금 금액',

  -- 잔금 전용 필드
  bp_amount_rmb    DECIMAL(14,2)     NOT NULL,
  bp_date          DATE              NOT NULL,
  bp_exrate        DECIMAL(10,4)     NOT NULL,
  bp_amount_usd    DECIMAL(14,2)     NOT NULL,
  bp_status        ENUM('', 'paid')  NOT NULL DEFAULT ''
    COMMENT '잔금 상태',

  note             TEXT,
  created_at       TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (po_id)     REFERENCES import_po_list(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES import_vendors(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-----------------------------------------------------------------------------

t_amount_rmb는 Generated Column으로 pcs * cost_rmb를 자동 계산합니다.

dp_amount_usd와 bp_amount_usd도 각각 환율(dp_exrate/bp_exrate) 기준으로 저장된 금액을 자동 계산합니다.

po_id와 vendor_id에는 외래키 제약을 걸어 데이터 무결성을 확보합니다.

두 이력 테이블 모두 PO 마스터의 주요 정보(vendor_name, deposit_rate, po_date 등)를 복제해 조인 없이 바로 조회할 수 있게 했습니다.

-----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payroll_tax (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eid VARCHAR(50) NOT NULL,          -- 직원 ID (employees.eid)
  name VARCHAR(100) NOT NULL,        -- 직원 이름
  jcode VARCHAR(20),                 -- 직책 코드
  jtitle VARCHAR(50),                -- 직책 이름
  workl VARCHAR(50),                 -- 근무지(location)

  pdate DATE NOT NULL,               -- 급여 지급일
  ckno VARCHAR(20),                  -- 체크 번호

  rtime DECIMAL(10,2) DEFAULT 0,     -- Regular Time
  otime DECIMAL(10,2) DEFAULT 0,     -- Over Time
  dtime DECIMAL(10,2) DEFAULT 0,     -- Double Time

  fw DECIMAL(10,2) DEFAULT 0,        -- Federal Withholding
  sse DECIMAL(10,2) DEFAULT 0,       -- Social Security
  me DECIMAL(10,2) DEFAULT 0,        -- Medicare
  caw DECIMAL(10,2) DEFAULT 0,       -- California Withholding
  cade DECIMAL(10,2) DEFAULT 0,      -- California Disability

  adv DECIMAL(10,2) DEFAULT 0,       -- Advance
  csp DECIMAL(10,2) DEFAULT 0,       -- Child Support
  dd DECIMAL(10,2) DEFAULT 0,        -- Direct Deposit Fee

  gross DECIMAL(10,2) DEFAULT 0,     -- 총 지급액
  tax DECIMAL(10,2) DEFAULT 0,       -- 총 공제액
  net DECIMAL(10,2) DEFAULT 0,       -- 실지급액

  remark VARCHAR(255),               -- 비고
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


  -----------------------------------------------------------


CREATE TABLE IF NOT EXISTS sickpv_data (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  eid VARCHAR(10),               -- 직원 ID
  name VARCHAR(60),              -- 직원 이름 (참조용)
  givensick INT DEFAULT 0,       -- 지급된 병가 일수
  sickdate DATE,                 -- 병가 사용 날짜
  sickhour DECIMAL(5,2),        -- 병가 시간 (예: 1.50)
  givenpv INT DEFAULT 0,        -- 지급된 개인휴가 일수
  pvdate DATE,                  -- 개인휴가 사용 날짜
  pvhour DECIMAL(5,2),          -- 개인휴가 시간 (예: 0.75)
  remark TEXT                   -- 비고
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;


CREATE TABLE sickpv_given (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  eid VARCHAR(10),                          -- 직원 ID
  name VARCHAR(60),                         -- 직원 이름
  sickgiven DECIMAL(5,2) DEFAULT 0.00,      -- 지급된 병가 시간
  pvgiven DECIMAL(5,2) DEFAULT 0.00,        -- 지급된 유급휴가 시간
  remark TEXT                               -- 비고
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;


==========================================================


CREATE TABLE IF NOT EXISTS creditcard_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pdate DATE NOT NULL,                          -- 결제 날짜
  ptype VARCHAR(10),                            -- Check or ACH
  ptname VARCHAR(30),                           -- Check number or null
  pamount DECIMAL(12,2),                        -- 결제 금액
  provider VARCHAR(50),                         -- 카드사 (예: Chase, Amex 등)
  anumber VARCHAR(20),                          -- 카드 번호
  holder VARCHAR(50),                           -- 카드 소유자 이름
  hnumber VARCHAR(20),                          -- 카드 고유번호 또는 끝 4자리
  udate DATE,                                   -- 사용일자
  aitem VARCHAR(50),                            -- 사용내역 (purchase, auto gas 등)
  icode VARCHAR(10),                            -- 코드 (예: 670, 350)
  inote TEXT,                                   -- 사용 메모
  uamount DECIMAL(12,2),                        -- 실제 사용 금액
  uremark TEXT                                  -- 사용 상세 비고
) CHARACTER SET utf8mb4;


CREATE TABLE IF NOT EXISTS creditcard_holder (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(50),                         -- 카드사
  anumber VARCHAR(20),                          -- 카드 번호
  holder VARCHAR(50),                           -- 소유자 이름
  hnumber VARCHAR(20),                          -- 고유 번호 (끝 4자리 등)
  hlimit DECIMAL(12,2),                         -- 한도
  hnote TEXT                                     -- 비고
) CHARACTER SET utf8mb4;


CREATE TABLE IF NOT EXISTS creditcard_item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aitem VARCHAR(50),                            -- 분류명 (예: purchase, auto gas)
  icode VARCHAR(10),                            -- 코드 (예: 670, 350)
  inote TEXT                                     -- 분류 설명
) CHARACTER SET utf8mb4;


==========================================================

CREATE TABLE IF NOT EXISTS payroll_doc (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dtype VARCHAR(50),      -- 'child_support' 같은 구분자
  filename VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

==========================================================

CREATE TABLE IF NOT EXISTS envelope_senderdata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sname VARCHAR(100) DEFAULT 'ARGUS US INC',
  sstreet VARCHAR(255) DEFAULT '2055 E. 51st Street',
  scity VARCHAR(100) DEFAULT 'VERNON',
  sstate VARCHAR(10) DEFAULT 'CA',
  szip VARCHAR(10) DEFAULT '90058'
);

CREATE TABLE IF NOT EXISTS envelope_receiverdata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rcode VARCHAR(20),
  rname VARCHAR(100),
  ratt VARCHAR(100),
  rstreet VARCHAR(255),
  rcity VARCHAR(100),
  rstate VARCHAR(10),
  rzip VARCHAR(10)
);

==========================================================

CREATE TABLE IF NOT EXISTS petty_ledger (
  id INT AUTO_INCREMENT PRIMARY KEY,         -- 고유 ID
  pldate DATE NOT NULL,                      -- 거래 날짜
  plcredit DECIMAL(10,2) DEFAULT 0,          -- 입금
  pldebit DECIMAL(10,2) DEFAULT 0,           -- 출금
  plbalance DECIMAL(10,2) DEFAULT 0,         -- 잔액 (입력/수정 후 재계산됨)
  plcomment VARCHAR(255),                    -- 비고
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,                       -- 생성일
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- 수정일
) CHARACTER SET utf8mb4;

==========================================================

CREATE TABLE IF NOT EXISTS company_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cid VARCHAR(50) NOT NULL,      
  filename VARCHAR(255) NOT NULL, 
  originalname VARCHAR(255),      
  comment VARCHAR(255),            
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;


==========================================================



CREATE TABLE IF NOT EXISTS bankbalance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  row_index INT NOT NULL UNIQUE,       -- ✅ UNIQUE 제약 추가
  category VARCHAR(100) DEFAULT '',
  item VARCHAR(100) DEFAULT '',
  amount DECIMAL(12,2) DEFAULT 0.00,
  comment VARCHAR(255) DEFAULT '',
  selected TINYINT(1) DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

==========================================================


CREATE TABLE IF NOT EXISTS apar_preparation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_no VARCHAR(50) NOT NULL,
  po_date DATE DEFAULT NULL,
  po_amount_usd DECIMAL(12,2) DEFAULT 0.00,
  dp_date DATE DEFAULT NULL,
  dp_amount_usd DECIMAL(12,2) DEFAULT 0.00,
  bp_date DATE DEFAULT NULL,
  bp_amount_usd DECIMAL(12,2) DEFAULT 0.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_po_no (po_no)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;


==========================================================

CREATE TABLE IF NOT EXISTS ap_beginning (
  id INT PRIMARY KEY DEFAULT 1,
  beginning_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00
);


CREATE TABLE IF NOT EXISTS ap_purchase_temp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pur_date DATE NOT NULL,
  pur_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS ap_payment_temp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pay_date DATE NOT NULL,
  pay_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00
);



==========================================================

CREATE TABLE IF NOT EXISTS ar_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ar_date DATE NOT NULL,          -- 기준 월 (예: '2025-06-01')
  hq_sales DECIMAL(14,2) DEFAULT 0,     -- 본사 매출
  sr_sales DECIMAL(14,2) DEFAULT 0,     -- 쇼룸 매출
  ar_report DECIMAL(14,2) DEFAULT 0,    -- AR 보고 금액
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

==========================================================

CREATE TABLE IF NOT EXISTS bankrecord_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,                    -- 기록 날짜
  rtype VARCHAR(100) NOT NULL,           -- 기록 유형 (예: 입금, 출금, 이체 등)
  amount DECIMAL(12,2) NOT NULL,         -- 금액 (천 단위 ',' 표시는 클라이언트에서 처리)
  comment VARCHAR(255) DEFAULT '',       -- 코멘트 또는 설명
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


==========================================================

CREATE TABLE personal_photo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original VARCHAR(255) NOT NULL,
  thumbnail VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  code VARCHAR(100),
  comment TEXT NOT NULL,
  place VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4;


CREATE TABLE IF NOT EXISTS personal_music (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original VARCHAR(255) NOT NULL,         -- 음악 파일명
  textfile VARCHAR(255),                  -- 텍스트 파일명 (.txt)
  date DATE NOT NULL,                     -- 등록일
  comment VARCHAR(255) NOT NULL,          -- 설명
  keyword VARCHAR(100) NOT NULL,          -- 검색용 키워드
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS personal_movie (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original VARCHAR(255),
  thumbnail VARCHAR(255),
  date DATE,
  comment TEXT,
  keyword VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;


==========================================================




