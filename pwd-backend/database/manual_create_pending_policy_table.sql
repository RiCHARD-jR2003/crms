-- Manual SQL script to create pending_registration_policy_settings table
-- Run this if the migration fails due to Doctrine DBAL compatibility issues

CREATE TABLE IF NOT EXISTS `pending_registration_policy_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pending_registration_policy_settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO `pending_registration_policy_settings` (`key`, `value`, `description`, `created_at`, `updated_at`) VALUES
('holding_duration_hours', '72', 'Number of hours a pending application can remain pending (default: 72 hours / 3 days)', NOW(), NOW()),
('expiry_action', 'expire', 'Action to take when holding duration expires: "expire" or "reject"', NOW(), NOW()),
('reminder_hours_before_expiry', '24', 'Send reminder email X hours before expiry (default: 24 hours)', NOW(), NOW()),
('enable_pending_policy', 'true', 'Enable or disable the pending registration policy', NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- Add columns to application table if they don't exist
ALTER TABLE `application` 
ADD COLUMN IF NOT EXISTS `expires_at` timestamp NULL DEFAULT NULL AFTER `submissionDate`,
ADD COLUMN IF NOT EXISTS `reminder_sent` tinyint(1) NOT NULL DEFAULT 0 AFTER `expires_at`;

-- Note: If your MySQL version doesn't support IF NOT EXISTS in ALTER TABLE,
-- run these separately and ignore errors if columns already exist:
-- ALTER TABLE `application` ADD COLUMN `expires_at` timestamp NULL DEFAULT NULL AFTER `submissionDate`;
-- ALTER TABLE `application` ADD COLUMN `reminder_sent` tinyint(1) NOT NULL DEFAULT 0 AFTER `expires_at`;

