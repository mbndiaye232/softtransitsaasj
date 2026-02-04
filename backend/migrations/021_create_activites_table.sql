-- Create activites table
CREATE TABLE IF NOT EXISTS activites (
    id_activite INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL,
    structur_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (structur_id) REFERENCES structur(IDSociete) ON DELETE CASCADE
);

-- Create tier_activites join table
CREATE TABLE IF NOT EXISTS tier_activites (
    id_tier INT NOT NULL,
    id_activite INT NOT NULL,
    PRIMARY KEY (id_tier, id_activite),
    FOREIGN KEY (id_tier) REFERENCES tiers(IDTiers) ON DELETE CASCADE,
    FOREIGN KEY (id_activite) REFERENCES activites(id_activite) ON DELETE CASCADE
);

-- Seed default activities (for all structures initially, or we could seed per structure)
-- Using structur_id NULL for global defaults if needed, but the plan said filtered by structur_id.
-- Let's insert them for existing structures or just as generic ones.
-- The app seems to use structur_id for multitenancy.

-- Inserting defaults for existing structures
INSERT INTO activites (libelle, structur_id)
SELECT 'Magasinage', IDSociete FROM structur
ON DUPLICATE KEY UPDATE libelle=libelle;

INSERT INTO activites (libelle, structur_id)
SELECT 'Manutention', IDSociete FROM structur
ON DUPLICATE KEY UPDATE libelle=libelle;

INSERT INTO activites (libelle, structur_id)
SELECT 'Transport aérien', IDSociete FROM structur
ON DUPLICATE KEY UPDATE libelle=libelle;

INSERT INTO activites (libelle, structur_id)
SELECT 'Transport maritime', IDSociete FROM structur
ON DUPLICATE KEY UPDATE libelle=libelle;

INSERT INTO activites (libelle, structur_id)
SELECT 'Transport terrestre', IDSociete FROM structur
ON DUPLICATE KEY UPDATE libelle=libelle;
