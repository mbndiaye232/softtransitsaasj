-- Migration: Create taux (tax rates) table
-- Description: Creates the taux table to store various tax rates and fees

CREATE TABLE IF NOT EXISTS taux (
    IDTaux INT PRIMARY KEY AUTO_INCREMENT,
    CodeTaux VARCHAR(50) NOT NULL UNIQUE,
    Taux DECIMAL(10, 2) NOT NULL,
    IdAgent INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code_taux (CodeTaux),
    INDEX idx_id_agent (IdAgent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
