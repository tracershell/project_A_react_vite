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
