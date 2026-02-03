-- Migration Script: Create dossier_cotations table
-- Version: 1.0
-- Date: 2026-02-02

USE soft_transit_saas;

CREATE TABLE IF NOT EXISTS `dossier_cotations` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `dossier_id` BIGINT NOT NULL,
  `agent_id` BIGINT NOT NULL,
  `date_effet` DATE NOT NULL COMMENT 'Start date of the assignment',
  `date_fin` DATE NULL COMMENT 'End date of the assignment',
  `motif_fin` TEXT NULL COMMENT 'Reason for ending the assignment',
  `is_active` TINYINT DEFAULT 1 COMMENT '1 if current assignment, 0 otherwise',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `FK_cotations_dossier` FOREIGN KEY (`dossier_id`) REFERENCES `dossiers` (`IDDossiers`) ON DELETE CASCADE,
  CONSTRAINT `FK_cotations_agent` FOREIGN KEY (`agent_id`) REFERENCES `Agents` (`IDAgents`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Index for searching cotations by dossier
CREATE INDEX `IDX_cotations_dossier` ON `dossier_cotations` (`dossier_id`);
-- Index for finding active cotations quickly
CREATE INDEX `IDX_cotations_active` ON `dossier_cotations` (`dossier_id`, `is_active`);
