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

var speed = {first: 50, second: 65, third: 81, fourth: 96};    


///////////////////////////////GameLogic///////////////////////////////

var playGame = function() {
  var boardBG = new GameBoard();
  boardBG.add(new Background());

  var boardPlayer = new GameBoard();
  var boardPared = new GameBoard();
  boardPared.add(new ParedIzda());
  boardPlayer.add(new Player());
  boardPlayer=loadDeadZones(boardPlayer);
  boardPlayer=loadSpawns(boardPlayer);

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



//////////////////////////////Objects//////////////////////////////////

/////Spawner/////

var Spawner=function(bar, number, type, frecuency, delay){
  this.bar=bar;
  this.number=number;
  this.type=type;
  this.frecuency=frecuency;
  this.delay=delay;
};
Spawner.prototype.draw=function(){};
Spawner.prototype.step=function(){
  
  var c=new Client(zones[this.bar[ini]]);
  Object.create(c);

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
      }
    }else if(this.t == 'Glass'){
      this.x = this.x + this.vx*dt;
      var collision = this.board.collide(this, OBJECT_PLAYER);
      if(collision) {
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

    //this.reload -= dt;
    if(Game.keys['space'] /*&& this.reload < 0*/){ // Generate Beer
      Game.keys['space'] = false;
      //this.reload = this.reloadTime;
      this.board.add(new Beer(this.counter, 'Beer'));
      if(Math.floor((Math.random() * 10) + 1)>5)
        this.board.add(new Client(this.counter));
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
    var beer = this.board.collide(this, OBJECT_PLAYER_BEER);
    var glass = this.board.collide(this, OBJECT_PLAYER_GLASS); // OBJECT_PLAYER_GLASS added for further implementations (dealing with collisions)
    var client = this.board.collide(this, OBJECT_CLIENT);

    if(glass){
      this.board.remove(glass);
      // Game should be over
    }
    if(beer){ 
      this.board.remove(beer);
      // Game should be over
    }    
    if(client){
      this.board.remove(client);
      // Game should be over
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

var loadSpawns=function(boardPlayer){
  //boardPlayer.add(new Spawner());


  return boardPlayer;
};

//////////////////////////////Events///////////////////////////////////

window.addEventListener("load", function() {
  Game.initialize("game",sprites,playGame);
});