<?php
    /* Include the database connection script. */
    include 'pdo.php';

    $email = $_POST['email'];
    $cardID = $_POST['cardID'];
    $cardPos = $_POST['cardPos'];

    $query = 'UPDATE usercards SET cardPos = :cardPos WHERE ownerID = :email AND cardID = :cardID';
    $values = [':email' => $email, ':cardPos' => $cardPos, ':cardID' => $cardID];

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
?>