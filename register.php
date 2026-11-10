<?php 
    // File references
    require_once('email.php');
    
    /* Include the database connection script. */
    require_once('pdo.php');

    /* Username. */
    $username = $_POST['email'];

    /* Password. */
    $password = $_POST['password'];

    /* Secure password hash. */
    $hash = password_hash($password, PASSWORD_DEFAULT);

    /* Insert query template. */
    $query = 'INSERT INTO cardGameUsers (email, passwordHash) VALUES (:email, :passwordHash)';

    /* Values array for PDO. */
    $values = [':email' => $username, ':passwordHash' => $hash];

    /* Execute the query. */
    try
    {
        $res = $pdo->prepare($query);
        $res->execute($values);
    }
    catch (PDOException $e)
    {
        /* Query error. */
        echo 'Query error.';
        die();
    }

    /* Without email set up, confirm the account straight away. */
    if (!email_enabled()) {
        $confirm = $pdo->prepare("UPDATE cardGameUsers SET confirmed = '1' WHERE email = :email");
        $confirm->execute([':email' => $username]);
        echo "Account created. You can log in now.";
        exit;
    }

    $confirmationPage = APP_URL . "/confirmationEmail.php?email=" . urlencode($username) . "&passwordHash=" . urlencode($hash);

    $mailSubject = "Account Confirmation";
    $mailBody = "<h1>Thank you for registering with FutsalMe</h1> <h3>Please click the link below to confirm your account.<h3><br><a href='". htmlspecialchars($confirmationPage, ENT_QUOTES) ."'>Confirm Account</a>";
    $mailAltBody = "Thank you for registering with FutsalMe. 
    Please go to this web address to confirm your account: ".$confirmationPage;
    $receiverArray[$username] = "Customer";
    if(NewMail($mailSubject, $mailBody, $mailAltBody, $receiverArray)){
        echo "Please check your emails for the account activation link.";
    }
    else{
        echo "Account created, but the confirmation email could not be sent.";
    }
?>