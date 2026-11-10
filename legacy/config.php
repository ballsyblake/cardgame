<?php
    /*
     * App settings. Real values (database password, SMTP login) live in
     * config.local.php, which is gitignored. Copy config.example.php to
     * config.local.php and fill it in. Anything not set there falls back to
     * the defaults below, which suit a local XAMPP install with email off.
     */
    if (file_exists(__DIR__ . '/config.local.php')) {
        require_once __DIR__ . '/config.local.php';
    }

    if (!function_exists('setting_default')) {
        function setting_default($name, $value) {
            if (!defined($name)) define($name, $value);
        }
    }

    // Database
    setting_default('DBHOST', 'localhost');
    setting_default('DBNAME', 'ncf');
    setting_default('DBUSER', 'root');
    setting_default('DBPWD', '');

    // Email. Leave SMTP_PASSWORD empty to turn email off: accounts are then
    // confirmed straight away instead of by an emailed link.
    setting_default('SMTP_HOST', 'smtp.gmail.com');
    setting_default('SMTP_PORT', 587);
    setting_default('SMTP_USERNAME', '');
    setting_default('SMTP_PASSWORD', '');
    setting_default('MAIL_FROM', '');
    setting_default('MAIL_FROM_NAME', 'FutsalMe');
    setting_default('PHPMAILER_PATH', __DIR__ . '/vendor/phpmailer/src');

    // Base URL used in confirmation links.
    setting_default('APP_URL', 'http://localhost/CardGame');

    if (!function_exists('email_enabled')) {
        function email_enabled() {
            return SMTP_USERNAME !== '' && SMTP_PASSWORD !== '';
        }
    }
?>
