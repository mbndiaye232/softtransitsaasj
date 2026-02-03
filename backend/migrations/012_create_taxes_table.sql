-- Migration: Create taxes (tax types) table
-- Description: Creates the taxes table to store different types of taxes (customs, VAT, etc.)

CREATE TABLE IF NOT EXISTS taxes (
    IDTaxes BIGINT PRIMARY KEY AUTO_INCREMENT,
    CodeTaxe VARCHAR(50) NOT NULL UNIQUE,
    LibelleTaxe VARCHAR(255) DEFAULT '',
    IdAgent INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code_taxe (CodeTaxe),
    INDEX idx_id_agent (IdAgent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
