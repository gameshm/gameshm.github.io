var sprites = {
  Beer: {sx: 512, sy: 99, w: 23, h: 32, frames: 1},
  Glass: {sx: 512, sy: 131, w: 23, h: 32, frames: 1},
  NPC: {sx: 512, sy: 66, w: 33, h: 33, frames: 1},
  ParedIzda: {sx: 0, sy: 0, w: 512, h: 480, frames: 1},
  Player: {sx: 512, sy: 0, w: 56, h: 66, frames: 1},
  TapperGameplay: {sx: 0, sy: 480, w: 512, h: 480, frames: 1}
};

var enemies = {
  straight: { x: 0,   y: -50, sprite: 'enemy_ship', health: 10, 
              E: 100 },
  ltr:      { x: 0,   y: -100, sprite: 'enemy_purple', health: 10, 
              B: 75, C: 1, E: 100, missiles: 2  },
  circle:   { x: 250,   y: -50, sprite: 'enemy_circle', health: 10, 
              A: 0,  B: -100, C: 1, E: 20, F: 100, G: 1, H: Math.PI/2 },
  wiggle:   { x: 100, y: -50, sprite: 'enemy_bee', health: 20, 
              B: 50, C: 4, E: 100, firePercentage: 0.001, missiles: 2 },
  step:     { x: 0,   y: -50, sprite: 'enemy_circle', health: 10,
              B: 150, C: 1.2, E: 75 }
};

var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_BEER = 2,
    OBJECT_CLIENT = 4,
    OBJECT_ENEMY_PROJECTILE = 8,
    OBJECT_POWERUP = 16,
    OBJECT_ENEMY = 32,
    OBJECT_PLAYER_PROJECTILE = 64;

var startGame = function() {
  var ua = navigator.userAgent.toLowerCase();

  // Only 1 row of stars
  if(ua.match(/android/)) {
    Game.setBoard(0,new Starfield(50,0.6,100,true));
  } else {
    Game.setBoard(0,new Starfield(20,0.4,100,true));
    Game.setBoard(1,new Starfield(50,0.6,100));
    Game.setBoard(2,new Starfield(100,1.0,50));
  }  
  Game.setBoard(3,new TitleScreen("Alien Invasion", 
                                  "Press fire to start playing",
                                  playGame));
};

// Ni idea de lo que es esto.
var level1 = [
 // Start,   End, Gap,  Type,   Override
  [ 0,      4000,  500, 'step' ],
  [ 6000,   13000, 800, 'ltr' ],
  [ 10000,  16000, 400, 'circle' ],
  [ 17800,  20000, 500, 'straight', { x: 50 } ],
  [ 18200,  20000, 500, 'straight', { x: 90 } ],
  [ 18200,  20000, 500, 'straight', { x: 10 } ],
  [ 22000,  25000, 400, 'wiggle', { x: 150 }],
  [ 22000,  25000, 400, 'wiggle', { x: 100 }]
];



var playGame = function() {
  var boardBG = new GameBoard();
  boardBG.add(new Background());

  var boardPlayer = new GameBoard();
  boardPlayer.add(new Player());
  boardPlayer.add(new DeadZone(90, 90, 20, 50));
  boardPlayer.add(new DeadZone(58, 185, 20, 50));
  boardPlayer.add(new DeadZone(26, 281, 20, 50));
  boardPlayer.add(new DeadZone(-4, 377, 20, 50));

  boardPlayer.add(new DeadZone(325, 90, 20, 50));
  boardPlayer.add(new DeadZone(357, 185, 20, 50));
  boardPlayer.add(new DeadZone(389, 281, 20, 50));
  boardPlayer.add(new DeadZone(421, 377, 20, 50));

  var boardPared = new GameBoard();
  boardPared.add(new ParedIzda());


  Game.setBoard(1, boardBG);
  Game.setBoard(2, boardPlayer);
  //Game.setBoard(3, boardPared);
  Game.setBoard(2, boardDeadZones);
  /*
  var board = new GameBoard();
  board.add(new PlayerShip()); // Añade los objetos al array objects de GameBoard
  board.add(new Level(level1,winGame));
  Game.setBoard(3,board);
  Game.setBoard(5,new GamePoints(0));
  */
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

var ParedIzda = function(){
  this.setup('ParedIzda', {x: 0, y: 0});
  this.step = function(){};
}

ParedIzda.prototype = new Sprite();


/*
  Spawner(y, delay, nClientes, t, Cliente)
    sp1 [_________]
     sp2 [_________]
      sp3 [_________]
       sp4 [_________]

  Object.create(cliente)
*/

var Background = function(){
  this.setup('TapperGameplay', {x: 0, y: 0});
  this.step = function(){};
}

Background.prototype = new Sprite();

var Starfield = function(speed,opacity,numStars,clear) {

  // Set up the offscreen canvas
  var stars = document.createElement("canvas");
  stars.width = Game.width; 
  stars.height = Game.height;
  var starCtx = stars.getContext("2d");

  var offset = 0;

  // If the clear option is set, 
  // make the background black instead of transparent
  if(clear) {
    starCtx.fillStyle = "#000";
    starCtx.fillRect(0,0,stars.width,stars.height);
  }

  // Now draw a bunch of random 2 pixel
  // rectangles onto the offscreen canvas
  starCtx.fillStyle = "#FFF";
  starCtx.globalAlpha = opacity;
  for(var i=0;i<numStars;i++) {
    starCtx.fillRect(Math.floor(Math.random()*stars.width),
                     Math.floor(Math.random()*stars.height),
                     2,
                     2);
  }

  // This method is called every frame
  // to draw the starfield onto the canvas
  this.draw = function(ctx) {
    var intOffset = Math.floor(offset);
    var remaining = stars.height - intOffset;

    // Draw the top half of the starfield
    if(intOffset > 0) {
      ctx.drawImage(stars,
                0, remaining,
                stars.width, intOffset,
                0, 0,
                stars.width, intOffset);
    }

    // Draw the bottom half of the starfield
    if(remaining > 0) {
      ctx.drawImage(stars,
              0, 0,
              stars.width, remaining,
              0, intOffset,
              stars.width, remaining);
    }
  };

  // This method is called to update
  // the starfield
  this.step = function(dt) {
    offset += dt * speed;
    offset = offset % stars.height;
  };
};

var speed = {first: 50, second: 65, third: 81, fourth: 96};
function levelToSpeed(y){
  switch(y){
    case 89: return 49;
    case 185: return 65;
    case 281: return 81;
    case 377: return 96;
  }
}

function levelToCoordenates(j){
  switch(j){
    case 1: return {x: 90, y: 90};
    case 2: return {x: 58, y: 185};
    case 3: return {x: 26, y: 281};
    case 4: return {x: -4, y: 377};
  }
}
var Client = function(x, y){
  this.x = x;
  this.y = y-10;
  var speed = levelToSpeed(y);
  this.setup('NPC', {vx: -speed}); // 50, 65, 81, 96 
}

Client.prototype = new Sprite();
Client.prototype.type = OBJECT_CLIENT;
Client.prototype.step = function(dt){
  this.x = this.x - this.vx*dt; 
  /*var collision = this.board.collide(this, OBJECT_PLAYER_BEER);
  if(collision) {
    // Devolver pasta
    this.board.remove(this);
  } /*else if(this.x < 0) { 
      this.board.remove(this); 
  }*/
}

var Beer = function(x, y, type){
  this.x = x;
  this.y = y;
  this.type = type;
  var speed = levelToSpeed(y);
  this.setup(type, {vx: speed}); // 50, 65, 81, 96 
}

Beer.prototype = new Sprite();
Beer.prototype.type = OBJECT_PLAYER_BEER;
Beer.prototype.step = function(dt){
  if(this.type == 'Beer'){
    this.x = this.x - this.vx*dt; 
    var collision = this.board.collide(this, OBJECT_CLIENT);
    if(collision) {
      // Cambiar el sprite por la jarra vacía y lanzarla hacia el otro lado
      //this.board.remove(this);
      this.type = 'Glass';
      this.setup('Glass', {vx: this.vx - this.vx/4});
      this.board.remove(collision);
    } else if(this.x < 0) { 
        this.board.remove(this); 
    }
  }else if(this.type == 'Glass'){
    this.x = this.x + this.vx*dt;
    var collision = this.board.collide(this, OBJECT_PLAYER);
    if(collision) {
      // Cambiar el sprite por la jarra vacía y lanzarla hacia el otro lado
      this.board.remove(this);
    } else if(this.x < 0) { 
        this.board.remove(this); 
    }
  } 
}

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
      this.board.add(new Client(0, this.y));
    }
  }
}

Player.prototype = new Sprite();
Player.prototype.type = OBJECT_PLAYER;

var DeadZone = function(x, y, w, h){
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;

  this.draw = function(){
    var c = document.getElementById("game");
    var ctx = c.getContext("2d");
    //ctx.moveTo(0,0);
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.stroke();
  }

  this.step = function(){

  }
}

var PlayerShip = function() { 
  this.setup('ship', { vx: 0, reloadTime: 0.25, maxVel: 200 });

  this.reload = this.reloadTime;
  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - Game.playerOffset - this.h;

  this.step = function(dt) {
    if(Game.keys['left']) { this.vx = -this.maxVel; }
    else if(Game.keys['right']) { this.vx = this.maxVel; }
    else { this.vx = 0; }

    this.x += this.vx * dt;

    if(this.x < 0) { this.x = 0; }
    else if(this.x > Game.width - this.w) { 
      this.x = Game.width - this.w;
    }

    this.reload-=dt;
    if(Game.keys['fire'] && this.reload < 0) {
      Game.keys['fire'] = false;
      this.reload = this.reloadTime;

      this.board.add(new PlayerMissile(this.x,this.y+this.h/2));
      this.board.add(new PlayerMissile(this.x+this.w,this.y+this.h/2));
    }
  };
};

PlayerShip.prototype = new Sprite();
PlayerShip.prototype.type = OBJECT_PLAYER;

PlayerShip.prototype.hit = function(damage) {
  if(this.board.remove(this)) {
    loseGame();
  }
};


var PlayerMissile = function(x,y) {
  this.setup('missile',{ vy: -700, damage: 10 });
  this.x = x - this.w/2;
  this.y = y - this.h; 
};

PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;

PlayerMissile.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_ENEMY);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y < -this.h) { 
      this.board.remove(this); 
  }
};


var Enemy = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;

Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, 
                                   E: 0, F: 0, G: 0, H: 0,
                                   t: 0, reloadTime: 0.75, 
                                   reload: 0 };

Enemy.prototype.step = function(dt) {
  this.t += dt;

  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

  this.x += this.vx * dt;
  this.y += this.vy * dt;

  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }

  if(Math.random() < 0.01 && this.reload <= 0) {
    this.reload = this.reloadTime;
    if(this.missiles == 2) {
      this.board.add(new EnemyMissile(this.x+this.w-2,this.y+this.h));
      this.board.add(new EnemyMissile(this.x+2,this.y+this.h));
    } else {
      this.board.add(new EnemyMissile(this.x+this.w/2,this.y+this.h));
    }

  }
  this.reload-=dt;

  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};

Enemy.prototype.hit = function(damage) {
  this.health -= damage;
  if(this.health <=0) {
    if(this.board.remove(this)) {
      Game.points += this.points || 100;
      this.board.add(new Explosion(this.x + this.w/2, 
                                   this.y + this.h/2));
    }
  }
};

var EnemyMissile = function(x,y) {
  this.setup('enemy_missile',{ vy: 200, damage: 10 });
  this.x = x - this.w/2;
  this.y = y;
};

EnemyMissile.prototype = new Sprite();
EnemyMissile.prototype.type = OBJECT_ENEMY_PROJECTILE;

EnemyMissile.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_PLAYER)
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y > Game.height) {
      this.board.remove(this); 
  }
};



var Explosion = function(centerX,centerY) {
  this.setup('explosion', { frame: 0 });
  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;
};

Explosion.prototype = new Sprite();

Explosion.prototype.step = function(dt) {
  this.frame++;
  if(this.frame >= 12) {
    this.board.remove(this);
  }
};

window.addEventListener("load", function() {
  Game.initialize("game",sprites,playGame);
});


