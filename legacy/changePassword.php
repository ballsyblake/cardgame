<?php 
    /* Include the database connection script. */
    include 'pdo.php';

    /* New password. */
    $password = $_POST['password'];

    /* Create the new password hash. */
    $hash = password_hash($password, PASSWORD_DEFAULT);

    /* ID of the account to edit. */
    $email = $_POST['username'];

    $query = 'SELECT passwordHash FROM cardGameUsers WHERE email = :email';
    
    $values = [':email' => $email];
    try {
        $res = $pdo->prepare($query);
        $res->execute($values);
    }
    catch (PDOException $e) {
        /* Query error. */
        echo 'Query error.';
        die();
    }

    $row = $res->fetch(PDO::FETCH_ASSOC);

    /* If there is a result, check if the password matches using password_verify(). */
    if (is_array($row)){
        if (!password_verify($password, $row['passwordHash'])){
            /* Query error. */
            echo 'Incorrect Password.';
            die();
        }
    }else{
        /* Query error. */
        echo 'Incorrect Password.';
        die();
    }
    
    /* Update query template. */
    $query = 'UPDATE cardGameUsers SET passwordHash = :passwordHash WHERE email = :email';

    /* Values array for PDO. */
    $values = [':passwordHash' => $hash, ':email' => $email];

    /* Execute the query. */
    try {
        $res = $pdo->prepare($query);
        $res->execute($values);
    }
    catch (PDOException $e) {
        /* Query error. */
        echo 'Query error.';
        die();
    }

    return true;
?>