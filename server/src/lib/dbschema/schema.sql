CREATE DATABASE IF NOT EXISTS apple2ne1_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE apple2ne1_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,                    
  username VARCHAR(50) NOT NULL UNIQUE,                 
  password VARCHAR(255) NOT NULL,                       
  email VARCHAR(100),                                    
  name VARCHAR(100),                                    
  role ENUM('admin', 'user') DEFAULT 'user',            
  status ENUM('active', 'inactive') DEFAULT 'active',    
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
  sick INT,
  vac INT,
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


CREATE TABLE import_po (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  po_date DATE NOT NULL,
  style_no VARCHAR(100),
  po_no VARCHAR(100) NOT NULL UNIQUE,
  pcs INT NOT NULL,
  cost_rmb DECIMAL(12,2) NOT NULL,
  note TEXT,
  dp_amount_rmb DECIMAL(14,2) NOT NULL DEFAULT 0,
  dp_status   ENUM('', 'paid')      NOT NULL DEFAULT '',
  bp_amount_rmb DECIMAL(14,2) NOT NULL DEFAULT 0,
  bp_status   ENUM('', 'paid')      NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES import_vendors(id)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;


CREATE TABLE import_deposit_temp (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_name VARCHAR(100) NOT NULL,
  deposit_rate DECIMAL(5,2) NOT NULL,
  vendor_id INT NOT NULL,
  po_date DATE NOT NULL,
  style_no VARCHAR(100),
  po_no VARCHAR(100) NOT NULL,
  pcs INT NOT NULL,
  cost_rmb DECIMAL(12,2) NOT NULL,
  t_amount_rmb DECIMAL(14,2) NOT NULL,
  dp_amount_rmb DECIMAL(14,2) NOT NULL,
  dp_date DATE,
  dp_rate DECIMAL(8,4),
  dp_amount_usd DECIMAL(14,2),
  dp_status ENUM('', 'paid') NOT NULL DEFAULT '',
  note TEXT,
  user_id VARCHAR(100) NOT NULL,
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
  dp_amount_usd    DECIMAL(14,2)     AS (CASE WHEN dp_exrate>0 THEN dp_amount_rmb/dp_exrate ELSE 0 END) STORED,
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
  bp_amount_usd    DECIMAL(14,2)     AS (CASE WHEN bp_exrate>0 THEN bp_amount_rmb/bp_exrate ELSE 0 END) STORED,
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