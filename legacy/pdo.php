<?php
    require_once('config.php');
    $servername = DBHOST;
    $dbusername = DBUSER;
    $dbpassword = DBPWD;
    $dbname = DBNAME;

    /* The PDO object. */
    $pdo = NULL;

    /* Connection string, or "data source name". */
    $dsn = 'mysql:host=' . $servername . ';dbname=' . $dbname;

    /* Connection inside a try/catch block. */
    try
    {  
        /* PDO object creation. */
        $pdo = new PDO($dsn, $dbusername,  $dbpassword);
        
        /* Enable exceptions on errors. */
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    catch (PDOException $e)
    {
        /* If there is an error, an exception is thrown. */
        echo 'Database connection failed.';
        die();
    }
?>