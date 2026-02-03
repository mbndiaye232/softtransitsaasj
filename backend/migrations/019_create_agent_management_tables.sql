-- Migration Script: Create Agent Management and Audit Log tables
-- Version: 1.1
-- Date: 2026-01-31

USE soft_transit_saas;

-- 1. Add is_provider to structur table
ALTER TABLE `structur` 
ADD COLUMN `is_provider` TINYINT DEFAULT 0 COMMENT 'Flag for the app publisher company' AFTER `is_active`;

-- Set the provider company (default ID 1 based on current DB state)
UPDATE `structur` SET `is_provider` = 1 WHERE IDSociete = 1;

-- 2. Create permissions table
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Short code for the module/feature',
  `name` VARCHAR(100) NOT NULL COMMENT 'Human readable name of the feature',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Create agent_permissions table
CREATE TABLE IF NOT EXISTS `agent_permissions` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `agent_id` BIGINT NOT NULL,
  `permission_id` INT NOT NULL,
  `can_view` TINYINT DEFAULT 0,
  `can_create` TINYINT DEFAULT 0,
  `can_edit` TINYINT DEFAULT 0,
  `can_delete` TINYINT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `FK_agent_permissions_agent` FOREIGN KEY (`agent_id`) REFERENCES `Agents` (`IDAgents`) ON DELETE CASCADE,
  CONSTRAINT `FK_agent_permissions_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `UK_agent_permission` (`agent_id`, `permission_id`)
) ENGINE=InnoDB;

-- 4. Create audit_logs table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `agent_id` BIGINT NULL,
  `structur_id` BIGINT NULL,
  `action` VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, VIEW, LOGIN, etc.',
  `resource_type` VARCHAR(50) NOT NULL COMMENT 'DOSSIER, CLIENT, AGENT, etc.',
  `resource_id` VARCHAR(100) NULL COMMENT 'ID of the affected resource',
  `details` TEXT NULL COMMENT 'JSON or descriptive text of the change',
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `FK_audit_logs_agent` FOREIGN KEY (`agent_id`) REFERENCES `Agents` (`IDAgents`) ON DELETE SET NULL,
  CONSTRAINT `FK_audit_logs_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Create indexes for audit_logs
CREATE INDEX `IDX_audit_logs_created_at` ON `audit_logs` (`created_at`);
CREATE INDEX `IDX_audit_logs_agent_id` ON `audit_logs` (`agent_id`);
CREATE INDEX `IDX_audit_logs_structur_id` ON `audit_logs` (`structur_id`);
CREATE INDEX `IDX_audit_logs_resource` ON `audit_logs` (`resource_type`, `resource_id`);

-- 5. Seed initial permissions
INSERT INTO `permissions` (`code`, `name`) VALUES
('DOSSIERS', 'Gestion des Dossiers'),
('CLIENTS', 'Gestion des Clients'),
('FACTURES', 'Gestion des Factures'),
('COTATIONS', 'Gestion des Cotations'),
('NOTES', 'Notes de Détails'),
('STRUCTURES', 'Configuration Sociétés'),
('AGENTS', 'Gestion des Agents'),
('PAYS', 'Référentiel Pays'),
('TAXES', 'Référentiel Taxes'),
('DEVISES', 'Référentiel Devises');
