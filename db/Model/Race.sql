--
-- AutoBetter API.
-- Prepared SQL queries for 'race' definition.
--


--
-- SELECT template for table `race`
--
SELECT `id`, `date`, `course_name`, `number`, `url` FROM `race` WHERE 1;

--
-- INSERT template for table `race`
--
INSERT INTO `race`(`id`, `date`, `course_name`, `number`, `url`) VALUES (?, ?, ?, ?, ?);

--
-- UPDATE template for table `race`
--
UPDATE `race` SET `id` = ?, `date` = ?, `course_name` = ?, `number` = ?, `url` = ? WHERE 1;

--
-- DELETE template for table `race`
--
DELETE FROM `race` WHERE 0;

