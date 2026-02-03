-- Migration: Add IDPays to structur table
-- Version: 1.2
-- Date: 2025-11-29

USE soft_transit_saas;

ALTER TABLE `structur`
ADD COLUMN `IDPays` INT NULL COMMENT 'Country ID' AFTER `NomSociete`;

-- Add foreign key if Pays table uses IDPays as primary key (assuming based on standard naming)
-- If Pays table PK is different, this might need adjustment. 
-- Based on common Windev patterns, it might be IDPays.
-- We will add the column first.
