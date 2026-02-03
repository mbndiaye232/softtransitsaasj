-- Add group reference to Agents table
ALTER TABLE `Agents` 
ADD COLUMN `IDGroupes` BIGINT NULL AFTER `structur_id`,
ADD KEY `fk_agents_groupes` (`IDGroupes`),
ADD CONSTRAINT `fk_agents_groupes` 
  FOREIGN KEY (`IDGroupes`) REFERENCES `groupes` (`IDGroupes`) 
  ON DELETE SET NULL;
