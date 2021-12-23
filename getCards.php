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
      
      $id = $_POST['id'];
      $cardPos = $_POST['cardPos'];
      $cardID = $_POST['cardID'];
      if($cardID == "0" || $cardID == 0)
        exit();
      
      // prepare sql and bind parameters
      $cardQuery = $conn->prepare("SELECT userID, userType, speed, stamina, strength, passing, shooting, dribbling, communication, decisionMaking, positioning, whistle FROM stats WHERE id = :cardID");
      $cardQuery->bindParam(':cardID', $cardID);
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
        }
      }
      array_push($result, $cardResult[0]);

      header('Content-Type: application/json');
      
      echo json_encode($result);
      
    } catch(PDOException $e) {
      echo "Error: " . $e->getMessage();
    }
    $conn = null;
?>
