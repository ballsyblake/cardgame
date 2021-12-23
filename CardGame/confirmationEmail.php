<?php
    // File references
    include 'pdo.php';
    
    

    $email = $_GET["email"];
    $hash = $_GET["passwordHash"];
    
    $appPage = "http://localhost/CardGame/mainMenu.html?email=".$email;
    echo "I got my email: ".$email." and my hash: ".$hash;

    /* Insert query template. */
    $query = 'SELECT email FROM cardGameUsers WHERE email = :email';
    
    /* Values array for PDO. */
    $values = [':email' => $email];

    try
    {
        $res = $pdo->prepare($query);
        $res->execute($values);
    }
    catch (PDOException $e)
    {
        /* Query error. */
        echo 'Query error.'.$e;
        die();
    }
    
    $result = $res->rowCount();
    
    if($result == 1){
        $query = "UPDATE cardGameUsers SET confirmed = '1' WHERE email = :email";
        try
        {
            $res = $pdo->prepare($query);
            $res->execute($values);
        }
        catch (PDOException $e)
        {
            /* Query error. */
            echo 'Query error.'.$e;
            die();
        }
    }
    else{
        echo "This account has already been activated, please login from the app.";
        die();
    }
    echo "hello?";
    header('Location: '.$appPage);
    die();
?>