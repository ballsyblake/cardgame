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
      $userCards = $conn->prepare("SELECT DISTINCT cardID FROM userCards WHERE ownerID = :id");
      $userCards->bindParam(':id', $id);
      $id = $_POST['id'];
      $userCards->execute();
      $resultCards = $userCards->fetchAll();
      foreach ($resultCards as $cardKey => $cardValue) {
        // prepare sql and bind parameters
        $cardQuery = $conn->prepare("SELECT userID, userType, speed, stamina, strength, passing, shooting, dribbling, communication, decisionMaking, positioning, whistle FROM stats WHERE id = :cardID");
        $cardQuery->bindParam(':cardID', $cardValue['cardID']);
        $cardQuery->execute();
        $cardResult = $cardQuery->fetchAll();
        
        foreach ($cardResult as $key => $value) {
          if($value["userType"] == "player"){
            $rank = ($value["speed"] + $value["stamina"] + $value["strength"] + $value["passing"] + $value["shooting"] + $value["dribbling"])/6;
            $userSearch = $conn->prepare("SELECT profilePic, lastName FROM players WHERE ffa = '".$value["userID"]."'");
          }
          else if($value["userType"] == "referee"){
            $rank = ($value["speed"] + $value["stamina"] + $value["communication"] + $value["decisionMaking"] + $value["positioning"] + $value["whistle"])/6;
            $userSearch = $conn->prepare("SELECT profilePic, lastName FROM referees WHERE username = '".$value["userID"]."'");
          }
          $cardResult[$key]["rank"] = round($rank);
          if($rank <= 50)
            $cardResult[$key]["star"] = "bronze";
          else if($rank > 50 && $rank < 75)
            $cardResult[$key]["star"] = "silver";
          else if($rank >= 75)
            $cardResult[$key]["star"] = "gold";
          $userSearch->execute();
          $userResult = $userSearch->fetchAll();
          foreach ($userResult as $userKey => $userValue) {
            $cardResult[$key]["profilePic"] = $userValue["profilePic"];
            $cardResult[$key]["lastName"] = $userValue["lastName"];
          }
        }
        array_push($result, $cardResult[0]);
        $result[$cardKey]["cardID"] = $cardValue['cardID'];
      }

      header('Content-Type: application/json');
      
      echo json_encode($result);
      
    } catch(PDOException $e) {
      echo "Error: " . $e->getMessage();
    }
    $conn = null;
?>
