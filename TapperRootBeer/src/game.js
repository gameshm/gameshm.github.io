///////////////////////////////Ini////////////////////////////////////

var sprites = {
  Beer: {sx: 512, sy: 99, w: 23, h: 32, frames: 1},
  Glass: {sx: 512, sy: 131, w: 23, h: 32, frames: 1},
  NPC: {sx: 512, sy: 66, w: 33, h: 33, frames: 1},
  ParedIzda: {sx: 0, sy: 0, w: 512, h: 480, frames: 1},
  Player: {sx: 512, sy: 0, w: 56, h: 66, frames: 1},
  TapperGameplay: {sx: 0, sy: 480, w: 512, h: 480, frames: 1}
};

var OBJECT_PLAYER = 2,
    OBJECT_PLAYER_BEER = 4,
    OBJECT_PLAYER_GLASS = 8, // Añadido GLASS para las colisiones glass - deadzone (gameover)
    OBJECT_CLIENT = 16,
    OBJECT_DEADZONE = 32;

var zones={ // xM -> mirrored position for x-axis
    initial: {x: 0, y: 0},
    3:{x: 325, xM: 110, y: 89, speed: 25, tip: false},
    2:{x: 357, xM: 78, y: 185, speed: 32, tip: false},
    1:{x: 389, xM: 46, y: 281, speed: 40, tip: false},
    0:{x: 421, xM: 24, y: 377, speed: 48, tip: false}
  };

var level1 = [
// Frequency, Number, Type, Delay, Override

[ 3000, 2, 'NFC', 1000],
[ 3000, 3, 'NFC', 8000],
[ 3000, 4, 'NFC', 6000],
[ 3000, 2, 'NFC', 10000]

];


///////////////////////////////GameLogic///////////////////////////////

var startGame = function() {
  /*
  var ua = navigator.userAgent.toLowerCase();

  // Only 1 row of stars
  if(ua.match(/android/)) {
    Game.setBoard(0,new Starfield(50,0.6,100,true));
  } else {
    Game.setBoard(0,new Starfield(20,0.4,100,true));
    Game.setBoard(1,new Starfield(50,0.6,100));
    Game.setBoard(2,new Starfield(100,1.0,50));
  }  
  */
  Game.setBoard(0,new TitleScreen("Tapper Root Beer", 
                                  "Press Enter to start playing",
                                  playGame));
  Game.setBoardActive(0, false);
};

var playGame = function() {

  var boardBG = new GameBoard(true);
  boardBG.add(new Background());

  var boardPlayer = new GameBoard(true);
  var boardPared = new GameBoard(true);
  boardPared.add(new ParedIzda());
  boardPlayer.add(new Player());
  boardPlayer=loadDeadZones(boardPlayer);

  var boardGameWon = new GameBoard(false);
  boardGameWon.add(new TitleScreen("You win!", 
                                  "Press Enter to play again",
                                  restart));
  var boardGameLost = new GameBoard(false);
  boardGameLost.add(new TitleScreen("You lose!", 
                                  "Press Enter to play again",
                                  restart));
  
  //boardPlayer.add(new Level(level1));
  var bar0=level1[0];
  boardPlayer.add(new Spawner(0, bar0[1], bar0[2], bar0[3], bar0[0]));
  var bar1=level1[1];
  boardPlayer.add(new Spawner(1, bar1[1], bar1[2], bar1[3], bar1[0]));
  var bar2=level1[2];
  boardPlayer.add(new Spawner(2, bar2[1], bar2[2], bar2[3], bar2[0]));
  var bar3=level1[3];
  boardPlayer.add(new Spawner(3, bar3[1], bar3[2], bar3[3], bar3[0]));


  Game.setBoard(1, boardBG);
  Game.setBoard(2, boardPlayer);
  Game.setBoard(3, boardPared);
  Game.setBoard(4, GameManager);
  Game.setBoard(5, boardGameWon);
  Game.setBoard(6, boardGameLost);
  
};

var restart = function(){
  Game.setBoardActive(6, false);
  Game.setBoardActive(5, false);

  Game.setBoardActive(3, true);
  Game.setBoardActive(2, true);
  Game.setBoardActive(1, true);

  GameManager.clients=0;
  GameManager.beer=0;
  GameManager.glass=0;
  GameManager.initial=true;
  GameManager.points = 0; // Reset points
  GameManager.gameover=false;
}

var winGame = function() {
  Game.setBoardActive(6, false);
  Game.setBoardActive(5, true);

  //Game.setBoardActive(4, false);
  Game.setBoardActive(3, false);
  Game.setBoardActive(2, false);
  Game.setBoardActive(1, false);
};

var loseGame = function() {
  Game.setBoardActive(6, true);
  Game.setBoardActive(5, false);

  //Game.setBoardActive(4, true);
  Game.setBoardActive(3, true);
  Game.setBoardActive(2, true);
  Game.setBoardActive(1, true);
};


//////////////////////////////Objects//////////////////////////////////

/////GameManager/////

var GameManager= new function(){
  this.clients=0;
  this.beer=0;
  this.glass=0;
  this.initial=true;
  this.gameover=false;
  this.points = 0;

  this.moreClients=function(n){
    if(this.initial)this.initial=!this.initial;
    this.clients+=n;
  };
  this.satisfyClient=function(){
    this.clients--;
  };
  this.serveBeer=function(){
    this.beer++;
  };
  this.drinkBeer=function(){
    this.beer--;
  };
  this.returnGlass=function(){
    this.glass++;
  };
  this.retrieveGlass=function(){
    this.glass--;
  };
  this.addUpPoints = function(points){
    this.points += points;
  }

  this.win=function(){
    return (this.initial==false) && (this.glass==0) && (this.clients==0);
  };

  this.loose=function(){
    this.gameover=true;
  }
  this.draw=function(ctx){
    ctx.fillStyle = "#FFFFFF";
    var text = "Points: "
    ctx.font = "bold 20px bangers";
    var measure = ctx.measureText(text);  
    ctx.fillText(text, 10, 30);

    ctx.font = "bold 20px bangers";
    measure = ctx.measureText(this.points);  
    ctx.fillText(this.points, 70, 30);
  };
  this.step=function(dt){
    
    if(this.win()){
      //console.log("win");
      winGame();
    }
    if(this.gameover){
      //console.log("loose");
      this.gameover=!this.gameover;
      loseGame();
    }
  };

};

/////Level/////
var Level=function(levelData){
  this.t=0;
  this.levelData=[];

  for(var i=0; i<levelData.length;i++){
    this.levelData.push(levelData[i]);
  }

};
Level.prototype.step=function(dt){
    this.t=dt*1000;

    for(var i=0; i<this.levelData.length; i++){
      var counter=this.levelData[0];

      if(counter[0]<this.t)
        this.board.add(new Spawner(i, counter[1], counter[2],counter[3], i*1000));

  }

};
Level.prototype.draw=function(ctx){};


/////Spawner/////
var lastClient=-1;

var Spawner=function(bar, number, type, frecuency, delay){
  this.n=0;
  this.number=number;
  this.frecuency=frecuency;
  this.delay=delay;
  this.bar=bar;
  this.type=type;
  this.cliente=new Client(bar);
  this.t=0;
  this.last=0;
  GameManager.moreClients(number);
};

Spawner.prototype.draw=function(){};
Spawner.prototype.step=function(dt){
  this.t+=dt*1000;

  if(!this.last)
    this.last=this.t;

  if(this.t>this.delay && this.n!=this.number && this.frecuency<(this.t-this.last)){
   var c=Object.create(this.cliente);
   this.board.add(c);
   this.n++;
   this.last=this.t;
  }

};

/////Background/////

var Background = function(){

  this.setup('TapperGameplay', zones["initial"]);

  this.step = function(){};
};

Background.prototype = new Sprite();


/////Client/////

var Client = function(counter){
  this.counter = counter;
  this.status = "thirsty";
  this.distance = 80;
  this.x = zones[counter].xM;
  this.y = zones[counter].y-10;
  var speed = zones[counter].speed;
  this.setup('NPC', {vx: -speed}); // 50, 65, 81, 96 
  this.step = function(dt){
    if(this.status == "thirsty"){
      this.x = this.x - this.vx*dt;
    }
    else if(this.status == "drinking" && this.distance > 0){
      this.x = this.x + this.vx*dt;
      //this.vx = zones[this.counter]*2;
      this.distance--;
    }

    if(this.distance == 0){
      this.distance = 80;
      //this.vx = zones[this.counter]/2;
      this.status = "thirsty";
    }
  };
};
Client.prototype = new Sprite();
Client.prototype.type = OBJECT_CLIENT;
Client.prototype.setStatus = function(status){
  this.status = status;
}

/////Beer/////

var Beer = function(counter, type){
  this.x = zones[counter].x - sprites.Beer.w;
  this.y = zones[counter].y;
  this.counter = counter;
  this.t = type;
  var speed = zones[counter].speed;
  
  this.setup(type, {vx: speed}); // 50, 65, 81, 96 
  
  this.step = function(dt){
    if(this.t == 'Beer'){
      this.x = this.x - this.vx*dt; 
      var collision = this.board.collide(this, OBJECT_CLIENT);
      
      if(collision) {
        this.t = 'Glass'; 
        this.setup('Glass', {vx: this.vx - this.vx/4});
        // Change of .type to GLASS
        this.type = OBJECT_PLAYER_GLASS;
        //this.board.remove(collision);
        collision.setStatus("drinking");
        // Leave tip for Player
        GameManager.drinkBeer();
        //GameManager.satisfyClient();
        GameManager.addUpPoints(50); // Add up points to total score
        GameManager.returnGlass();
      }
    }else if(this.t == 'Glass'){
      this.x = this.x + this.vx*dt;
      var collision = this.board.collide(this, OBJECT_PLAYER);
      if(collision) {
        GameManager.retrieveGlass();
        GameManager.addUpPoints(100); // Add up points to total score
        this.board.remove(this);
      }
    } 
  };
};

Beer.prototype = new Sprite();
Beer.prototype.type = OBJECT_PLAYER_BEER;


/////Player/////

var Player = function(){
  this.setup('Player', {x: 421, y: 377, reloadTime: 0.5});

  this.reload = this.reloadTime;
  this.counter = 0;
  this.status = "serving";

  this.step = function(dt){
    if(Game.keys['up']){
      Game.keys['up'] = false;
      this.counter = (this.counter + 1)%4 || 0;
    }
    else if (Game.keys['down']){
      Game.keys['down'] = false;
      this.counter = ((this.counter == 0) ? 3 : this.counter - 1) || 0;
    }

    if(zones[this.counter].tip == false){ // Check if there's no tip on counter
      this.x = zones[this.counter].x; // Return to serving position
      this.status = "serving"; // Go back to serving
    }
    this.y = zones[this.counter].y;

    if(Game.keys['left'] && zones[this.counter].tip && this.x > zones[this.counter].xM){
      this.x = this.x - zones[this.counter].speed*dt;
      // TODO: implement tip object
      // TODO: implement collision tip-player:
      //          set zones[this.counter].tip = false
    }
    if(Game.keys['right'] && zones[this.counter].tip && this.x < zones[this.counter].x){
      this.x = this.x + zones[this.counter].speed*dt;
      if(this.x == zones[this.counter].x){
        this.status == "collecting"; // Start collecting
      }
    }

    this.reload -= dt;
    if(Game.keys['space'] && this.reload < 0 && this.status == "serving"){ // Generate Beer
      Game.keys['space'] = false;
      this.reload = this.reloadTime;
      this.board.add(new Beer(this.counter, 'Beer'));
      GameManager.serveBeer();
    }
  };
}

Player.prototype = new Sprite();
Player.prototype.type = OBJECT_PLAYER;


/////ParedIzda/////

var ParedIzda = function(){
  this.setup('ParedIzda', zones["initial"]);
  this.step = function(){};
};

ParedIzda.prototype = new Sprite();

/////DeadZone/////

var DeadZone = function(x, y, w, h){
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.side = ((this.x < Game.width) ? "left" : "right");
 /* 
    draw()
    var c = document.getElementById("game");
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.stroke();
  */
};
DeadZone.prototype.step=function(){
    
    var object = this.board.collide(this, OBJECT_CLIENT | OBJECT_PLAYER_GLASS | OBJECT_PLAYER_BEER);
  
    if(object){
      this.board.remove(object);
      GameManager.loose();
    }


};
DeadZone.prototype.draw=function(){};
DeadZone.prototype.type=OBJECT_DEADZONE;


//////////////////////////////Aux//////////////////////////////////////

var loadDeadZones=function(boardPlayer){

  boardPlayer.add(new DeadZone(90, 90, 20, 50));
  boardPlayer.add(new DeadZone(58, 185, 20, 50));
  boardPlayer.add(new DeadZone(26, 281, 20, 50));
  boardPlayer.add(new DeadZone(-4, 377, 20, 50));

  boardPlayer.add(new DeadZone(325, 90, 20, 50));
  boardPlayer.add(new DeadZone(357, 185, 20, 50));
  boardPlayer.add(new DeadZone(389, 281, 20, 50));
  boardPlayer.add(new DeadZone(421, 377, 20, 50));

  return boardPlayer;

};


//////////////////////////////Events///////////////////////////////////

window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});