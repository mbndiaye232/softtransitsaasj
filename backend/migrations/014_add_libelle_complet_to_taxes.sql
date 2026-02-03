-- Migration: Add LibelleTaxeComplet to taxes table
-- Description: Adds a column to store the full description of the tax

ALTER TABLE `taxes`
ADD COLUMN `LibelleTaxeComplet` VARCHAR(255) DEFAULT '' COMMENT 'Full description of the tax' AFTER `LibelleTaxe`;
