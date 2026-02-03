-- Migration: Create Pays table
-- Version: 1.0
-- Date: 2025-11-30

USE soft_transit_saas;

CREATE TABLE IF NOT EXISTS `Pays` (
  `IDPays` INT NOT NULL PRIMARY KEY,
  `NomPays` VARCHAR(100) NOT NULL,
  `codePays3` VARCHAR(3) NULL,
  `CodePays2` VARCHAR(2) NULL,
  `CodeNumerique` INT NULL,
  `NomPaysEng` VARCHAR(100) NULL,
  `tec_settings` TEXT NULL COMMENT 'Country-specific TEC configuration (JSON)',
  INDEX `IDX_Pays_codePays3` (`codePays3`),
  INDEX `IDX_Pays_CodePays2` (`CodePays2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
