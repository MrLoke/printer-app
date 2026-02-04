-- Tworzenie bazy danych
CREATE DATABASE IF NOT EXISTS cdn_etykiety CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cdn_etykiety;

-- Tabela produktów
CREATE TABLE IF NOT EXISTS produkty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nazwa VARCHAR(255) NOT NULL,
  kod VARCHAR(100),
  kod_kreskowy VARCHAR(13),
  stan DECIMAL(10,2) DEFAULT 0,
  stan_mag_ol DECIMAL(10,2) DEFAULT 0,
  stan_mag_l DECIMAL(10,2) DEFAULT 0,
  stan_mag_o DECIMAL(10,2) DEFAULT 0,
  mag_d DECIMAL(10,2) DEFAULT 0,
  mag_b DECIMAL(10,2) DEFAULT 0,
  mag_e DECIMAL(10,2) DEFAULT 0,
  mag_m DECIMAL(10,2) DEFAULT 0,
  mag_d2 DECIMAL(10,2) DEFAULT 0,
  data_utworzenia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_modyfikacji TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nazwa (nazwa),
  INDEX idx_kod (kod),
  INDEX idx_kod_kreskowy (kod_kreskowy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela magazynów produktów (dla szczegółowych informacji)
CREATE TABLE IF NOT EXISTS produkty_magazyny (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produkt_id INT NOT NULL,
  magazyn VARCHAR(10) NOT NULL,
  stan DECIMAL(10,2) DEFAULT 0,
  lokalizacja VARCHAR(50),
  FOREIGN KEY (produkt_id) REFERENCES produkty(id) ON DELETE CASCADE,
  INDEX idx_produkt (produkt_id),
  INDEX idx_magazyn (magazyn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela historii drukowania
CREATE TABLE IF NOT EXISTS historia_drukowania (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produkt_id INT,
  kod_towaru VARCHAR(13),
  ilosc_etykiet INT NOT NULL,
  kraj_pochodzenia VARCHAR(50),
  data_druku TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uzytkownik VARCHAR(100),
  FOREIGN KEY (produkt_id) REFERENCES produkty(id) ON DELETE SET NULL,
  INDEX idx_data_druku (data_druku),
  INDEX idx_produkt (produkt_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Przykładowe dane testowe
INSERT INTO produkty (nazwa, kod, kod_kreskowy, stan, stan_mag_ol, stan_mag_l, mag_d, mag_b, mag_e, mag_m, mag_l, mag_d2, mag_o) VALUES
('Klamka VENUS M1 mosiadz B/O', 'VEN-M1-BO', '6420334000257', 15, 5, 3, 0, 8, 0, 0, 3, 0, 4),
('Klamka MARS aluminium silver', 'MAR-AL-SL', '6420334000264', 23, 10, 8, 5, 0, 0, 0, 8, 0, 10),
('Zamek JUPITER stal nierdzewna', 'JUP-ST-NR', '6420334000271', 45, 20, 15, 10, 0, 0, 0, 15, 0, 20),
('Klamka SATURN plastik czarny', 'SAT-PL-CZ', '6420334000288', 8, 3, 2, 0, 5, 0, 0, 2, 0, 1),
('Zawiasy NEPTUN mosiądz', 'NEP-MO', '6420334000295', 67, 30, 25, 12, 0, 0, 0, 25, 0, 30);

-- Szczegóły magazynowe dla pierwszego produktu
INSERT INTO produkty_magazyny (produkt_id, magazyn, stan, lokalizacja) VALUES
(1, 'D', 0, 'A1-R1-P1'),
(1, 'B', 8, 'B2-R3-P5'),
(1, 'E', 0, 'C1-R2-P3'),
(1, 'M', 0, 'D1-R1-P2'),
(1, 'L', 3, 'E2-R4-P1'),
(1, 'OL', 5, 'F1-R2-P4'),
(1, 'O', 4, 'G1-R3-P2');

-- Przykładowa historia drukowania
INSERT INTO historia_drukowania (produkt_id, kod_towaru, ilosc_etykiet, kraj_pochodzenia, uzytkownik) VALUES
(1, '6420334000257', 30, 'UE', 'admin'),
(2, '6420334000264', 50, 'Polska', 'admin'),
(3, '6420334000271', 25, 'Chiny', 'admin');