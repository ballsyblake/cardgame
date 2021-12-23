<?php
    /* Include the database connection script. */
    include 'pdo.php';

    

    /* Username from the login form. */
    $email = $_POST['email'];

    $appPage = "http://localhost/CardGame/mainMenu.html?email=".$email;
    /* Password from the login form. */
    $password = $_POST['password'];

    /* Remember to validate $username and $password. */

    /* Look for the username in the database. */
    $query = 'SELECT passwordHash FROM cardGameUsers WHERE (email = :email)';

    /* Values array for PDO. */
    $values = [':email' => $email];

    /* Execute the query */
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

    $row = $res->fetch(PDO::FETCH_ASSOC);

    /* If there is a result, check if the password matches using password_verify(). */
    if (is_array($row))
    {
        if (password_verify($password, $row['passwordHash']))
        {
            /* The password is correct. */
            header("Location: ".$appPage);
            die();
        }
    }
    echo "Incorrect passsword dummy";
?>