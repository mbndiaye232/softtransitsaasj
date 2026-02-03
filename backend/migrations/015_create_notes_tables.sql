-- Migration: Create notesdedetails and articles tables
-- Description: Creates the tables for storing note details and their associated articles.

CREATE TABLE IF NOT EXISTS `notesdedetails` (
  `IDNotesDeDetails` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `IDDossiers` BIGINT UNSIGNED NOT NULL,
  `Repertoire` VARCHAR(255) NULL,
  `NINEA` VARCHAR(255) NULL,
  `Provenance` VARCHAR(255) NULL,
  `IdAgent` INT DEFAULT 0,
  `DateCreation` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `MontantFretTotalDevise` DECIMAL(15, 3) DEFAULT 0,
  `MontantAssurancesTotalDevise` DECIMAL(15, 3) DEFAULT 0,
  INDEX `idx_dossier` (`IDDossiers`),
  CONSTRAINT `fk_notes_dossiers` FOREIGN KEY (`IDDossiers`) REFERENCES `dossiers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `articles` (
  `IDArticles` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `IDNotesDeDetails` BIGINT NOT NULL,
  `NumeroArticle` VARCHAR(50) NULL,
  `NTS` VARCHAR(50) NULL,
  `Libelle` VARCHAR(255) NULL,
  `CodeRegimeDeclaration` VARCHAR(50) NULL,
  `Origine` VARCHAR(50) NULL,
  `Provenance` VARCHAR(50) NULL,
  `FOB` DECIMAL(15, 3) DEFAULT 0,
  `FRET` DECIMAL(15, 3) DEFAULT 0,
  `ASSURANCES` DECIMAL(15, 3) DEFAULT 0,
  `BRUT` DECIMAL(15, 3) DEFAULT 0,
  `IdAgent` INT DEFAULT 0,
  `FOBCFA` DECIMAL(15, 3) DEFAULT 0,
  `FRETCFA` DECIMAL(15, 3) DEFAULT 0,
  `ASSURANCESCFA` DECIMAL(15, 3) DEFAULT 0,
  `CAF` DECIMAL(15, 3) DEFAULT 0,
  `IDDEVISEFOB` INT DEFAULT NULL,
  `IDDEVISEFRET` INT DEFAULT NULL,
  `IDDEVISEASS` INT DEFAULT NULL,
  INDEX `idx_notes` (`IDNotesDeDetails`),
  CONSTRAINT `fk_articles_notes` FOREIGN KEY (`IDNotesDeDetails`) REFERENCES `notesdedetails` (`IDNotesDeDetails`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
