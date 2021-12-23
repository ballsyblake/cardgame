<?php
    // File references
    include 'pdo.php';
    
    $email = $_POST["id"];
    
    /* Insert query template. */
    $query = 'SELECT email, name, dob, passwordHash FROM cardGameUsers WHERE email = :email';
    
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
    
    $result = $res->fetchAll();

    header('Content-Type: application/json');
      
    echo json_encode($result);    
    
    exit;
    exit();
?>