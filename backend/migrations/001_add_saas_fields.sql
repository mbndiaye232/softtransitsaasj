-- Migration Script: Add SaaS fields to existing schema
-- Version: 1.0
-- Date: 2025-11-28

USE soft_transit_saas;

-- =====================================================
-- 1. Modify Pays table (Countries) - Add TEC settings
-- =====================================================
ALTER TABLE `Pays` 
ADD COLUMN `tec_settings` TEXT COMMENT 'Country-specific TEC configuration (JSON)' AFTER `NomPaysEng`;

-- =====================================================
-- 2. Modify structur table - Add SaaS fields
-- =====================================================
ALTER TABLE `structur`
ADD COLUMN `credit_balance` DECIMAL(24,6) DEFAULT 0 COMMENT 'Current credit balance' AFTER `autrecachet`,
ADD COLUMN `is_active` TINYINT DEFAULT 1 COMMENT 'Account active status' AFTER `credit_balance`,
ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Registration date' AFTER `is_active`,
ADD COLUMN `subscription_start` DATE NULL COMMENT 'Subscription start date' AFTER `created_at`,
ADD COLUMN `subscription_end` DATE NULL COMMENT 'Subscription end date' AFTER `subscription_start`,
ADD COLUMN `last_credit_purchase` TIMESTAMP NULL COMMENT 'Last credit purchase timestamp' AFTER `subscription_end`;

CREATE INDEX `IDX_structur_is_active` ON `structur` (`is_active`);
CREATE INDEX `IDX_structur_created_at` ON `structur` (`created_at`);

-- =====================================================
-- 3. Modify Agents table - Add Authentication fields
-- =====================================================
ALTER TABLE `Agents`
ADD COLUMN `structur_id` BIGINT NOT NULL COMMENT 'Company association' AFTER `IDAgents`,
ADD COLUMN `password_hash` VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'Hashed password' AFTER `Login`,
ADD COLUMN `two_factor_enabled` TINYINT DEFAULT 0 COMMENT '2FA activation flag' AFTER `password_hash`,
ADD COLUMN `two_factor_secret` VARCHAR(255) NULL COMMENT 'TOTP secret for 2FA' AFTER `two_factor_enabled`,
ADD COLUMN `reset_token` VARCHAR(255) NULL COMMENT 'Password reset token' AFTER `two_factor_secret`,
ADD COLUMN `reset_token_expires` TIMESTAMP NULL COMMENT 'Token expiration' AFTER `reset_token`,
ADD COLUMN `role` VARCHAR(20) DEFAULT 'USER' COMMENT 'User role: ADMIN, USER, AGENT' AFTER `reset_token_expires`,
ADD COLUMN `last_login` TIMESTAMP NULL COMMENT 'Last login timestamp' AFTER `role`,
ADD COLUMN `is_active` TINYINT DEFAULT 1 COMMENT 'Account active status' AFTER `last_login`;

-- Add foreign key for structur_id
ALTER TABLE `Agents` 
ADD CONSTRAINT `FK_Agents_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE CASCADE;

CREATE INDEX `IDX_Agents_structur_id` ON `Agents` (`structur_id`);
CREATE INDEX `IDX_Agents_role` ON `Agents` (`role`);
CREATE INDEX `IDX_Agents_is_active` ON `Agents` (`is_active`);
CREATE INDEX `IDX_Agents_reset_token` ON `Agents` (`reset_token`);

-- =====================================================
-- 4. Create credit_rules table
-- =====================================================
CREATE TABLE `credit_rules` (
  `id` BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `operation_type` VARCHAR(100) NOT NULL COMMENT 'Operation type identifier',
  `operation_name` VARCHAR(200) NOT NULL COMMENT 'Human-readable operation name',
  `cost` DECIMAL(24,6) NOT NULL DEFAULT 0 COMMENT 'Credit cost per operation',
  `duration_factor` DECIMAL(10,4) NULL COMMENT 'Cost multiplier based on duration (optional)',
  `is_active` TINYINT DEFAULT 1 COMMENT 'Rule active status',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX `IDX_credit_rules_operation_type` ON `credit_rules` (`operation_type`);
CREATE INDEX `IDX_credit_rules_is_active` ON `credit_rules` (`is_active`);

-- =====================================================
-- 5. Create credit_logs table
-- =====================================================
CREATE TABLE `credit_logs` (
  `id` BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `structur_id` BIGINT NOT NULL COMMENT 'Company ID',
  `user_id` BIGINT NULL COMMENT 'Agent/User who performed the action',
  `amount` DECIMAL(24,6) NOT NULL COMMENT 'Credit amount (negative for consumption, positive for purchase)',
  `balance_after` DECIMAL(24,6) NOT NULL COMMENT 'Balance after transaction',
  `operation_type` VARCHAR(100) NULL COMMENT 'Type of operation',
  `description` VARCHAR(500) NOT NULL COMMENT 'Transaction description',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

ALTER TABLE `credit_logs`
ADD CONSTRAINT `FK_credit_logs_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE CASCADE,
ADD CONSTRAINT `FK_credit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `Agents` (`IDAgents`) ON DELETE SET NULL;

CREATE INDEX `IDX_credit_logs_structur_id` ON `credit_logs` (`structur_id`);
CREATE INDEX `IDX_credit_logs_user_id` ON `credit_logs` (`user_id`);
CREATE INDEX `IDX_credit_logs_created_at` ON `credit_logs` (`created_at`);
CREATE INDEX `IDX_credit_logs_operation_type` ON `credit_logs` (`operation_type`);

-- =====================================================
-- 6. Add structur_id to primary entity tables
-- =====================================================

-- Dossiers
ALTER TABLE `Dossiers`
ADD COLUMN `structur_id` BIGINT NOT NULL COMMENT 'Company ID' AFTER `IDDossiers`,
ADD CONSTRAINT `FK_Dossiers_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE CASCADE;
CREATE INDEX `IDX_Dossiers_structur_id` ON `Dossiers` (`structur_id`);

-- CLIENTS
ALTER TABLE `CLIENTS`
ADD COLUMN `structur_id` BIGINT NOT NULL COMMENT 'Company ID' AFTER `IDCLIENTS`,
ADD CONSTRAINT `FK_CLIENTS_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE CASCADE;
CREATE INDEX `IDX_CLIENTS_structur_id` ON `CLIENTS` (`structur_id`);

-- Tiers
ALTER TABLE `Tiers`
ADD COLUMN `structur_id` BIGINT NOT NULL COMMENT 'Company ID' AFTER `IDTiers`,
ADD CONSTRAINT `FK_Tiers_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE CASCADE;
CREATE INDEX `IDX_Tiers_structur_id` ON `Tiers` (`structur_id`);

-- Factures
ALTER TABLE `Factures`
ADD COLUMN `structur_id` BIGINT NOT NULL COMMENT 'Company ID' AFTER `IDFactures`,
ADD CONSTRAINT `FK_Factures_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE CASCADE;
CREATE INDEX `IDX_Factures_structur_id` ON `Factures` (`structur_id`);

-- Cotations
ALTER TABLE `Cotations`
ADD COLUMN `structur_id` BIGINT NOT NULL COMMENT 'Company ID' AFTER `IDCotations`,
ADD CONSTRAINT `FK_Cotations_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE CASCADE;
CREATE INDEX `IDX_Cotations_structur_id` ON `Cotations` (`structur_id`);

-- BordereauxDeLivraisons
ALTER TABLE `BordereauxDeLivraisons`
ADD COLUMN `structur_id` BIGINT NOT NULL COMMENT 'Company ID' AFTER `IDBordereauxDeLivraisons`,
ADD CONSTRAINT `FK_BordereauxDeLivraisons_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE CASCADE;
CREATE INDEX `IDX_BordereauxDeLivraisons_structur_id` ON `BordereauxDeLivraisons` (`structur_id`);

-- OrdresTransit
ALTER TABLE `OrdresTransit`
ADD COLUMN `structur_id` BIGINT NOT NULL COMMENT 'Company ID' AFTER `IDOrdresTransit`,
ADD CONSTRAINT `FK_OrdresTransit_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE CASCADE;
CREATE INDEX `IDX_OrdresTransit_structur_id` ON `OrdresTransit` (`structur_id`);

-- BillOfLanding
ALTER TABLE `BillOfLanding`
ADD COLUMN `structur_id` BIGINT NOT NULL COMMENT 'Company ID' AFTER `idbl`,
ADD CONSTRAINT `FK_BillOfLanding_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE CASCADE;
CREATE INDEX `IDX_BillOfLanding_structur_id` ON `BillOfLanding` (`structur_id`);

-- Booking
ALTER TABLE `Booking`
ADD COLUMN `structur_id` BIGINT NOT NULL COMMENT 'Company ID' AFTER `IDBooking`,
ADD CONSTRAINT `FK_Booking_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE CASCADE;
CREATE INDEX `IDX_Booking_structur_id` ON `Booking` (`structur_id`);

-- Declarations
ALTER TABLE `Declarations`
ADD COLUMN `structur_id` BIGINT NOT NULL COMMENT 'Company ID' AFTER `IDDeclarations`,
ADD CONSTRAINT `FK_Declarations_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE CASCADE;
CREATE INDEX `IDX_Declarations_structur_id` ON `Declarations` (`structur_id`);

-- =====================================================
-- 7. Insert default credit rules
-- =====================================================
INSERT INTO `credit_rules` (`operation_type`, `operation_name`, `cost`, `duration_factor`, `is_active`) VALUES
('dossier_create', 'Création de Dossier', 5.00, NULL, 1),
('dossier_update', 'Modification de Dossier', 1.00, NULL, 1),
('declaration_create', 'Création de Déclaration', 10.00, NULL, 1),
('facture_create', 'Création de Facture', 3.00, NULL, 1),
('cotation_create', 'Création de Cotation', 2.00, NULL, 1),
('bl_create', 'Création de Bill of Lading', 5.00, NULL, 1),
('client_create', 'Création de Client', 1.00, NULL, 1);

-- =====================================================
-- Migration Complete
-- =====================================================
