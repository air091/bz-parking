-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: bzparking_database
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `parking_slots`
--

DROP TABLE IF EXISTS `parking_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parking_slots` (
  `slot_id` int NOT NULL AUTO_INCREMENT,
  `location` varchar(50) NOT NULL,
  `status` enum('occupied','held','available','maintenace') DEFAULT NULL,
  `sensor_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `vehicle_type` enum('car','motor') DEFAULT NULL,
  PRIMARY KEY (`slot_id`),
  KEY `sensor_id` (`sensor_id`),
  CONSTRAINT `parking_slots_ibfk_1` FOREIGN KEY (`sensor_id`) REFERENCES `sensors` (`sensor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parking_slots`
--

LOCK TABLES `parking_slots` WRITE;
/*!40000 ALTER TABLE `parking_slots` DISABLE KEYS */;
INSERT INTO `parking_slots` VALUES (1,'GF','occupied',1,'2025-07-26 01:29:17','2025-07-31 09:58:38','car'),(2,'GF','occupied',2,'2025-07-26 01:29:17','2025-07-31 09:58:37','car'),(3,'BSMT','maintenace',3,'2025-07-26 01:29:17','2025-07-31 09:58:51','car'),(4,'GF','available',4,'2025-07-26 01:29:17','2025-07-31 09:58:33','motor'),(5,'BSMT','maintenace',5,'2025-07-26 01:29:17','2025-07-31 09:58:52','motor'),(6,'GF','available',6,'2025-07-26 01:29:17','2025-07-31 09:57:37','car'),(7,'GF','occupied',7,'2025-07-26 01:29:17','2025-07-31 09:57:34','motor'),(8,'BSMT','available',8,'2025-07-26 01:29:17','2025-07-31 09:58:56','motor'),(9,'GF','occupied',9,'2025-07-26 01:29:17','2025-07-31 09:57:27','motor'),(10,'GF','maintenace',10,'2025-07-26 01:29:17','2025-07-31 09:57:12','motor');
/*!40000 ALTER TABLE `parking_slots` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-31 19:01:30
