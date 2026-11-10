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
      $userCards = $conn->prepare("DELETE FROM packs WHERE amountIn = :amountIn AND userID = :id AND rarity = :rarity;");
      $userCards->bindParam(':id', $id);
      $userCards->bindParam(':rarity', $rarity);
      $userCards->bindParam(':amountIn', $amountIn);
      $id = $_POST['id'];
      $rarity = $_POST['rarity'];
      $amountIn = $_POST['amountIn'];
      //$userCards->execute();
      
      
    } catch(PDOException $e) {
      echo "Error: " . $e->getMessage();
    }
    $conn = null;
?>
