-- Migration: Create produits table
-- Description: Table to store product information with HS codes

CREATE TABLE IF NOT EXISTS produits (
    IDProduits INT PRIMARY KEY,
    Libelle TEXT NOT NULL,
    NTS VARCHAR(20),
    IDAgents INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nts (NTS),
    INDEX idx_libelle (Libelle(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
