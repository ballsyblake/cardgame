<?php
    include('config.php');
    $servername = DBHOST;
    $dbusername = DBUSER;
    $dbpassword = DBPWD;
    $dbname = DBNAME;
    $result = [];
    
    try {
      $conn = new PDO("mysql:host=$servername;dbname=$dbname", $dbusername, $dbpassword);
      // set the PDO error mode to exception
      $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      
      // get users cards
      $userCards = $conn->prepare("SELECT amountIn, rarity FROM packs WHERE userID = :id");
      $userCards->bindParam(':id', $id);
      $id = $_POST['id'];
      $userCards->execute();
      $result = $userCards->fetchAll();
      

      header('Content-Type: application/json');
      
      echo json_encode($result);
      
    } catch(PDOException $e) {
      echo "Error: " . $e->getMessage();
    }
    $conn = null;
?>
