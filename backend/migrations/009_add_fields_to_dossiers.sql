-- 009_add_fields_to_dossiers.sql
-- Add new fields to dossiers table for detailed management
ALTER TABLE `dossiers`
ADD COLUMN `clientId` BIGINT UNSIGNED NULL AFTER `structur_id`,
ADD COLUMN `dpiNumber` VARCHAR(255) NULL AFTER `documentType`,
ADD COLUMN `quotationStep` TINYINT(1) NOT NULL DEFAULT 0 AFTER `dpiNumber`,
ADD COLUMN `contactName` VARCHAR(255) NULL AFTER `contactId`,
ADD COLUMN `contactPhone` VARCHAR(50) NULL AFTER `contactName`,
ADD COLUMN `contactEmail` VARCHAR(255) NULL AFTER `contactPhone`,
ADD COLUMN `observations` TEXT NULL AFTER `description`,
ADD COLUMN `fileUrl` VARCHAR(255) NULL AFTER `observations`,
ADD COLUMN `validatedByAgentId` BIGINT UNSIGNED NULL AFTER `fileUrl`,
ADD CONSTRAINT `fk_dossiers_client` FOREIGN KEY (`clientId`) REFERENCES `clients` (`IDClients`) ON DELETE SET NULL,
ADD CONSTRAINT `fk_dossiers_validator` FOREIGN KEY (`validatedByAgentId`) REFERENCES `Agents` (`IDAgents`) ON DELETE SET NULL;
