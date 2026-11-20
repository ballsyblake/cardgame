<?php
    // File references
    include 'pdo.php';

    require_once('config.php');
    $appPage = APP_URL . "/mainMenu.html";
    
    $id = $_POST["id"];
    $email = $_POST["email"];
    $name = $_POST["name"];
    $dob = $_POST["dob"];
    $password = $_POST["password"] ?? "";

    /* Values array for PDO. */
    $values = [':id' => $id,':email' => $email,':name' => $name,':dob' => $dob];

    /* Only change the password when a new one was typed in. */
    if ($password !== "") {
        $query = 'UPDATE cardGameUsers SET email = :email, name = :name, dob = :dob, passwordHash = :passwordHash WHERE email = :id';
        $values[':passwordHash'] = password_hash($password, PASSWORD_DEFAULT);
    } else {
        $query = 'UPDATE cardGameUsers SET email = :email, name = :name, dob = :dob WHERE email = :id';
    }

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

    header('Location: ' . $appPage);
    exit;
?>