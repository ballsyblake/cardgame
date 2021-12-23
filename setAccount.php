<?php
    // File references
    include 'pdo.php';

    $appPage = "http://localhost/CardGame/mainMenu.html";
    
    $id = $_POST["id"];
    $email = $_POST["email"];
    $name = $_POST["name"];
    $dob = $_POST["dob"];
    $password = $_POST["password"];
    if($password != "memesbaby" && !$password)
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    /* Insert query template. */
    $query = 'UPDATE cardGameUsers SET email = :email, name = :name, dob = :dob, passwordHash = :passwordHash WHERE email = :id';
    
    /* Values array for PDO. */
    $values = [':id' => $id,':email' => $email,':name' => $name,':dob' => $dob,':passwordHash' => $passwordHash];

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

    header($appPage);
    
    exit;
    exit();
?>