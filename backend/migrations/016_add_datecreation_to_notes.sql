-- Migration: Add DateCreation to notesdedetails
-- Description: Adds the DateCreation column which was missing.

ALTER TABLE `notesdedetails`
ADD COLUMN `DateCreation` DATETIME DEFAULT CURRENT_TIMESTAMP;
