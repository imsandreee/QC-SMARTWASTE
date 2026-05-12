-- ============================================
--  BINTRACK - Smart Waste Bin Monitoring System
--  Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS bintrack_db;
USE bintrack_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS bin_status;
DROP TABLE IF EXISTS bins;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS barangays;
SET FOREIGN_KEY_CHECKS = 1;

-- ──────────────────────────────────────────
-- 1. BARANGAYS (location groupings)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS barangays (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  city       VARCHAR(100) NOT NULL DEFAULT 'Quezon City',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────
-- 2. USERS (admin / collector / citizen)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  full_name    VARCHAR(150) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('admin','collector','citizen') NOT NULL DEFAULT 'citizen',
  phone        VARCHAR(20),
  barangay_id  INT,
  avatar_url   VARCHAR(255),
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (barangay_id) REFERENCES barangays(id) ON DELETE SET NULL
);

-- ──────────────────────────────────────────
-- 3. BINS (physical bin records)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  bin_code      VARCHAR(30) NOT NULL UNIQUE,
  location_name VARCHAR(200) NOT NULL,
  latitude      DECIMAL(10,7) NOT NULL,
  longitude     DECIMAL(10,7) NOT NULL,
  barangay_id   INT,
  capacity_L    INT NOT NULL DEFAULT 120,
  bin_type      ENUM('general','recyclable','hazardous','biodegradable') DEFAULT 'general',
  assigned_collector_id INT,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  installed_at  DATE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (barangay_id) REFERENCES barangays(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_collector_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ──────────────────────────────────────────
-- 4. BIN_STATUS (sensor / mock readings)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bin_status (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  bin_id        INT NOT NULL,
  fill_level    TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0-100 percent',
  status        ENUM('empty','half','full') GENERATED ALWAYS AS (
                  CASE
                    WHEN fill_level <= 30 THEN 'empty'
                    WHEN fill_level <= 70 THEN 'half'
                    ELSE 'full'
                  END
                ) STORED,
  temperature   DECIMAL(5,2),
  humidity      DECIMAL(5,2),
  battery_level TINYINT UNSIGNED DEFAULT 100,
  recorded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bin_id) REFERENCES bins(id) ON DELETE CASCADE,
  INDEX idx_bin_recorded (bin_id, recorded_at)
);

-- ──────────────────────────────────────────
-- 5. COLLECTIONS (pickup records)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collections (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  bin_id          INT NOT NULL,
  collector_id    INT NOT NULL,
  fill_level_before TINYINT UNSIGNED,
  fill_level_after  TINYINT UNSIGNED DEFAULT 0,
  notes           TEXT,
  collected_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bin_id) REFERENCES bins(id) ON DELETE CASCADE,
  FOREIGN KEY (collector_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ──────────────────────────────────────────
-- 6. REPORTS (citizen issue reports)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  bin_id       INT NOT NULL,
  citizen_id   INT NOT NULL,
  issue_type   ENUM('overflowing','damaged','missing','odor','fire','other') NOT NULL,
  description  TEXT,
  image_url    VARCHAR(255),
  status       ENUM('pending','acknowledged','resolved') NOT NULL DEFAULT 'pending',
  resolved_at  TIMESTAMP NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bin_id) REFERENCES bins(id) ON DELETE CASCADE,
  FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ──────────────────────────────────────────
-- 7. NOTIFICATIONS (SMS log)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  recipient_id INT,
  phone        VARCHAR(20) NOT NULL,
  message      TEXT NOT NULL,
  type         ENUM('bin_full','bin_half','collection_done','manual','report') DEFAULT 'manual',
  bin_id       INT,
  status       ENUM('sent','failed','pending') DEFAULT 'pending',
  sent_at      TIMESTAMP NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (bin_id) REFERENCES bins(id) ON DELETE SET NULL
);

-- ============================================
--  SEED DATA
-- ============================================

-- Barangays (Quezon City sample)
INSERT INTO barangays (name, city) VALUES
  ('Batasan Hills', 'Quezon City'),
  ('Commonwealth', 'Quezon City'),
  ('Loyola Heights', 'Quezon City'),
  ('UP Diliman', 'Quezon City'),
  ('South Triangle', 'Quezon City'),
  ('New Manila', 'Quezon City'),
  ('Socorro (Cubao)', 'Quezon City'),
  ('Fairview', 'Quezon City');

-- Default Admin
INSERT INTO users (full_name, email, password, role, phone, barangay_id) VALUES
  ('QC SmartWaste Admin', 'admin@bintrack.ph', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '09171234567', 1),
  ('Juan Dela Cruz', 'collector1@bintrack.ph', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'collector', '09181234567', 2),
  ('Pedro Santos', 'collector2@bintrack.ph', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'collector', '09191234567', 3),
  ('Maria Reyes', 'citizen@bintrack.ph', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'citizen', '09201234567', 4);
-- Default password for all seed users: "password"

-- Sample Bins (Quezon City coordinates area)
INSERT INTO bins (bin_code, location_name, latitude, longitude, barangay_id, capacity_L, bin_type, assigned_collector_id, installed_at) VALUES
  ('BIN-001', 'QC Memorial Circle - East Gate', 14.6515, 121.0493, 1, 120, 'general', 2, '2024-01-15'),
  ('BIN-002', 'SM North EDSA - Sky Garden', 14.6567, 121.0305, 1, 180, 'general', 2, '2024-01-15'),
  ('BIN-003', 'Trinoma Mall - North Entrance', 14.6545, 121.0345, 2, 120, 'recyclable', 2, '2024-02-01'),
  ('BIN-004', 'UP Diliman - Quezon Hall', 14.6534, 121.0685, 4, 120, 'general', 2, '2024-02-01'),
  ('BIN-005', 'Ateneo de Manila - Gate 3', 14.6394, 121.0772, 3, 240, 'general', 3, '2024-02-15'),
  ('BIN-006', 'Gateway Mall Cubao', 14.6219, 121.0531, 7, 180, 'general', 3, '2024-02-15'),
  ('BIN-007', 'Tomas Morato Ave - Cor. Sct. Borromeo', 14.6361, 121.0361, 5, 180, 'biodegradable', 3, '2024-03-01'),
  ('BIN-008', 'Robinsons Magnolia - Parking', 14.6152, 121.0344, 6, 120, 'general', 3, '2024-03-01'),
  ('BIN-009', 'Fairview Terraces - Main Entrance', 14.7335, 121.0581, 8, 120, 'general', 2, '2024-03-15'),
  ('BIN-010', 'La Mesa Eco Park - Picnic Area', 14.7135, 121.0741, 8, 120, 'recyclable', 2, '2024-03-15'),
  ('BIN-011', 'Sto. Domingo Church - Front Plaza', 14.6291, 121.0097, 6, 120, 'general', 3, '2024-04-01'),
  ('BIN-012', 'Batasan Pambansa - Main Road', 14.6923, 121.0954, 1, 120, 'general', 3, '2024-04-01');

-- Initial bin status (mock sensor readings)
INSERT INTO bin_status (bin_id, fill_level, temperature, humidity, battery_level) VALUES
  (1,  85, 31.2, 72.5, 95),
  (2,  20, 30.8, 68.1, 88),
  (3,  55, 32.0, 75.0, 72),
  (4,  92, 33.1, 71.2, 65),
  (5,  10, 29.5, 65.0, 100),
  (6,  70, 31.5, 73.8, 91),
  (7,  45, 30.2, 70.5, 83),
  (8,  78, 32.5, 76.0, 78),
  (9,  30, 29.8, 67.3, 96),
  (10, 62, 31.0, 72.0, 89),
  (11, 88, 33.5, 78.2, 61),
  (12, 15, 30.0, 66.5, 100);

-- Sample collections
INSERT INTO collections (bin_id, collector_id, fill_level_before, fill_level_after, notes) VALUES
  (1, 2, 95, 0, 'Collected and sanitized'),
  (4, 2, 88, 0, 'Waste disposed at landfill'),
  (6, 3, 75, 0, 'Regular collection round'),
  (8, 3, 90, 0, 'Double-bag collected');

-- Sample reports
INSERT INTO reports (bin_id, citizen_id, issue_type, description, status) VALUES
  (4, 4, 'overflowing', 'Bin is overflowing near Gaisano Mall', 'acknowledged'),
  (11, 4, 'odor', 'Strong odor coming from the bin', 'pending');
