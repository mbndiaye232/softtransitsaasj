CREATE TABLE IF NOT EXISTS `transactions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `structur_id` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `credits` int(11) NOT NULL,
  `type` enum('PURCHASE','USAGE','REFUND') NOT NULL DEFAULT 'PURCHASE',
  `status` enum('PENDING','COMPLETED','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `payment_method` varchar(50) DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `structur_id` (`structur_id`),
  CONSTRAINT `fk_transactions_structur` FOREIGN KEY (`structur_id`) REFERENCES `structur` (`IDSociete`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
