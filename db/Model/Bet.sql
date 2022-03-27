--
-- AutoBetter API.
-- Prepared SQL queries for 'bet' definition.
--


--
-- SELECT template for table `bet`
--
SELECT `id`, `date`, `odds`, `ev`, `race` FROM `bet` WHERE 1;

--
-- INSERT template for table `bet`
--
INSERT INTO `bet`(`id`, `date`, `odds`, `ev`, `race`) VALUES (?, ?, ?, ?, ?);

--
-- UPDATE template for table `bet`
--
UPDATE `bet` SET `id` = ?, `date` = ?, `odds` = ?, `ev` = ?, `race` = ? WHERE 1;

--
-- DELETE template for table `bet`
--
DELETE FROM `bet` WHERE 0;

