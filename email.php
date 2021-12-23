<?php
    require_once('config.php');
    $servername = DBHOST;
    $dbusername = DBUSER;
    $dbpassword = DBPWD;
    $dbname = DBNAME;
    
    require 'C:\xampp\htdocs\phpMailer\src\Exception.php';
    require 'C:\xampp\htdocs\phpMailer\src\PHPMailer.php';
    require 'C:\xampp\htdocs\phpMailer\src\SMTP.php';

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\SMTP;
    use PHPMailer\PHPMailer\Exception;

    function NewMail($subject, $body, ?String $altBody, $receiverArray){
        $mail = new PHPMailer(true);

        //Enable SMTP debugging.
        $mail->SMTPDebug = 3;                               
        //Set PHPMailer to use SMTP.
        $mail->isSMTP();   
        //Set debug on
        $mail->SMTPDebug = 0;         
        //Set SMTP host name                          
        $mail->Host = "smtp.gmail.com";
        //Set this to true if SMTP host requires authentication to send email
        $mail->SMTPAuth = true;                          
        //Provide username and password     
        $mail->Username = "northcanberrafutsal@gmail.com";                 
        $mail->Password = "jczyhkabmljzdqyi";                           
        //If SMTP requires TLS encryption then set it
        $mail->SMTPSecure = "tls";                           
        //Set TCP port to connect to
        $mail->Port = 587;                                   

        $mail->From = "northcanberrafutsal@gmail.com";
        $mail->FromName = "North Canberra Futsal";
        

        foreach ($receiverArray as $key=>$value){
            $mail->addAddress($key, ucfirst($value));
        }    

        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->AltBody = $altBody;

        try {
            $mail->send();
            return true;
        } catch (Exception $e) {
            return false;
            //return "Mailer Error: " . $mail->ErrorInfo;
            exit();
        }
    }
?>
