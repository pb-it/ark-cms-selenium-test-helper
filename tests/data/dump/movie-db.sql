-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: localhost    Database: cms
-- ------------------------------------------------------
-- Server version	8.0.36-0ubuntu0.22.04.1
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `cms`
--

/*!40000 DROP DATABASE IF EXISTS `cms`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `cms` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `cms`;

--
-- Table structure for table `_change`
--

DROP TABLE IF EXISTS `_change`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_change` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `method` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `data` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_change`
--

LOCK TABLES `_change` WRITE;
/*!40000 ALTER TABLE `_change` DISABLE KEYS */;
INSERT INTO `_change` VALUES (1,'2024-03-05 08:42:08.165','PUT','_model',5,'{\"name\": \"movies\", \"options\": {\"increments\": true, \"timestamps\": true}, \"attributes\": [{\"name\": \"name\", \"dataType\": \"string\"}, {\"name\": \"studio\", \"model\": \"studios\", \"dataType\": \"relation\", \"multiple\": false}, {\"name\": \"stars\", \"model\": \"stars\", \"dataType\": \"relation\", \"multiple\": true}]}'),(2,'2024-03-05 08:42:08.265','PUT','_model',6,'{\"name\": \"studios\", \"options\": {\"increments\": true, \"timestamps\": true}, \"attributes\": [{\"name\": \"name\", \"dataType\": \"string\"}, {\"via\": \"studio\", \"name\": \"movies\", \"model\": \"movies\", \"dataType\": \"relation\", \"multiple\": true}]}'),(3,'2024-03-05 08:42:08.364','PUT','_model',7,'{\"name\": \"stars\", \"options\": {\"increments\": true, \"timestamps\": true}, \"attributes\": [{\"name\": \"name\", \"dataType\": \"string\"}, {\"name\": \"gender\", \"options\": [{\"value\": \"male\"}, {\"value\": \"female\"}, {\"value\": \"other\"}], \"dataType\": \"enumeration\"}, {\"name\": \"movies\", \"model\": \"movies\", \"dataType\": \"relation\", \"multiple\": true}]}'),(4,'2024-03-05 08:42:08.744','POST','studios',1,'{\"name\": \"Marvel Studios\"}'),(5,'2024-03-05 08:42:08.772','POST','studios',2,'{\"name\": \"DC\"}'),(6,'2024-03-05 08:42:08.796','POST','studios',3,'{\"name\": \"Walt Disney Pictures\"}'),(7,'2024-03-05 08:42:08.820','POST','movies',1,'{\"name\": \"Iron Man\", \"studio\": 1}'),(8,'2024-03-05 08:42:08.847','POST','movies',2,'{\"name\": \"Thor\", \"studio\": 1}'),(9,'2024-03-05 08:42:08.871','POST','movies',3,'{\"name\": \"Avengers\", \"studio\": 1}'),(10,'2024-03-05 08:42:08.890','POST','movies',4,'{\"name\": \"Pirates of the Caribbean\", \"studio\": 3}'),(11,'2024-03-05 08:42:08.911','POST','movies',5,'{\"name\": \"Harry Potter\"}'),(12,'2024-03-05 08:42:08.935','POST','stars',1,'{\"name\": \"Robert Downey Jr.\", \"gender\": \"male\", \"movies\": [1, 3]}'),(13,'2024-03-05 08:42:08.965','POST','stars',2,'{\"name\": \"Chris Hemsworth\", \"gender\": \"male\", \"movies\": [2, 3]}'),(14,'2024-03-05 08:42:09.000','POST','stars',3,'{\"name\": \"Johnny Depp\", \"gender\": \"male\", \"movies\": [4]}'),(15,'2024-03-05 08:42:09.025','POST','stars',4,'{\"name\": \"Daniel Radcliffe\", \"gender\": \"male\", \"movies\": [5]}'),(16,'2024-03-05 08:42:09.050','POST','stars',5,'{\"name\": \"Arnold Schwarzenegger\", \"gender\": \"male\", \"movies\": []}'),(17,'2024-03-05 08:42:09.073','POST','stars',6,'{\"name\": \"Keira Knightley\", \"gender\": \"female\", \"movies\": [4]}'),(18,'2024-03-05 08:42:09.097','POST','stars',7,'{\"name\": \"Emma Watson\", \"gender\": \"female\", \"movies\": [5]}');
/*!40000 ALTER TABLE `_change` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_extension`
--

DROP TABLE IF EXISTS `_extension`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_extension` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` timestamp(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `name` varchar(255) NOT NULL,
  `archive` longblob,
  `client-extension` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `_extension_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_extension`
--

LOCK TABLES `_extension` WRITE;
/*!40000 ALTER TABLE `_extension` DISABLE KEYS */;
/*!40000 ALTER TABLE `_extension` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_model`
--

DROP TABLE IF EXISTS `_model`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_model` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` timestamp(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `definition` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_model`
--

LOCK TABLES `_model` WRITE;
/*!40000 ALTER TABLE `_model` DISABLE KEYS */;
INSERT INTO `_model` VALUES (1,'2024-03-05 08:42:07.766','2024-03-05 08:42:07.766','{\"name\": \"_model\", \"options\": {\"increments\": true, \"timestamps\": true}, \"defaults\": {\"view\": {\"details\": \"title\"}, \"title\": \"name\"}, \"attributes\": [{\"name\": \"definition\", \"dataType\": \"json\"}, {\"name\": \"name\", \"hidden\": true, \"dataType\": \"string\", \"persistent\": false}], \"extensions\": {\"client\": \"function init() {\\n   this._prepareDataAction = function (data) {\\n      if (data[\'definition\'])\\n         data[\'name\'] = data[\'definition\'][\'name\'];\\n      return data;\\n   }\\n}\\n\\nexport { init };\"}}'),(2,'2024-03-05 08:42:07.775','2024-03-05 08:42:07.775','{\"name\": \"_change\", \"options\": {\"increments\": true, \"timestamps\": false}, \"attributes\": [{\"name\": \"timestamp\", \"dataType\": \"timestamp\", \"required\": true, \"defaultValue\": \"CURRENT_TIMESTAMP\"}, {\"name\": \"method\", \"view\": \"select\", \"options\": [{\"value\": \"PUT\"}, {\"value\": \"POST\"}, {\"value\": \"DELETE\"}], \"dataType\": \"enumeration\", \"bUseString\": true}, {\"name\": \"model\", \"dataType\": \"string\"}, {\"name\": \"record_id\", \"dataType\": \"integer\"}, {\"name\": \"data\", \"dataType\": \"json\"}, {\"name\": \"title\", \"hidden\": true, \"dataType\": \"string\", \"persistent\": false}], \"extensions\": {\"client\": \"function init() {\\n   this._prepareDataAction = function (data) {\\n      var str = \\\"\\\";\\n      if (data[\'method\'])\\n         str += data[\'method\'] + \\\": \\\";\\n      if (data[\'model\'])\\n         str += data[\'model\'];\\n      if (data[\'record_id\'])\\n         str += \\\"(\\\" + data[\'record_id\'] + \\\")\\\";\\n      data[\'title\'] = str;\\n      return data;\\n   }\\n}\\n\\nexport { init };\"}, \"bConfirmFullFetch\": true}'),(3,'2024-03-05 08:42:07.869','2024-03-05 08:42:07.869','{\"name\": \"_registry\", \"options\": {\"increments\": false, \"timestamps\": false}, \"attributes\": [{\"name\": \"key\", \"length\": 63, \"unique\": true, \"primary\": true, \"dataType\": \"string\", \"required\": true}, {\"name\": \"value\", \"dataType\": \"text\"}]}'),(4,'2024-03-05 08:42:08.032','2024-03-05 08:42:08.032','{\"name\": \"_extension\", \"options\": {\"increments\": true, \"timestamps\": true}, \"defaults\": {\"view\": {\"details\": \"title\"}, \"title\": \"name\"}, \"attributes\": [{\"name\": \"name\", \"unique\": \"true\", \"dataType\": \"string\", \"required\": true}, {\"name\": \"archive\", \"hidden\": true, \"length\": 16777216, \"storage\": \"blob\", \"dataType\": \"file\"}, {\"name\": \"client-extension\", \"dataType\": \"text\"}]}'),(5,'2024-03-05 08:42:08.165','2024-03-05 08:42:08.165','{\"name\": \"movies\", \"options\": {\"increments\": true, \"timestamps\": true}, \"attributes\": [{\"name\": \"name\", \"dataType\": \"string\"}, {\"name\": \"studio\", \"model\": \"studios\", \"dataType\": \"relation\", \"multiple\": false}, {\"name\": \"stars\", \"model\": \"stars\", \"dataType\": \"relation\", \"multiple\": true}]}'),(6,'2024-03-05 08:42:08.265','2024-03-05 08:42:08.265','{\"name\": \"studios\", \"options\": {\"increments\": true, \"timestamps\": true}, \"attributes\": [{\"name\": \"name\", \"dataType\": \"string\"}, {\"via\": \"studio\", \"name\": \"movies\", \"model\": \"movies\", \"dataType\": \"relation\", \"multiple\": true}]}'),(7,'2024-03-05 08:42:08.364','2024-03-05 08:42:08.364','{\"name\": \"stars\", \"options\": {\"increments\": true, \"timestamps\": true}, \"attributes\": [{\"name\": \"name\", \"dataType\": \"string\"}, {\"name\": \"gender\", \"options\": [{\"value\": \"male\"}, {\"value\": \"female\"}, {\"value\": \"other\"}], \"dataType\": \"enumeration\"}, {\"name\": \"movies\", \"model\": \"movies\", \"dataType\": \"relation\", \"multiple\": true}]}');
/*!40000 ALTER TABLE `_model` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_registry`
--

DROP TABLE IF EXISTS `_registry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_registry` (
  `key` varchar(63) NOT NULL,
  `value` text,
  PRIMARY KEY (`key`),
  UNIQUE KEY `_registry_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_registry`
--

LOCK TABLES `_registry` WRITE;
/*!40000 ALTER TABLE `_registry` DISABLE KEYS */;
INSERT INTO `_registry` VALUES ('version','0.6.2-beta');
/*!40000 ALTER TABLE `_registry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movies`
--

DROP TABLE IF EXISTS `movies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movies` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` timestamp(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `name` varchar(255) DEFAULT NULL,
  `studio` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movies`
--

LOCK TABLES `movies` WRITE;
/*!40000 ALTER TABLE `movies` DISABLE KEYS */;
INSERT INTO `movies` VALUES (1,'2024-03-05 08:42:08.820','2024-03-05 08:42:08.820','Iron Man',1),(2,'2024-03-05 08:42:08.847','2024-03-05 08:42:08.847','Thor',1),(3,'2024-03-05 08:42:08.871','2024-03-05 08:42:08.871','Avengers',1),(4,'2024-03-05 08:42:08.890','2024-03-05 08:42:08.890','Pirates of the Caribbean',3),(5,'2024-03-05 08:42:08.911','2024-03-05 08:42:08.911','Harry Potter',NULL);
/*!40000 ALTER TABLE `movies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movies_stars`
--

DROP TABLE IF EXISTS `movies_stars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movies_stars` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `star_id` int unsigned NOT NULL,
  `movie_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `movies_stars_star_id_foreign` (`star_id`),
  KEY `movies_stars_movie_id_foreign` (`movie_id`),
  CONSTRAINT `movies_stars_movie_id_foreign` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`),
  CONSTRAINT `movies_stars_star_id_foreign` FOREIGN KEY (`star_id`) REFERENCES `stars` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movies_stars`
--

LOCK TABLES `movies_stars` WRITE;
/*!40000 ALTER TABLE `movies_stars` DISABLE KEYS */;
INSERT INTO `movies_stars` VALUES (1,1,1),(2,1,3),(3,2,2),(4,2,3),(5,3,4),(6,4,5),(7,6,4),(8,7,5);
/*!40000 ALTER TABLE `movies_stars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stars`
--

DROP TABLE IF EXISTS `stars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stars` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` timestamp(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `name` varchar(255) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stars`
--

LOCK TABLES `stars` WRITE;
/*!40000 ALTER TABLE `stars` DISABLE KEYS */;
INSERT INTO `stars` VALUES (1,'2024-03-05 08:42:08.935','2024-03-05 08:42:08.935','Robert Downey Jr.','male'),(2,'2024-03-05 08:42:08.965','2024-03-05 08:42:08.965','Chris Hemsworth','male'),(3,'2024-03-05 08:42:09.000','2024-03-05 08:42:09.000','Johnny Depp','male'),(4,'2024-03-05 08:42:09.025','2024-03-05 08:42:09.025','Daniel Radcliffe','male'),(5,'2024-03-05 08:42:09.050','2024-03-05 08:42:09.050','Arnold Schwarzenegger','male'),(6,'2024-03-05 08:42:09.073','2024-03-05 08:42:09.073','Keira Knightley','female'),(7,'2024-03-05 08:42:09.097','2024-03-05 08:42:09.097','Emma Watson','female');
/*!40000 ALTER TABLE `stars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `studios`
--

DROP TABLE IF EXISTS `studios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `studios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` timestamp(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `studios`
--

LOCK TABLES `studios` WRITE;
/*!40000 ALTER TABLE `studios` DISABLE KEYS */;
INSERT INTO `studios` VALUES (1,'2024-03-05 08:42:08.744','2024-03-05 08:42:08.744','Marvel Studios'),(2,'2024-03-05 08:42:08.772','2024-03-05 08:42:08.772','DC'),(3,'2024-03-05 08:42:08.796','2024-03-05 08:42:08.796','Walt Disney Pictures');
/*!40000 ALTER TABLE `studios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-03-05  9:42:09
