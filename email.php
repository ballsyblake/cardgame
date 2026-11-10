<?php
    require_once('config.php');

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    /*
     * Sends an email through SMTP using the login in config.local.php.
     * Returns false without trying when email is turned off (no SMTP login set)
     * or PHPMailer can't be found, so callers can carry on without email.
     */
    function NewMail($subject, $body, ?String $altBody, $receiverArray){
        if (!email_enabled()) {
            return false;
        }
        $base = rtrim(PHPMAILER_PATH, '/\\');
        if (!file_exists($base . '/PHPMailer.php')) {
            error_log('PHPMailer not found at ' . $base);
            return false;
        }
        require_once $base . '/Exception.php';
        require_once $base . '/PHPMailer.php';
        require_once $base . '/SMTP.php';

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->SMTPDebug = 0;
            $mail->Host = SMTP_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = SMTP_USERNAME;
            $mail->Password = SMTP_PASSWORD;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = SMTP_PORT;

            $mail->setFrom(MAIL_FROM !== '' ? MAIL_FROM : SMTP_USERNAME, MAIL_FROM_NAME);
            foreach ($receiverArray as $key => $value) {
                $mail->addAddress($key, ucfirst($value));
            }

            $mail->isHTML(true);
            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';
            $mail->Subject = $subject;
            $mail->Body = $body;
            $mail->AltBody = $altBody;

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log('Mailer error: ' . $mail->ErrorInfo);
            return false;
        }
    }
?>
