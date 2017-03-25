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
    3:{x: 325, xM: 110, y: 89, speed: 49},
    2:{x: 357, xM: 78, y: 185, speed: 65},
    1:{x: 389, xM: 46, y: 281, speed: 81},
    0:{x: 421, xM: 24, y: 377, speed: 96}
  };

var level1 = [
// Start, Number, Type, Override

[ 0, 1, 'NFC', 500],
[ 3000, 0, 'NFC', 500],
[ 2000, 0, 'NFC', 500],
[ 1000, 0, 'NFC', 500]

];


///////////////////////////////GameLogic///////////////////////////////

var playGame = function() {
  var boardBG = new GameBoard();
  boardBG.add(new Background());

  var boardPlayer = new GameBoard();
  var boardPared = new GameBoard();
  boardPared.add(new ParedIzda());
  boardPlayer.add(new Player());
  boardPlayer=loadDeadZones(boardPlayer);

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
};

var winGame = function() {
  Game.setBoard(3,new TitleScreen("You win!", 
                                  "Press fire to play again",
                                  playGame));
};

var loseGame = function() {
  Game.setBoard(3,new TitleScreen("You lose!", 
                                  "Press fire to play again",
                                  playGame));
};

/*
  Spawner(y, delay, nClientes, t, Cliente)
    sp1 [_________]
     sp2 [_________]
      sp3 [_________]
       sp4 [_________]

  Object.create(cliente)
*/



//////////////////////////////Objects//////////////////////////////////

/////GameManager/////

var GameManager= new function(){
  this.clients=0;
  this.beer=0;
  this.glass=0;
  this.initial=true;
  this.gameover=false;

  this.moreClients=function(n){
    if(this.initial)this.initial=!this.initial;
    this.clients+=n;
  };
  this.lessClients=function(){
    this.clients--;
  };
  this.moreBeer=function(){
    this.beer++;
  };
  this.lessBeer=function(){
    this.beer--;
  };
  this.moreGlass=function(){
    this.glass++;
  };
  this.lessGlass=function(){
    this.glass--;
  };

  this.win=function(){
    return (this.initial==false) && (this.glass==0) && (this.clients==0);
  };

  this.loose=function(){
    this.gameover=true;
  }
  this.draw=function(){};
  this.step=function(dt){
    
    if(this.win()){
      console.log("win");
    }
    if(this.gameover){
      console.log("loose");
      this.gameover=!this.gameover;
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
  this.x = zones[counter].xM;
  this.y = zones[counter].y-10;
  var speed = zones[counter].speed;
  this.setup('NPC', {vx: -speed}); // 50, 65, 81, 96 
  this.step = function(dt){
    this.x = this.x - this.vx*dt;
  };
};
Client.prototype = new Sprite();
Client.prototype.type = OBJECT_CLIENT;

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
        this.board.remove(collision);
        // Leave tip for Player
        GameManager.lessBeer();
        GameManager.lessClients();
        GameManager.moreGlass();
      }
    }else if(this.t == 'Glass'){
      this.x = this.x + this.vx*dt;
      var collision = this.board.collide(this, OBJECT_PLAYER);
      if(collision) {
        GameManager.lessGlass();
        this.board.remove(this);
        // Add up points to total score
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

  this.step = function(dt){
    if(Game.keys['up']){
      Game.keys['up'] = false;
      this.counter = (this.counter + 1)%4 || 0;
    }
    else if (Game.keys['down']){
      Game.keys['down'] = false;
      this.counter = ((this.counter == 0) ? 3 : this.counter - 1) || 0;
    }
    this.x = zones[this.counter].x;
    this.y = zones[this.counter].y;

    this.reload -= dt;
    if(Game.keys['space'] && this.reload < 0){ // Generate Beer
      Game.keys['space'] = false;
      this.reload = this.reloadTime;
      this.board.add(new Beer(this.counter, 'Beer'));
      GameManager.moreBeer();
      //if(Math.floor((Math.random() * 10) + 1)>5)
        //this.board.add(new Client(this.counter));
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
  Game.initialize("game",sprites,playGame);
});