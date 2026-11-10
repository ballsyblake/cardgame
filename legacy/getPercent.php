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
      $userCards = $conn->prepare("SELECT COUNT(DISTINCT cardID) FROM usercards WHERE ownerID = :id");
      $userCards->bindParam(':id', $id);
      $id = $_POST['id'];
      $userCards->execute();
      $cardResult = $userCards->fetchAll();
      $result["userCards"] = $cardResult[0][0];

      $totalRefs = $conn->prepare("SELECT COUNT(*) FROM referees");
      $totalRefs->execute();
      $refResult = $totalRefs->fetchAll();
      $totalPlayers = $conn->prepare("SELECT COUNT(*) FROM players");
      $totalPlayers->execute();
      $playerResult = $totalPlayers->fetchAll();
      $totalResult = intval($refResult[0][0])+intval($playerResult[0][0]);
      $result["totalCards"] = $totalResult;
      header('Content-Type: application/json');
      
      echo json_encode($result);
      
    } catch(PDOException $e) {
      echo "Error: " . $e->getMessage();
    }
    $conn = null;
?>
