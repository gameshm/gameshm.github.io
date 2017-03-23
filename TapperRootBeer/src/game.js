///////////////////////////////Ini////////////////////////////////////
var sprites = {
  Beer: {sx: 512, sy: 99, w: 23, h: 32, frames: 1},
  Glass: {sx: 512, sy: 131, w: 23, h: 32, frames: 1},
  NPC: {sx: 512, sy: 66, w: 33, h: 33, frames: 1},
  ParedIzda: {sx: 0, sy: 0, w: 512, h: 480, frames: 1},
  Player: {sx: 512, sy: 0, w: 56, h: 66, frames: 1},
  TapperGameplay: {sx: 0, sy: 480, w: 512, h: 480, frames: 1}
};

var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_BEER = 2,
    OBJECT_CLIENT = 4,
    OBJECT_DEADZONE = 5;

var speed = {first: 50, second: 65, third: 81, fourth: 96};    

var zones={
    0:{x:0  , y:0},
    1:{x:325, y:90},
    2:{x:357, y:185},
    3:{x:389, y:281},
    4:{x:421, y:377}
  };

///////////////////////////////GameLogic///////////////////////////////

var playGame = function() {
  var boardBG = new GameBoard();
  boardBG.add(new Background());

  var boardPlayer = new GameBoard();
  var boardPared = new GameBoard();
  boardPared.add(new ParedIzda());
  boardPlayer.add(new Player());
  boardPlayer=loadDeadZones(boardPlayer);

  Game.setBoard(1, boardBG);
  Game.setBoard(2, boardPlayer);
  Game.setBoard(3, boardPared);

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



//////////////////////////////Objects///////////////////////////////

/////Background/////

var Background = function(){
  this.setup('TapperGameplay', zones[0]);
  this.step = function(){};
};

Background.prototype = new Sprite();

/////Client/////

var Client = function(x, y){
  this.x = x;
  this.y = y-10;
  var speed = levelToSpeed(y);
  this.setup('NPC', {vx: -speed}); // 50, 65, 81, 96 
  this.step = function(dt){
    this.x = this.x - this.vx*dt;
    /*var collision = this.board.collide(this, OBJECT_PLAYER_BEER);
    if(collision) {
      // Devolver pasta
      this.board.remove(this);
    } /*else if(this.x < 0) { 
        this.board.remove(this); 
    }*/
  };
};
Client.prototype = new Sprite();
Client.prototype.type = OBJECT_CLIENT;

/////Beer/////

var Beer = function(x, y, type){
  this.x = x;
  this.y = y;
  this.t = type;
  var speed = levelToSpeed(y);
  
  this.setup(type, {vx: speed}); // 50, 65, 81, 96 
  
   this.step = function(dt){
    if(this.t == 'Beer'){
      this.x = this.x - this.vx*dt; 
    /*  var collision = this.board.collide(this, OBJECT_CLIENT);
      if(collision) {
        // Cambiar el sprite por la jarra vacía y lanzarla hacia el otro lado
        this.board.remove(this);
        this.type = 'Glass';
        this.setup('Glass', {vx: this.vx - this.vx/4});
        this.board.remove(collision);
      } else if(this.x < 0) { 
          this.board.remove(this); 
      }
    */}else if(this.t == 'Glass'){
      this.x = this.x + this.vx*dt;
      /*var collision = this.board.collide(this, OBJECT_PLAYER);
      if(collision) {
        // Cambiar el sprite por la jarra vacía y lanzarla hacia el otro lado
        this.board.remove(this);
      } else if(this.x < 0) { 
          this.board.remove(this); 
      }
    */} 
  };
};

Beer.prototype = new Sprite();
Beer.prototype.type = OBJECT_PLAYER_BEER;




/////Player/////

var Player = function(){
  this.setup('Player', {x: 421, y: 377, reloadTime: 3.5});

  this.reload = this.reloadTime;

  this.step = function(dt){
    if(Game.keys['up']){
      Game.keys['up'] = false;
      this.x -= 32;
      this.y -= 96;
      if(this.y < 0){ // Volver abajo
        this.x = 421;
        this.y = 377;
      }
    }
    else if(Game.keys['down']){
      Game.keys['down'] = false;
      this.x += 32;
      this.y += 96;
      if(this.y > 378){ // Volver arriba
        this.x = 325;
        this.y = 89;
      }
    }
    

    //this.reload -= dt;
    if(Game.keys['space'] /*&& this.reload < 0*/){ // Crear cerveza
      Game.keys['space'] = false;
      //this.reload = this.reloadTime;
      this.board.add(new Beer(this.x - sprites.Beer.w, this.y, 'Beer'));
      this.board.add(new Client(CoordenatesToCoordenates(this.y), this.y));
    }
  };
}

Player.prototype = new Sprite();
Player.prototype.type = OBJECT_PLAYER;


/////ParedIzda/////

var ParedIzda = function(){
  this.setup('ParedIzda', {x: 0, y: 0});
  this.step = function(){};
};

ParedIzda.prototype = new Sprite();

/////DeadZone/////

var DeadZone = function(x, y, w, h){
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;

  this.draw = function(){
    /*
    var c = document.getElementById("game");
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.stroke();
    */
  };

  this.step = function(){
    var beer = this.board.collide(this, OBJECT_PLAYER_BEER);
    var client = this.board.collide(this, OBJECT_CLIENT);

    if(beer){
      this.board.remove(beer);
    }    
    if(client){
      this.board.remove(client);
    }    

  };
};

DeadZone.prototype.type=OBJECT_DEADZONE;

//////////////////////////////Aux/////////////////////////////////

function levelToSpeed(y){
  switch(y){
    case 89: return 49;
    case 185: return 65;
    case 281: return 81;
    case 377: return 96;
  }
};

function levelToCoordenates(j){
  switch(j){
    case 1: return {x: 90, y: 90};
    case 2: return {x: 58, y: 185};
    case 3: return {x: 26, y: 281};
    case 4: return {x: -4, y: 377};
  }
};

function CoordenatesToCoordenates(y){
  switch(y){
    case 89: return 110;
    case 185: return 78;
    case 281: return 46;
    case 377: return 24;
  }
};


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



//////////////////////////////Events/////////////////////////////////

window.addEventListener("load", function() {
  Game.initialize("game",sprites,playGame);
});