const pool = require('../config/database');

async function runMigration() {
    try {
        console.log('Starting migration 018...');

        // 1. Update Taxes table
        // Check if column exists first to avoid error if re-run
        try {
            await pool.query(`ALTER TABLE taxes ADD COLUMN Base VARCHAR(10) DEFAULT 'V' COMMENT 'V=Valeur, QC=Quantité Colis, QM=Quantité Metrique, etc'`);
            console.log('Added Base column to taxes');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('Base column might already exist:', e.message);
        }

        try {
            await pool.query(`ALTER TABLE taxes ADD COLUMN Niveau INT DEFAULT 1 COMMENT 'Ordre de calcul'`);
            console.log('Added Niveau column to taxes');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.log('Niveau column might already exist:', e.message);
        }

        // 2. Create Taxes Complements
        await pool.query(`
            CREATE TABLE IF NOT EXISTS taxes_complements (
                IDTaxesComplements BIGINT PRIMARY KEY AUTO_INCREMENT,
                IDTaxesPrincipal BIGINT NOT NULL,
                CodeTaxePrincipal VARCHAR(50) NOT NULL,
                IDTaxesComplement BIGINT NOT NULL,
                CodeTaxeComplement VARCHAR(50) NOT NULL,
                INDEX idx_principal (IDTaxesPrincipal),
                CONSTRAINT fk_tax_comp_principal FOREIGN KEY (IDTaxesPrincipal) REFERENCES taxes(IDTaxes) ON DELETE CASCADE,
                CONSTRAINT fk_tax_comp_complement FOREIGN KEY (IDTaxesComplement) REFERENCES taxes(IDTaxes) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Created taxes_complements table');

        // 3. Create Liquidations Articles
        await pool.query(`
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
        `);
        console.log('Created liquidations_articles table');

        console.log('Migration 018 completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
