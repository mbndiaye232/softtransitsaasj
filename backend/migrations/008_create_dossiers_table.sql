-- 008_create_dossiers_table.sql
-- Migration to create the dossiers table for the dossier feature
CREATE TABLE IF NOT EXISTS `dossiers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `structur_id` BIGINT UNSIGNED NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `code` VARCHAR(255) NOT NULL,
  `shortCode` VARCHAR(255) NOT NULL,
  `nature` ENUM('IMP','EXP') NOT NULL,
  `mode` ENUM('MA','AE','TE') NOT NULL,
  `type` ENUM('TC','GR','CO') NOT NULL,
  `year` YEAR NOT NULL,
  `increment` INT UNSIGNED NOT NULL,
  `documentType` ENUM('BL','LTA','LVI') NOT NULL,
  `description` TEXT NULL,
  `contactId` BIGINT UNSIGNED NULL,
  `status` ENUM('OPEN','CLOSED','DELETED') NOT NULL DEFAULT 'OPEN',
  `isFacturable` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_code` (`code`),
  KEY `idx_structur` (`structur_id`),
  CONSTRAINT `fk_dossiers_structur` FOREIGN KEY (`structur_id`) REFERENCES `structures` (`IDStructur`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
