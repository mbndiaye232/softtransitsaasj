-- Migration: Add path columns for cachets
-- Version: 1.1
-- Date: 2025-11-28

USE soft_transit_saas;

ALTER TABLE `structur`
ADD COLUMN `chemin_cachet_facture` VARCHAR(255) NULL COMMENT 'Path to invoice stamp' AFTER `cachetfacture`,
ADD COLUMN `chemin_cachet_livraison` VARCHAR(255) NULL COMMENT 'Path to delivery stamp' AFTER `cachetlivraison`,
ADD COLUMN `chemin_cachet_autre` VARCHAR(255) NULL COMMENT 'Path to other stamp' AFTER `autrecachet`;
