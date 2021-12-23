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

    $confirmationPage = "http://localhost/CardGame/confirmationEmail.php?email=".$username."&passwordHash=".$hash."";

    $mailSubject = "Account Confirmation";
    $mailBody = "<h1>Thank you for registering with FutsalMe</h1> <h3>Please click the link below to confirm your account.<h3><br><a href='". $confirmationPage ."'>Confirm Account</a>";
    $mailAltBody = "Thank you for registering with FutsalMe. 
    Please go to this web address to confirm your account: ".$confirmationPage;
    $receiverArray[$username] = "Customer";
    if(NewMail($mailSubject, $mailBody, $mailAltBody, $receiverArray)){
        //$data["message"] = "Team submission successful. You will receive email from us shortly confirming your team\'s details. Please reply to the email if there are any discrepancies.";
        echo "Please check your emails for the account activation link.";
    }
    else{
        //$data["message"] = "Something went wrong, please try again.";
        return false;
    }
?>