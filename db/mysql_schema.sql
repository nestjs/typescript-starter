/* SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO"; */
/* SET AUTOCOMMIT = 0; */
/* START TRANSACTION; */
/* SET time_zone = "+00:00"; */

-- --------------------------------------------------------

--
-- Table structure for table `bet` generated from model 'bet'
--

CREATE TABLE IF NOT EXISTS `bet` (
  `id` INT DEFAULT NULL,
  `date` TEXT DEFAULT NULL,
  `odds` INT DEFAULT NULL,
  `ev` DECIMAL(20, 9) DEFAULT NULL,
  `race` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `race` generated from model 'race'
--

CREATE TABLE IF NOT EXISTS `race` (
  `id` INT DEFAULT NULL,
  `date` TEXT DEFAULT NULL,
  `course_name` TEXT DEFAULT NULL,
  `number` INT DEFAULT NULL,
  `url` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


