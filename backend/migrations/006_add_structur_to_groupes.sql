-- Add multi-tenant support and soft delete to groupes table
ALTER TABLE `groupes` 
ADD COLUMN `structur_id` BIGINT NOT NULL AFTER `IDGroupes`,
ADD COLUMN `is_active` TINYINT DEFAULT 1 AFTER `Observations`,
ADD KEY `fk_groupes_structur` (`structur_id`),
ADD CONSTRAINT `fk_groupes_structur` 
  FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) 
  ON DELETE CASCADE;
