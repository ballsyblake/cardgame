<?php
    /*
     * Copy this file to config.local.php (gitignored) and fill in what you
     * need. Never commit real passwords. Delete any line to use the default
     * from config.php.
     */

    // Database
    define('DBHOST', 'localhost');
    define('DBNAME', 'ncf');
    define('DBUSER', 'root');
    define('DBPWD', '');

    // Email (optional). For Gmail, create an app password at
    // https://myaccount.google.com/apppasswords and paste it here.
    define('SMTP_USERNAME', '');
    define('SMTP_PASSWORD', '');
    define('MAIL_FROM', '');
    define('MAIL_FROM_NAME', 'FutsalMe');
    // Folder that holds PHPMailer.php, SMTP.php and Exception.php.
    define('PHPMAILER_PATH', 'C:\xampp\htdocs\phpMailer\src');

    define('APP_URL', 'http://localhost/CardGame');
?>
