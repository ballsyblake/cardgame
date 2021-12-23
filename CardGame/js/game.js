let serverURL = "http://localhost/cardgame/";
let username = null;

/*
<button id="startBtn">Start</button>
<div class="versus">
    <img src="img/hyunwoo_portrait.PNG">
    <h2>VS</h2>
    <img src="img/eamon_portrait.PNG">
</div>
<div class="feed">
    <div class="feed_item left"></div>
</div>
*/

let avgRank = 0;

// Card Pack Animation
let currdeg  = 0;
var carousel;
var turnAngle = 0;
var xTopOffset = 0;
var xLeftOffset = 0;

var clicked = false;
const NF = 50;
let rID = null, f = 0, S = null;

let gameTime = 0;

$(window).resize(function(){
    for (let j = 1; j < 6; j++) {
        $("#removeBtn"+j).css({top: CalcPos($("#pos"+j), "top"), left: CalcPos($("#pos"+j),"left"), position:'absolute'});
    }
});

function rotate(e){
    if(e.data.d=="n"){
        currdeg = currdeg - turnAngle;
    }
    if(e.data.d=="p"){
        currdeg = currdeg + turnAngle;
    }
    carousel.css({
        "-webkit-transform": "rotateY("+currdeg+"deg)",
        "-moz-transform": "rotateY("+currdeg+"deg)",
        "-o-transform": "rotateY("+currdeg+"deg)",
        "transform": "rotateY("+currdeg+"deg)"
    });
}

$(document).ready(function () {
    console.log(window.location.pathname.toLowerCase())
    switch(window.location.pathname.toLowerCase()) {
        case "/cardgame/":
        case "/cardgame/index.html":
            $("#register").on("click", function(){
                $(this).hide();
                $("#modal1").show();
            });
            $("#login").on("click", function(){
                $(this).hide();
                $("#modal2").show();
            });
            $(".cancelbtn, .close").on("click", function(){
                $("#modal1").hide();
                $("#modal2").hide();
                $("#login").show();
                $("#register").show();
            });
            break;
        case "/cardgame/mainmenu.html":
            if(getCookie("username"))
                username = getCookie("username");
            else{
                try {
                    username = parseURLParams(window.location.href).email[0];
                    setCookie("username", username, 30);
                }
                catch(err) {
                    window.location.href = "http://localhost/cardgame/";
                }
            }
            $("#logo").show();
            break;
        case "/cardgame/simulation.html":
            $(".loader").hide();
            $("#findGame").on("click", function(){
                $(".loader").show();
            });
            break;
        default:
            console.log("Couldn't find path.");
    }
    $("#formations").on('change', function() {
        Pitch(this.value);
    });
    $("#welcomeBtnsMenu").children("button").on("click", function(){
        $("#backBtn").show();
        $("#logo").hide();
        $("#welcomeBtnsMenu").hide();
        
        //Animation for later
        /*$("#welcomeBtnsMenu").css("transform", "translate(-100%)").delay(400).queue(function(){
            
            $(this).dequeue();
        });
        */
    });
    $("#backBtn").on("click", function(){
        $("body").children().hide();
        $("#logo").show();
        $("#welcomeMenu").show();
        $("#welcomeBtnsMenu").show();
        $("#welcomeMenu").html("Welcome");
        $(".packHolder").remove();
    });
    $("#play").on("click", function(){
        console.log("started");
        console.log(avgRank);
        var userTeam = [];
        $.ajax({
            type: "post",
            data: {id:username},
            url: serverURL + "getFormations.php",
        }).done(function (data) {
            $.each(data, function(key, value){
                if(value.cardPos == 0 || value.cardPos == "0")
                    return;
                $.ajax({
                    type: "post",
                    data: {id:username, cardPos: value.cardPos, cardID: value.cardID},
                    url: serverURL + "getCards.php",
                }).done(function (data) {
                    if(data){
                        userTeam.push(data);
                        //TODO finish getting team data
                    }
                }).fail(function (data) {
                    $('body').append('<h1>There was a problem with the server. Please try again later pitch 1.</h1>');
                });
            });
        }).fail(function (data) {
            $('body').append('<h1>There was a problem with the server. Please try again later pitch 2.</h1>');
        });
        
    });
    $("#team").on("click", function(){
        CalcRank();
        Pitch("square");
        
        $(".removeBtn").on("click", function(){
            
            setCardPosition(0, username, $("#pos"+$(this).attr("id").substring(9)).children(".lrgImg").attr("id"));
            $(this).hide();
            $("#pos"+$(this).attr("id").substring(9)).children().remove();
            Card("", "#pos"+$(this).attr("id").substring(9), "empty", "sml", "", "", "", "", 1);
            CalcRank();
        });
        $(".rowHolder").children("div").on("click", function(){
            PlayerList($(this).attr("id").substring(3));
            $(".pitch-container").fadeOut(250).delay(500);
        });
        
        // the fuck is this?
        $(".pitch-container").children("div").on("click", function(){
            $(".close").on("click", function(){
                $("#welcomeMenu").show();
                $(".page").remove();
                $(".pitch-container").show();
            });
        });
    });

    $("#leaderboard").on("click", function(){
        $("#welcomeMenu").html("Leaderboards");
        $.ajax({
            type: "post",
            data: {id:username},
            url: serverURL + "getUsers.php",
        }).done(function (data) {
            $.each(data, function(key, value){
                Card(value.cardID, ".grid-container", value.userType, "lrg", value.lastName, value.profilePic, value.star, value.rank, 0, key+1, "ncf_logo_correct.png", value.speed,value.positioning, value.communication, value.stamina, value.decisionMaking, value.whistle, value.strength, value.dribbling, value.passing, value.shooting);
            });
            
        }).fail(function (data) {
            $('body').append('<h1>There was a problem with the server. Please try again later playerlist.</h1>');
        });
    });
    $("#players").on("click", function(){
        $.ajax({
            type: "post",
            data: {id:username},
            url: serverURL + "getPercent.php",
        }).done(function (data) {
            var percentage = Math.round((data.userCards/data.totalCards)*100);
            $("#welcomeMenu").html("Your Players <br>"+percentage+"%");
        }).fail(function (data) {
            $('body').append('<h1>There was a problem with the server. Please try again later playerlist.</h1>');
        });
        $("#welcomeMenu").html("Your Players");
        $('body').append('<div class="playersPage"><input class="searchBar" type="text" placeholder="Search.."><div class="grid-container"></div></div></div>');
        $(".searchBar").on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $(".grid-container .grid-item").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
        $.ajax({
            type: "post",
            data: {id:username},
            url: serverURL + "getStats.php",
        }).done(function (data) {
            $.each(data, function(key, value){
                Card(value.cardID, ".grid-container", value.userType, "lrg", value.lastName, value.profilePic, value.star, value.rank, 0, key+1, "ncf_logo_correct.png", value.speed,value.positioning, value.communication, value.stamina, value.decisionMaking, value.whistle, value.strength, value.dribbling, value.passing, value.shooting);
            });
            $(".playersPage").children(".grid-container").children("div").on("click", function(){
                //TODO Some kind of animation
            });
        }).fail(function (data) {
            $('body').append('<h1>There was a problem with the server. Please try again later playerlist.</h1>');
        });
    });
    $("#packs").on("click", function(){
        $("#welcomeMenu").html("Your Packs");
        $('body').append('<div class="packHolder"></div>');
        $.ajax({
            type: "post",
            data: {id:username},
            url: serverURL + "getPacks.php",
        }).done(function (data) {
            $.each(data, function(key, value){
                $('.packHolder').append('<div class="pack hvr-grow '+value.rarity+'" id="'+value.amountIn+'"><img src="img/silhouette.png" id="silhouette"><img src="img/ncf_logo_correct.png" id="ncfLogo"><h1>Card Pack</h1></div>');
            });
            $(".pack").on("click", function(){
                var tempPack = $(this);
                tempPack.css('top', tempPack.offset().top);
                tempPack.css('left', tempPack.offset().left);
                tempPack.removeClass("hvr-grow");
                $("#backBtn").hide();
                console.log(username)
                if(!clicked){
                    clicked = true;
                    $(".packHolder").children().hide();
                    tempPack.show();
                    tempPack.center();
                    setTimeout(function(){
                        $("body").append("<div class='light' id='light'></div>");
                        $(".light").center();
                        setTimeout(function(){
                            turnAngle = 360/parseInt(tempPack.attr("id"));
                            tempPack.remove();
                            $("#light").remove();
                            $.ajax({
                                type: "post",
                                data: {id:username, amountIn:tempPack.attr("id"), rarity:tempPack.attr("class").substring(14)},
                                url: serverURL + "removePack.php",
                            }).done(function(){
                                $.ajax({
                                    type: "post",
                                    data: {id:username, amountIn:tempPack.attr("id")},
                                    url: serverURL + "getRandomCards.php",
                                }).done(function (data) {
                                    
                                    $(".packHolder").hide();
                                    $('body').after().append('<div class="pack-container"><div class="carousel"></div></div><div class="prev hvr-backward"><</div><button class="end">Finish</button><div class="next hvr-forward">></div>');
                                    carousel = $(".carousel");
                                    currdeg = 0;
                                    carousel.css({
                                        "-webkit-transform": "rotateY(0deg)",
                                        "-moz-transform": "rotateY(0deg)",
                                        "-o-transform": "rotateY(0deg)",
                                        "transform": "rotateY(0deg)"
                                    });
                                    $(".next").on("click", { d: "n" }, rotate);
                                    $(".prev").on("click", { d: "p" }, rotate);
                                    var angle = 0;
                                    console.log(data);
                                    $.each(data, function(key, value){
                                        if(value.userType == "player"){
                                            $(".carousel").append('<div class="grid-item item '+ value.userType +'" style="transform: rotateY('+angle+'deg) translateZ(250px);"><h2>'+ UCF(value.lastName) +'</h2><img class="lrgImg" src="img/'+ value.profilePic +'"><div class="smlImgs"><img src="img/'+ value.star +' star.png"><h2 class="cardRank">'+ value.rank +'</h2><img src="img/ncf_logo_correct.png"></div><h3>'+ value.speed +' SPE</h3><h3>'+ value.strength +' STR</h3><h3>'+ value.dribbling +' DRI</h3><h3>'+ value.stamina +' STA</h3><h3>'+ value.passing +' PAS</h3><h3>'+ value.shooting +' SHO</h3></div>');
                                        }
                                        else if(value.userType == "referee"){
                                            $(".carousel").append('<div class="grid-item item '+ value.userType +'" style="transform: rotateY('+angle+'deg) translateZ(250px);"><h2>'+ UCF(value.lastName) +'</h2><img class="lrgImg" src="img/'+ value.profilePic +'"><div class="smlImgs"><img src="img/'+ value.star +' star.png"><h2>'+ value.rank +'</h2><img src="img/ncf_logo_correct.png"></div><h3>'+ value.speed +' SPE</h3><h3>'+ value.positioning +' POS</h3><h3>'+ value.communication +' COM</h3><h3>'+ value.stamina +' STA</h3><h3>'+ value.decisionMaking +' D-M</h3><h3>'+ value.whistle +' WHI</h3></div>');
                                        }
                                        $(".carousel").append('<div class="grid-item '+tempPack.attr("class").substring(5)+' item" style="transform: rotateY('+(angle-180)+'deg) translateZ(-250px);"></div>');
                                        angle = angle + turnAngle;
                                    });
                                    
                                    $(".end").on("click", function(){
                                        $(".pack-container").remove();
                                        $(".next").remove();
                                        $(".prev").remove();
                                        $(".end").remove();
                                        $(".packHolder").show();
                                        $(".packHolder").children().show();
                                        $("#backBtn").show();
                                        turnAngle = 0;
                                        clicked = false;
                                    });
                                }).fail(function (data) {
                                    $('body').append('<h1>There was a problem with the server. Please try again later playerlist.</h1>');
                                });
                            }).fail(function (data) {
                                $('body').append('<h1>There was a problem with the server. Please try again later playerlist.</h1>');
                            });
                        },1000);
                    },1000);
                }
            });
        }).fail(function (data) {
            $('body').append('<h1>There was a problem with the server. Please try again later playerlist.</h1>');
        });        
    });
    $("#account").on("click", function(){
        $("#welcomeMenu").html("Your Profile");
        $("body").append('<div class="accountInfo"><img src="img/Blake-Baldwin.jpg"><div class="form__group field"><input type="text" id="name" ="name" class="form__field" placeholder="Full Name"><label for="name" class="form__label">Full Name</label></div><div class="form__group field"><input type="text" id="dob" name="dob" class="form__field" placeholder="Birthday"><label for="dob" class="form__label">Birthday</label></div><div class="form__group field"><input type="text" id="email" name="email" class="form__field" placeholder="Email Address"><label for="email" class="form__label">Email Address</label></div><div class="form__group field"><input type="password" id="password" name="password" class="form__field" placeholder="Password" value="memesbaby"><label for="password" class="form__label">Password</label></div><button id="submit" style="margin-top:20px;">Update</button></div>');

        $.ajax({
            type: "post",
            data: {id:username},
            url: serverURL + "getAccount.php",
            dataType: "json",
        }).done(function (data) {
            $.each(data, function(key, value){
                $("#name").val(value.name);
                if(value.dob != "0000-00-00")
                    $("#dob").val(value.dob);
                $("#email").val(value.email);
            });
        }).fail(function (data) {
            $('body').append('<h1>There was a problem with the server. Please try again later.</h1>');
        });
        $("#submit").on("click", function(){
            var id = username;
            var email = $("#email").val();
            var name = $("#name").val();
            var dob = $("#dob").val();
            var password = $("#password").val();
            $.ajax({
                type: "post",
                data: {id:id, email:email, name:name, dob:dob, password:password},
                url: serverURL + "setAccount.php",
            }).done(function (data) {
                window.location.replace("mainMenu.html");
            }).fail(function (data) {
                $('body').append('<h1>There was a problem with the server. Please try again later.</h1>');
            });
        });
    });
    $("#logout").on("click", function(){
        setCookie("username", "", 0);
        window.location.replace(serverURL);
    });
});

function setCardPosition(cardPos, email, cardID){
    $.ajax({
        type: "post",
        data: {email:email, cardPos:cardPos, cardID:cardID},
        url: serverURL + "setPos.php",
    }).fail(function (data) {
        $('body').append('<h1>There was a problem with the server. Please try again later set card.</h1>');
    });
}

function someFunction(site)     
{     
    return site.replace(/\/$/, "");
} 

// Card setup, covers all things to do with the card
function Card(id, location, userType, size, name, pic, star, rank, gamePos, listPos, logo, speed, pos, comms, stamina, decisionMaking, whistle, strength, dribble, passing, shooting){
    if(size == "sml"){
        $(location).removeClass("empty");
        $(location).removeClass("player");
        $(location).removeClass("referee");
        $(location).addClass(userType);
        if(userType == "empty"){
            $(location).append('<img src="img/plus.jpg" class="plus">');
        }
        else{
            $("#removeBtn"+location.substring(4)).show();
            $(location).append('<img class="lrgImg" src="img/'+ pic +'" id="'+ id +'"><div class="smlImgs" id="'+rank+'"><img src="img/'+ star +' star.png" class="flexChild"><img src="img/ncf_logo_correct.png" class="flexChild"></div>');
        }
        CalcRank();
    }
    else if(size == "lrg"){
        var link;
        if(listPos){
            link = '&apos;'+ id +'&apos;,'+gamePos+','+listPos+',&apos;'+name+'&apos;,&apos;'+pic+'&apos;,&apos;'+star+'&apos;,'+rank+',&apos;'+userType+'&apos';
        }
        if(userType == "player"){
            $(location).append('<div class="grid-item hvr-grow '+ userType +'" id="'+ id +'"><h2 id="'+ gamePos + listPos +'">'+ name +'</h2><img id="'+ pic +'"class="lrgImg" src="img/'+ pic +'"><div class="smlImgs"><img id="'+ star+'" src="img/'+ star +' star.png"><h2 class="cardRank">'+ rank +'</h2><img src="img/ncf_logo_correct.png"></div><h3>'+ speed +' SPE</h3><h3>'+ strength +' STR</h3><h3>'+ dribble +' DRI</h3><h3>'+ stamina +' STA</h3><h3>'+ passing +' PAS</h3><h3>'+ shooting +' SHO</h3></div>');
        }
        else if(userType == "referee"){
            $(location).append('<div class="grid-item hvr-grow '+ userType +'" id="'+ id +'"><h2 id="'+ gamePos + listPos +'">'+ name +'</h2><img id="'+ pic +'" class="lrgImg" src="img/'+ pic +'"><div class="smlImgs"><img id="'+ star+'" src="img/'+ star +' star.png"><h2>'+ rank +'</h2><img src="img/ncf_logo_correct.png"></div><h3>'+ speed +' SPE</h3><h3>'+ pos +' POS</h3><h3>'+ comms +' COM</h3><h3>'+ stamina +' STA</h3><h3>'+ decisionMaking +' D-M</h3><h3>'+ whistle +' WHI</h3></div>');
        }
    }
}

// Creates pitch view
function Pitch(formation){
    $('.pitch').remove();
    $('body').append('<div class="pitch"><img src="img/Pitch.png" id="pitch"><div class="pitch-container"><div class="rowHolder"><div id="pos1" class="grid-item hvr-float"></div></div></div></div>');
    
    $.ajax({
        type: "post",
        data: {id:username},
        url: serverURL + "getFormations.php",
    }).done(function (data) {
        $.each(data, function(key, value){
            if(value.cardPos == 0 || value.cardPos == "0")
                return;
            $.ajax({
                type: "post",
                data: {id:username, cardPos: value.cardPos, cardID: value.cardID},
                url: serverURL + "getCards.php",
            }).done(function (data) {
                if(data){
                    var data1 = data[0];
                    $("#pos"+value.cardPos).children().remove();
                    Card(value.cardID, "#pos"+value.cardPos, data1.userType, "sml", "", data1.profilePic, data1.star, data1.rank);
                }
                CalcRank();
            }).fail(function (data) {
                $('body').append('<h1>There was a problem with the server. Please try again later pitch 1.</h1>');
            });
        });
        
    }).fail(function (data) {
        $('body').append('<h1>There was a problem with the server. Please try again later pitch 2.</h1>');
    });

    Card("", "#pos1", "empty", "sml", "", "", "", "", 1);
    switch(formation){
        case "diamond":
            for (let index = 2; index < 6; index++) {
                if(index == 3){
                    $(".pitch-container").append('<div class="rowHolder"><div id="pos'+ index +'" class="grid-item  hvr-float"></div><div id="pos'+ (index+1) +'" class="grid-item  hvr-float"></div>');
                    Card("", "#pos"+ index, "empty", "sml", "", "", "", "", index);
                }else if(index == 2 || index == 5){
                    $(".pitch-container").append('<div class="rowHolder"><div id="pos'+ index +'" class="grid-item  hvr-float"></div></div>');
                    Card("", "#pos"+ index, "empty", "sml", "", "", "", "", index);
                }
                else if(index == 4){
                    Card("", "#pos"+ index, "empty", "sml", "", "", "", "", index);
                }
            }
            break;
        case "square":
            for (let index = 2; index < 6; index++) {
                if(index == 2 || index == 4){
                    $(".pitch-container").append('<div class="rowHolder"><div id="pos'+ index +'" class="grid-item  hvr-float"></div><div id="pos'+ (index+1) +'" class="grid-item  hvr-float"></div></div>');
                    Card("", "#pos"+ index, "empty", "sml", "", "", "", "", index);
                }else
                    Card("", "#pos"+ index, "empty", "sml", "", "", "", "", index);
            }
            break;
        case "pyramid":
            for (let index = 2; index < 6; index++) {
                if(index == 2){
                    $(".pitch-container").append('<div class="rowHolder"><div id="pos'+ index +'" class="grid-item  hvr-float"></div><div id="pos'+ (index+1) +'" class="grid-item  hvr-float"></div>');
                    Card("", "#pos"+ index, "empty", "sml", "", "", "", "", index);
                }else if(index == 4 || index == 5){
                    $(".pitch-container").append('<div class="rowHolder"><div id="pos'+ index +'" class="grid-item  hvr-float"></div></div>');
                    Card("", "#pos"+ index, "empty", "sml", "", "", "", "", index);
                }
                else if(index == 3){
                    Card("", "#pos"+ index, "empty", "sml", "", "", "", "", index);
                }
            }
            break;
        case "theY":
            for (let index = 2; index < 6; index++) {
                if(index == 4){
                    $(".pitch-container").append('<div class="rowHolder"><div id="pos'+ index +'" class="grid-item  hvr-float"></div><div id="pos'+ (index+1) +'" class="grid-item  hvr-float"></div>');
                    Card("", "#pos"+ index, "empty", "sml", "", "", "", "", index);
                }else if(index == 2 || index == 3){
                    $(".pitch-container").append('<div class="rowHolder"><div id="pos'+ index +'" class="grid-item  hvr-float"></div></div>');
                    Card("", "#pos"+ index, "empty", "sml", "", "", "", "", index);
                }
                else if(index == 5){
                    Card("", "#pos"+ index, "empty", "sml", "", "", "", "", index);
                }
            }
            break;
    }
    for (let j = 1; j < 6; j++) {
        $(".pitch-container").append('<span class="removeBtn" title="Remove Player" id="removeBtn'+j+'">&times;</span>');
        $("#removeBtn"+j).css({top: CalcPos($("#pos"+j), "top"), left: CalcPos($("#pos"+j),"left"), position:'absolute'});
    }
}

function CalcRank(){
    var chemistryOffset;
    avgRank = 0;
    var count = 0;
    for (let num = 1; num < 6; num++) {
        var temp = parseInt($("#pos"+String(num)).children(".smlImgs").attr("id"));
        if(temp){
            count++;
            avgRank += temp;
        }
    }
    if(avgRank)
        $("#welcomeMenu").html("Your Team's Rank: " + Math.round(avgRank/count));
    else
        $("#welcomeMenu").html("Your Team's Rank: 0");
}

function CalcPos(item, type){
    var width = item.outerWidth();
    var offset = item.position();
    
    var centerX = offset.left + width;
    var centerY = offset.top - 20;
    
    if(type == "top")
        return centerY;
    else if(type == "left")
        return centerX;
}

/*function Remove(id){
    $("#"+id).children().remove();
    Card("", "#"+id, "empty", "sml", "", "", "", "", id.substring(3));
}*/

// Generate List of all player cards owned by user
function PlayerList(gamePos) {
    
    $("#welcomeMenu").hide();
    $('.pitch').append('<div class="page"><span class="close" title="Close Modal">&times;</span><input class="searchBar" type="text" placeholder="Search.."><div class="grid-container"></div></div></div>');
    $(".searchBar").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $(".grid-container .grid-item").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
    $.ajax({
        type: "post",
        data: {id:username},
        url: serverURL + "getStats.php",
    }).done(function (data) {
        $.each(data, function(key, value){
            Card(value.cardID, ".grid-container", value.userType, "lrg", value.lastName, value.profilePic, value.star, value.rank, gamePos, key+1, "ncf_logo_correct.png", value.speed,value.positioning, value.communication, value.stamina, value.decisionMaking, value.whistle, value.strength, value.dribbling, value.passing, value.shooting);
        });
        $(".page").children(".grid-container").children("div").on("click", function(){
            var temp = $(this);
            var id = $(this).attr("id");
            var gamePos = temp.children("h2").attr("id").substring(0,1);
            var listPos = temp.children("h2").attr("id").substring(1);
            var pic = temp.children(".lrgImg").attr("id");
            var star = temp.children(".smlImgs").children("img").attr("id");
            var userType = temp.attr("class").substring(19);
            var rank = temp.children(".smlImgs").children("h2").html();
            // id gamePos listPos name pic star rank usertype
            ReturnToPitch(id,gamePos, listPos, "", pic, star, rank, userType);
        });
    }).fail(function (data) {
        $('body').append('<h1>There was a problem with the server. Please try again later playerlist.</h1>');
    });
}

// Leave player list menu and return back to pitch view
function ReturnToPitch(id, gamePos, listPos, name, pic, star, rank, userType){
    
    var card = document.getElementById(id);
    var check;
    
    for (let index = 1; index < 6; index++) {
        if($('#pos'+index).find("img").attr("id") == id && card){
            check = true;
            alert("That player is already on your team.");
            continue;
        }
    }
    if(!check || !card){
        $(".pitch-container").show();
        $(".page").remove();
        $("#pos"+gamePos).children().remove();
        setCardPosition(gamePos, username, id);
        Card(id, "#pos"+gamePos, userType, "sml", name, pic, star, rank, gamePos, listPos, "ncf_logo_correct.png");
        $("#welcomeMenu").show();
    }   
    
}

function Back(){
    $(".pitch").show();
    $(".page").remove();
}

// Generates random number
function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function UCF(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function parseURLParams(url) {
    var queryStart = url.indexOf("?") + 1,
        queryEnd   = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}

function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
  
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return false;
}

/*Simulation Game*/
let speed = 750;
let timer;
let currentTime = 1;
let teams = [];
let events = ["", "Foul", "Yellow Card", "Red Card", "Goal"];
let likelihoods = [750, 130, 20, 5, 20];

function getTeam(){
    $.get(serverURL + "getRandomTeam.php", function(data, status){
        alert(data);
    }).fail(function (data) {
        $('body').append('<h1>There was a problem with the server. Please try again later set card.</h1>');
    });
}

function startSim(ht, at){
    teams = [ht, at];
    updateScore(0,0,true);
    changeSpeed(750);
}

function nextMinute(currTime){
    if(currTime <= 90)
        console.log(currTime+ "' "+eventCall());
    else{
        endGame();
    }
}

function changeSpeed(newSpeed){
    speed = newSpeed;
    clearInterval(timer);
    timer = setInterval(function(){ nextMinute(currentTime); currentTime++;}, speed);
}

function endGame(){
    clearInterval(timer);
    timer = null;
    currentTime = 0;
}

function skipMatch(){
    if(timer)
        changeSpeed(1);
}

function simulateEvent(chances) {
    var sum = 0;
    console.log(chances);
    chances.forEach(function(chance) {
        sum+=chance;
    });
    var rand = Math.random();
    var chance = 0;
    for(var i=0; i<chances.length; i++) {
        chance+=chances[i]/sum;
        if(rand<chance) {
            return i;
        }
    }
    
    // should never be reached unless sum of probabilities is less than 1
    // due to all being zero or some being negative probabilities
    return -1;
}

function eventCall(){
    var result = "";
    var prob = events[simulateEvent(likelihoods)];
    var htAdv = Math.round(teams[0][1] - teams[1][1]);
    var atAdv = Math.round(teams[1][1] - teams[0][1]);
    var teamLikelihood = [100+htAdv,100+atAdv];
    if(prob == "Goal")
        var teamPick = teams[simulateEvent(teamLikelihood)];
    else{
        var teamPick = teams[simulateEvent([50,50])];
    }
    if(prob == "")
        return result;
    else {
        result = prob + " by " + teamPick[0] + "'s " + teamPick[Math.floor(Math.random() * 3)+2];
        if(prob == "Goal"){
            if(teamPick == teams[1])
                updateScore(0,1);
            else
                updateScore(1,0);
        }
        return result;
    }
}

function updateScore(htGoal, atGoal, reset){
    var htCurrScore = parseInt(document.getElementById("htScore").innerHTML,10);
    var atCurrScore = parseInt(document.getElementById("atScore").innerHTML,10);
    if(reset){
        document.getElementById("htScore").innerHTML = 0;
        document.getElementById("atScore").innerHTML = 0;
    }else{
        document.getElementById("htScore").innerHTML = htCurrScore + htGoal;
        document.getElementById("atScore").innerHTML = atCurrScore + atGoal;
    }
    
}

// Ball Loading Animation
/*<div class="main-fader" responsive-height-comments>
  <div class="loader">
<svg viewBox="0 0 866 866" xmlns="http://www.w3.org/2000/svg">
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 164.83 151.5">
                <path class="path-0" d="M117.24,69.24A8,8,0,0,0,115.67,67c-4.88-4-9.8-7.89-14.86-11.62A4.93,4.93,0,0,0,96.93,55c-5.76,1.89-11.4,4.17-17.18,6a4.36,4.36,0,0,0-3.42,4.12c-1,6.89-2.1,13.76-3,20.66a4,4,0,0,0,1,3.07c5.12,4.36,10.39,8.61,15.68,12.76a3.62,3.62,0,0,0,2.92.75c6.29-2.66,12.52-5.47,18.71-8.36a3.49,3.49,0,0,0,1.68-2.19c1.34-7.25,2.54-14.55,3.9-22.58Z"
                    fill="#00ADEF" />
                <path class="path-1" d="M97.55,38.68A43.76,43.76,0,0,1,98,33.44c.41-2.36-.5-3.57-2.57-4.64C91.1,26.59,87,24,82.66,21.82a6.18,6.18,0,0,0-4-.71C73.45,22.55,68.32,24.25,63.22,26c-3.63,1.21-6.08,3.35-5.76,7.69a26.67,26.67,0,0,1-.6,4.92c-1.08,8.06-1.08,8.08,5.86,11.92,3.95,2.19,7.82,5.75,11.94,6.08s8.76-2.41,13.12-3.93c9.33-3.29,9.33-3.3,9.78-14Z"
                    fill="#00ADEF" />
                <path class="path-2" d="M66.11,126.56c5.91-.91,11.37-1.7,16.81-2.71a3.3,3.3,0,0,0,1.87-2.17c1-4.06,1.73-8.19,2.84-12.24.54-2-.11-3-1.55-4.15-5-4-9.9-8.12-15-12a6.19,6.19,0,0,0-4.15-1.1c-5.35.66-10.7,1.54-16,2.54A4,4,0,0,0,48.34,97a109.13,109.13,0,0,0-3,12.19,4.47,4.47,0,0,0,1.34,3.6c5.54,4.36,11.23,8.53,16.91,12.69a10.84,10.84,0,0,0,2.57,1.11Z"
                    fill="#00ADEF" />
                <path class="path-3" d="M127.42,104.12c4.1-2.1,8-3.93,11.72-6a6,6,0,0,0,2.27-3,58.22,58.22,0,0,0,3.18-29.92c-.26-1.7-8-7.28-9.71-6.85A5,5,0,0,0,133,59.65c-2.81,2.49-5.71,4.88-8.33,7.56a9.46,9.46,0,0,0-2.47,4.4c-1.29,6.49-2.38,13-3.35,19.55a5.73,5.73,0,0,0,.83,3.91c2.31,3.08,5,5.88,7.7,9Z"
                    fill="#00ADEF" />
                <path class="path-4" d="M52.58,29.89c-2.15-.36-3.78-.54-5.39-.9-2.83-.64-4.92.1-7,2.32A64.1,64.1,0,0,0,26.09,54.64c-2.64,7.92-2.62,7.84,5.15,10.87,1.76.69,2.73.45,3.93-1C39.79,59,44.54,53.65,49.22,48.2a4.2,4.2,0,0,0,1.13-2c.8-5.32,1.49-10.68,2.24-16.34Z"
                    fill="#00ADEF" />
                <path class="path-5" fill="#00ADEF" d="M23,68.13c0,2.51,0,4.7,0,6.87a60.49,60.49,0,0,0,9.75,32.15c1.37,2.13,6.4,3,7,1.2,1.55-5,2.68-10.2,3.82-15.34.13-.58-.58-1.38-.94-2.06-2.51-4.77-5.47-9.38-7.45-14.37C32.94,71,28.22,69.84,23,68.13Z" />
                <path class="path-6" fill="#00ADEF" d="M83.91,12.86c-.32.36-.66.71-1,1.07.9,1.13,1.57,2.62,2.73,3.33,4.71,2.84,9.56,5.48,14.39,8.1a9.29,9.29,0,0,0,3.13.83c5.45.69,10.89,1.38,16.35,1.94a10.41,10.41,0,0,0,3.07-.71c-11.48-9.9-24.26-14.61-38.71-14.56Z"
                />
                <path class="path-7" fill="#00ADEF" d="M66.28,132.51c13.36,3.78,25.62,3.5,38-.9C91.68,129.59,79.36,128,66.28,132.51Z" />
                <path class="path-8" fill="#00ADEF" d="M127.2,30.66l-1.27.37a18.58,18.58,0,0,0,1,3.08c3,5.52,6.21,10.89,8.89,16.54,1.34,2.83,3.41,3.82,6.49,4.9a60.38,60.38,0,0,0-15.12-24.9Z" />
                <path class="bb-9" fill="#00ADEF" d="M117.35,125c5.58-2.32,16.9-13.84,18.1-19.2-2.41,1.46-5.18,2.36-6.78,4.23-4.21,5-7.89,10.37-11.32,15Z" />
            </svg>
        </svg>
  </div>
</div>
*/


//$('.pitch-container').append('<div class="grid-item pitch-item2 player"><h2>Blake Baldwin</h2><img class="lrgImg" src="img/Blake-Baldwin.jpg"><div class="smlImgs"><img src="img/gold star.png" class="flexChild"><h2 class="flexChild">99</h2><img src="img/ncf_logo_correct.png" class="flexChild"></div></div><div class="grid-item pitch-item3 player"><h2>Blake Baldwin</h2><img class="lrgImg" src="img/Blake-Baldwin.jpg"><div class="smlImgs"><img src="img/gold star.png" class="flexChild"><h2 class="flexChild">99</h2><img src="img/ncf_logo_correct.png" class="flexChild"></div></div><div class="grid-item pitch-item4 player"><h2>Blake Baldwin</h2><img class="lrgImg" src="img/Blake-Baldwin.jpg"><div class="smlImgs"><img src="img/gold star.png" class="flexChild"><h2 class="flexChild">99</h2><img src="img/ncf_logo_correct.png" class="flexChild"></div></div><div class="grid-item pitch-item5 player"><h2>Blake Baldwin</h2><img class="lrgImg" src="img/Blake-Baldwin.jpg"><div class="smlImgs"><img src="img/gold star.png" class="flexChild"><h2 class="flexChild">99</h2><img src="img/ncf_logo_correct.png" class="flexChild"></div></div>');