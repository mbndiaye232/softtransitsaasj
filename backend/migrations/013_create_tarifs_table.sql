-- Migration: Create tarifs (junction table) 
-- Description: Creates the tarifs table linking products, tax rates, and tax types

CREATE TABLE IF NOT EXISTS tarifs (
    IDTarifs BIGINT PRIMARY KEY AUTO_INCREMENT,
    NTS VARCHAR(50) NOT NULL COMMENT 'HS Code from products',
    CodeTaux VARCHAR(50) NOT NULL COMMENT 'Tax rate code',
    CodeTaxe VARCHAR(50) NOT NULL COMMENT 'Tax type code',
    IDTaux BIGINT NOT NULL COMMENT 'Foreign key to taux table',
    IDTaxes BIGINT NOT NULL COMMENT 'Foreign key to taxes table',
    IDProduits BIGINT NOT NULL COMMENT 'Foreign key to produits table',
    IdAgent INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for efficient lookups
    INDEX idx_nts (NTS),
    INDEX idx_code_taux (CodeTaux),
    INDEX idx_code_taxe (CodeTaxe),
    INDEX idx_id_taux (IDTaux),
    INDEX idx_id_taxes (IDTaxes),
    INDEX idx_id_produits (IDProduits),
    INDEX idx_id_agent (IdAgent),
    
    -- Composite index for common queries
    INDEX idx_nts_code_taux (NTS, CodeTaux),
    INDEX idx_produit_taux (IDProduits, IDTaux),
    
    -- Foreign key constraints
    CONSTRAINT fk_tarifs_taux FOREIGN KEY (IDTaux) REFERENCES taux(IDTaux) ON DELETE CASCADE,
    CONSTRAINT fk_tarifs_taxes FOREIGN KEY (IDTaxes) REFERENCES taxes(IDTaxes) ON DELETE CASCADE,
    CONSTRAINT fk_tarifs_produits FOREIGN KEY (IDProduits) REFERENCES produits(IDProduits) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
