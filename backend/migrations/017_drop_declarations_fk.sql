-- Migration: Drop IDDeclarations foreign key constraint
-- Description: Removes the foreign key constraint that prevents note creation when IDDeclarations is not provided

ALTER TABLE `notesdedetails`
DROP FOREIGN KEY `notesdedetails_ibfk_2`;
