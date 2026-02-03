-- Migration: Update Taxes and Create Liquidations
-- Description: Adds Base/Niveau to Taxes, creates Taxes Complements and Liquidations tables

-- 1. Update Taxes table
ALTER TABLE taxes
ADD COLUMN Base VARCHAR(10) DEFAULT 'V' COMMENT 'V=Valeur, QC=Quantité Colis, QM=Quantité Metrique, etc',
ADD COLUMN Niveau INT DEFAULT 1 COMMENT 'Ordre de calcul';

-- 2. Create Taxes Complements (Tax on Tax relationships)
-- Example: TVA (05) might be calculated on Base + DD (01) + RS (03)
CREATE TABLE IF NOT EXISTS taxes_complements (
    IDTaxesComplements BIGINT PRIMARY KEY AUTO_INCREMENT,
    IDTaxesPrincipal BIGINT NOT NULL COMMENT 'The tax being calculated (e.g. TVA)',
    CodeTaxePrincipal VARCHAR(50) NOT NULL,
    IDTaxesComplement BIGINT NOT NULL COMMENT 'The tax included in the base (e.g. DD)',
    CodeTaxeComplement VARCHAR(50) NOT NULL,
    INDEX idx_principal (IDTaxesPrincipal),
    CONSTRAINT fk_tax_comp_principal FOREIGN KEY (IDTaxesPrincipal) REFERENCES taxes(IDTaxes) ON DELETE CASCADE,
    CONSTRAINT fk_tax_comp_complement FOREIGN KEY (IDTaxesComplement) REFERENCES taxes(IDTaxes) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create Liquidations Articles (Stored calculations)
CREATE TABLE IF NOT EXISTS liquidations_articles (
    IDLiquidation BIGINT PRIMARY KEY AUTO_INCREMENT,
    IDArticles BIGINT NOT NULL,
    IDTaxes BIGINT NOT NULL,
    CodeTaxe VARCHAR(50) NOT NULL,
    LibelleTaxe VARCHAR(255),
    IDTaux BIGINT,
    TauxApplique DECIMAL(10, 2),
    BaseCalcul DECIMAL(15, 3) DEFAULT 0,
    Montant DECIMAL(15, 3) DEFAULT 0,
    Exclure BOOLEAN DEFAULT FALSE COMMENT 'ANePasLiquider',
    IdAgent INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_article (IDArticles),
    INDEX idx_taxe (IDTaxes),
    CONSTRAINT fk_liq_article FOREIGN KEY (IDArticles) REFERENCES articles(IDArticles) ON DELETE CASCADE,
    CONSTRAINT fk_liq_taxe FOREIGN KEY (IDTaxes) REFERENCES taxes(IDTaxes) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
