var game = function() {

// Set up an instance of the Quintus engine  and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.
var Q = window.Q = Quintus({ audioSupported: [ 'mp3', 'ogg' ] })
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio").enableSound()
        // Maximize this game to whatever the size of the browser is
        .setup({ maximize: true })
        // And turn on default input controls and touch input (for UI)
        .controls().touch();

var purse=[{x: 250, y: 500}, {x: 650, y:475}, {x: 1000, y:475},
           {x: 900, y: 475}, {x: 850, y: 375}, {x: 1150, y: 50},
           {x: 1200, y:50}, {x: 1250, y:50}, {x: 1075, y:75},
           {x: 1500, y:280}, {x: 1750, y:420}, {x: 2340, y:225},
           {x: 2380, y:525}, {x: 3025, y:525}, {x: 3335, y:450},
           {x: 3635, y:525}, {x: 3825, y:480}, {x: 1600, y:450}];

Q.animations("mario_anim", {
  walk_right: { frames: [0,1,2,3], rate: 1/10, flip: false, loop: true}, 
  walk_left: { frames: [15,16,17], rate: 1/10, flip:false, loop: true}, 
  jump_right: { frames: [4], rate: 1/10, flip: false },
  jump_left: { frames: [18], rate: 1/10, flip: false },
  stand_right: { frames:[0], rate: 1/10, flip: false },
  stand_left: { frames: [14], rate: 1/10, flip:false },
  duck_right: { frames: [15], rate: 1/10, flip: false },
  die: { frames: [12], rate: 0.75, loop:false, trigger:"died"},
  duck_left: { frames: [15], rate: 1/10, flip: "x" },
  climb: { frames: [16, 17], rate: 1/3, flip: false }
});

Q.animations("prost_anim", {
  run_right: { frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], rate: 1/10, flip: false, loop: true}, 
  run_left: { frames: [31,30,29,28,27,26,25,24,23,22,21,20,19,18,17], rate: 1/10, flip: false, loop: true}, 
  jump_right: { frames: [34], rate: 1/10, flip: false, loop: false },
  jump_left: { frames: [35], rate: 1/10, flip: false },
  stand_right: { frames:[0], rate: 1, flip: false },
  stand_left: { frames: [17], rate: 1, flip: false },
  die: { frames: [1], rate: 1/10, loop: false, trigger: "died"}
});

Q.animations("prost_anim_big", {
  
  transform_right: {frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19], rate: 1/10, flip: false, loop: false, trigger: "setTransforming"},
  transform_left: {frames: [39,38,37,36,35,34,33,32,31,30,29,28,27,26,25,24,23,22,21,20], rate: 1/10, flip: false, loop: false, trigger: "setTransforming"},
  transform_back_right: {frames: [15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0], rate: 1/30, flip: false, loop: false, trigger: "setTransforming"},
  transform_back_left: {frames: [24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39], rate: 1/30, flip: false, loop: false, trigger: "setTransforming"},
  stand_right_t: { frames:[19], rate: 1, flip: false },
  stand_left_t: { frames: [20], rate: 1, flip: false },
  walk_right: {frames:[40, 41, 42, 43, 44], rate: 2/10, flip: false},
  walk_left: {frames:[49, 48, 47, 46, 45], rate: 2/10, flip: false},
  jump_right: { frames: [2,3,4,5,5,5,5,4,3,2], rate: 2/10, flip: false, loop: false },
  jump_left: { frames: [37,36,35,34,34,34,34,35, 36, 37], rate: 2/10, flip: false, loop: false },
  throw_right: {},
  throw_left: {},
  die: { frames: [1], rate: 1/10, loop: false, trigger: "died"}
});

Q.animations("bloopa_anim", {
  stand: { frames: [0], rate: 1/10, flip: false}, 
  up: { frames: [1], rate: 1/10, flip:false}, 
  down: { frames: [2], rate: 1/10, flip: false }
});

Q.animations("goomba_anim", {
  move: { frames: [0, 1], rate: 1/2, flip: false, loop: true}, 
  die: { frames: [2], rate: 1, loop: false, trigger:"died"},
  down: {frames: [3], rate: 2, loop: false, trigger:"nofall"}
});

Q.animations("coin_anim", {
  stand: { frames: [0, 1, 2], rate: 1/2, flip: false, loop: true},
  take: { frames: [0, 1, 2], rate: 0.1, flip: false, loop: false, trigger:"toke"}
});

Q.animations("thunder_anim", {
  stand: { frames: [0, 0, 1, 1, 1, 4, 4, 2, 2, 3, 3, 4, 4], rate: 2/10, flip: false, loop: true},
  taken: { frames: [4], rate: 1, flip: false, loop: false},
});
Q.animations("hammer_anim", {
  
});

// Global Quintus variables
Q.state.set({score: 0, hammer: " ", game: "playing", lifePoints: 5});

// ## Player Sprite
// The very basic player sprite, this is just a normal sprite
// using the player sprite sheet with default controls added to it.
Q.Sprite.extend("Mario",{

  // the init constructor is called on creation
  init: function(p) {

    // You can call the parent's constructor with this._super(..)
    this._super(p, {
      sprite: "mario_anim",
      sheet: "mario",  // Setting a sprite sheet sets sprite width and height
      x: 150,           // You can also set additional properties that can
      y: 380,           // be overridden on object creation
      gravity: 0.6             
    });
    this.add('2d, platformerControls, animation');

    Q.input.on("fire",this,"die");

    this.on("bump.top",function(collision) {
        if(collision.obj.isA("Mario")) {
          collision.obj.p.vy = -300;
        }
    });

    this.on("died", this, "destroy");
  },

  
  die: function(){
   this.play("die", 1);
   Q.stageScene("endGame",1, { label: "You Died" });
   //this.del('platformerControls');
  },

  jump:function(){
    this.p.vy=-300;
  },
  step: function(dt){
    if(this.p.vy!=0){
      this.play("jump_"+this.p.direction);
    }else if(this.p.vx > 0) {
      this.play("walk_right"); 
    } else if(this.p.vx < 0) {
      this.play("walk_left"); 
    } else {
      this.play("stand_" + this.p.direction);
    }
    
    if(this.p.y> 550){
      this.die();
    }
  }

});


// Prost
Q.Sprite.extend("Prost",{
  // the init constructor is called on creation
  init: function(p) {
    // You can call the parent's constructor with this._super(..)
    this._super(p, {
      sprite: "prost_anim",
      sheet: "prost",  // Setting a sprite sheet sets sprite width and height
      x: 70,           // You can also set additional properties that can
      y: 500,           // be overridden on object creation
      gravity: 0.6,
      transforming: false,
      shape: "dog",
      hammer: false             
    });
    this.p.w = 32;
    this.add('2d, platformerControls, animation');

    Q.input.on("fire",this,"throw");

    this.on("bump.top",function(collision) {
        if(collision.obj.isA("Mario") || collision.obj.isA("Prost")) {
          this.destroy(); 
          collision.obj.p.vy = -300;
        }
    });

    this.on("hit.Sprite", function(collision) {
        if(collision.obj.isA("Hammer")) {
          collision.obj.die();
        }
    });

    var prost = this;
    Q.state.on("change.hammer", function(){
      if(Q.state.get("hammer") == "Power of the Mighty Hammer lost. Find it again."){
        prost.transform();
        this.p.hammer = false;
      }
    });
    Q.state.on("change.lifePoints", function(){
      Q.stageScene("HUD", 1, {life: {label: Q.state.get("lifePoints")}});
    });
    //this.on("died", this, "destroy");
    this.on("setTransforming", this, "shapeShift");
  },
  shapeShift: function(){
    this.p.transforming = false;
    if(this.p.shape == "dog"){
      this.p.shape = "humanoid";
      this.p.hammer = true;
    }
    else if(this.p.sheet == "prost_transformation"){
      this.p.shape = "dog";
      this.p.sheet = "prost";
      this.p.sprite = "prost_anim";
      this.size(true);
      Q._generatePoints(this, false);
    }
    
  },
  transform: function(){
    if(this.p.shape == "dog"){
      this.p.sheet = "prost_transformation";
      this.p.sprite = "prost_anim_big";
      this.p.transforming = true;
      this.size(true);
      Q._generatePoints(this, false);
      this.play("transform_" + this.p.direction);
      Q.audio.play("Hammer.mp3");
    }
    else if (this.p.shape == "humanoid"){
      this.p.transforming = true;
      this.play("transform_back_" + this.p.direction);
      Q.audio.stop("Hammer.mp3");
    }
  },

  retrieveHammer: function(){
    this.p.hammer = true;
  },

  throw: function(){
    if(this.p.shape == "humanoid" && this.p.hammer){
      //this.play("throw_" + this.p.direction);
      var vx, dx;
      var dy = -20;
      var a;
      if(this.p.direction == "right"){
        vx = 300;
        dx = 30;
        a = 90;
      }
      else{
        vx = -300;
        dx = -30;
        a = -90;
      }
      var hammer = new Q.Hammer(this.p.x + dx, this.p.y - dy, vx);
      this.stage.insert(hammer);
      hammer.animate({angle: a }, 0.1);
      this.p.hammer = false;
    }
  },

  die: function(){
    //Q.state.set("hammer", "You're dead");    
    //this.play("die", 1); // Es una animacion de un frame, (siguiente línea)
    // que luego llama a this.on("died", this, "destroy")
    if(Q.state.get("lifePoints") > 0){
      Q.state.set("lifePoints", Q.state.get("lifePoints") - 1);
      //this.p.sprite = "prost_anim";
      //this.p.sheet = "prost";  // Setting a sprite sheet sets sprite width and height
      this.p.x = 70;           // You can also set additional properties that can
      this.p.y = 500;           // be overridden on object creation
      //this.p.transforming = false;
      //this.p.shape = "dog";
      //this.p.hammer = false; 
    }
    if(Q.state.get("lifePoints") <= 0){
      if(Q.state.get("game") != "lost"){
        Q.stageScene("endGame",1, { label: "You died" }); 
        //this.del('platformerControls');
        this.destroy();
        Q.state.set("game", "lost");
      }
    }
  },

  jump:function(){
    this.p.vy=-300;
  },

  step: function(dt){
    if(this.p.sheet == "prost" && !this.p.transforming){
      if(this.p.vy!=0){
        this.play("jump_"+this.p.direction);
      }else if(this.p.vx > 0) {
        this.play("run_right"); 
      } else if(this.p.vx < 0) {
        this.play("run_left"); 
      } 
      else
        this.play("stand_" + this.p.direction);
      
    }
    else if(this.p.sheet == "prost_transformation" && !this.p.transforming){
      if(this.p.vy!=0){
        this.play("jump_"+this.p.direction);
      }else if(this.p.vx > 0) {
        this.play("walk_right"); 
      } else if(this.p.vx < 0) {
        this.play("walk_left"); 
      } 
      else
        this.play("stand_" + this.p.direction + "_t");  
    }

    if(this.p.y> 750){
      this.die();
    }    
  }
});

Q.Sprite.extend("Princess", {
  init:function(){
    this._super({
      asset:"princess.png",
      x: 4600,
      y: 525, 
      gravity:1
    });
    this.add('2d');
    this.p.sensor=true;
    this.on("bump.top, bump.right, bump.bottom, bump.left", function(collision){
      if((collision.obj.isA("Mario") || collision.obj.isA("Prost")) && Q.state.get("game") != "won"){
        Q.stageScene("endGame",1, { label: "You win" }); 
        Q.audio.stop('music_main.mp3');
        Q.audio.play('Victory.mp3',{ loop: false });
        //collision.obj.del('platformerControls');
        Q.state.set("game", "won");
      }
    });
  }
});

Q.Sprite.extend("Coin", {
  init:function(paramX, paramY){
    this._super({
      sprite:"coin_anim",
      sheet:"coin",
      x: paramX,
      y: paramY, 
      gravity:0,
      taken:false
    });
    this.add('2d, animation, tween');
    this.p.sensor=true;
    this.on("bump.top, bump.right, bump.bottom, bump.left", function(collision){
       if(collision.obj.isA("Mario") || collision.obj.isA("Prost")) { 
        if(!this.p.taken){
          this.up();
          Q.state.inc("score",1);
          this.p.taken=true;
        }
      }
    });
    this.on("toke", this, "destroy");
    Q.state.on('change.score', function(){
      Q.stageScene("HUD", 1, {text: {label: Q.state.get("score")}}); 
    });
  },
  up: function(){
    Q.audio.stop('coin.mp3');
    Q.audio.play('coin.mp3',{ loop: false });
    this.animate({ x: this.p.x, y: this.p.y-100, angle: 0, opacity:0.5 }, 0.1);
    this.play("take", 1);
  },
  step: function(){
    this.play("stand");
  }

});

Q.Sprite.extend("Thunder", {
  init:function(paramX, paramY){
    this._super({
      sprite:"thunder_anim",
      sheet:"thunder",
      x: paramX,
      y: paramY, 
      gravity:0,
      state: "thunder",
      fps: 600,
      remainingSecs: 10,
      prost: false
    });
    this.p.w = 32;
    this.p.h = 32;
    this.add('2d, animation, tween');
    this.p.sensor=true;
    this.on("bump.top, bump.right, bump.bottom, bump.left", function(collision){
       this.p.prost = collision;
       if(collision.obj.isA("Prost") && this.p.state == "thunder") { 
          collision.obj.transform();
          this.p.state = "taken";
          this.p.y = 50;
        }
    });
    var thunder = this;
    Q.state.on("change.game", function(){
      if(Q.state.get("game") == "lost"){
        thunder.destroy();
      }
    });
    Q.state.on("change.hammer", function(){
      Q.stageScene("HUD", 1, {remainingSecs: {label: Q.state.get("hammer")}});
    });
  },
  step: function(){
    if(this.p.state == "thunder"){
      this.play("stand");
    }
    else if (this.p.state == "taken" && this.p.remainingSecs >= 0 && Q.state.get("hammer") != "You're dead"){
      this.play("taken");
      if(this.p.fps%60 == 0){
        Q.state.set("hammer", "Hammer use: "+ this.p.remainingSecs + " secs left!");
        this.p.remainingSecs--;
      }
      this.p.fps--;
      if(this.p.remainingSecs < 0){
        Q.state.set("hammer", "Power of the Mighty Hammer lost. Find it again.");
        this.p.state == "wasted";
        this.destroy();
      }
    }
  }

});


Q.Sprite.extend("Hammer", {
  init:function(paramX, paramY, paramVx, paramVy){
    this._super({
      sprite:"hammer_anim",
      sheet:"hammer",
      x: paramX,
      y: paramY,
      vx: paramVx, 
      gravity:0.2,
      stage: "going"
    });
    this.add('2d, animation, tween');
    this.p.sensor=true;
    this.on("bump.top, bump.right, bump.bottom, bump.left", function(collision){
      if(collision.obj.isA("Goomba") || collision.obj.isA("Bloopa") && this.p.stage == "going") { 
          collision.obj.die();
          this.p.stage = "returning";
          this.p.vx = -paramVx;
          var a = (this.p.direction == "right" ? 90 : -90);
          this.animate({angle: a}, 0.3);
      }
      if(collision.obj.isA("Prost") && this.p.stage == "returning") { 
          this.die();
          collision.obj.retrieveHammer();
          console.log("he tocado mjolnir");
      }
    });
    var hammer = this;
    Q.state.on("change.game", function(){
      if(Q.state.get("game") == "lost"){
        hammer.destroy();
      }
    });
  },

  die: function(){
    this.destroy();
  },

  step: function(dt){
  }

});

Q.component("defaultEnemy",{
  added:function(){
    this.entity.on("bump.left, bump.right, bump.bottom",function(collision) {
        if(collision.obj.isA("Mario") || collision.obj.isA("Prost")) { 
            collision.obj.die();
        }
        if(collision.obj.isA("Hammer")){
          this.destroy();
        }
    });
  }
});

Q.Sprite.extend("Goomba",{//seta
  init: function(paramX, paramY, p) {
    this._super(p, {
      sprite: "goomba_anim",
      sheet: "goomba",  // Setting a sprite sheet sets sprite width and height
      x: paramX,           // You can also set additional properties that can
      y: paramY,           // be overridden on object creation
      gravity: 1,
      vx: 100             
    });
    this.add('2d, animation, aiBounce, tween, defaultEnemy');
    this.on("bump.top",function(collision) {
        if(collision.obj.isA("Mario") || collision.obj.isA("Prost")) {
          this.die();
          this.p.vx=0;
          collision.obj.p.vy = -300;
        }
    });
   
    this.on("died", this, "death");
    this.on("nofall", this, "destroy");
  },
  death: function(){
    this.animate({ x: this.p.x, y: this.p.y+300, angle: 0 }, 1);
    this.play("down", 1);
  },
  die: function(){this.play("die", 1);},
  
  step: function(dt){
    this.play("move");
    if(this.p.y > 750){
      this.destroy();
    }
  }

});

Q.Sprite.extend("Bloopa",{//calamar
  init: function(paramX, paramY, p) {
    this._super(p, {
      sprite: "bloopa_anim",
      sheet: "bloopa",  // Setting a sprite sheet sets sprite width and height
      x: paramX,           // You can also set additional properties that can
      y: paramY,           // be overridden on object creation
      gravity: 0.1
    });
    this.add('2d, animation, aiBounce, defaultEnemy');
    this.on("bump.top",function(collision) {
        if(collision.obj.isA("Mario") || collision.obj.isA("Prost")) {
          this.die();
          collision.obj.p.vy = -300;
        }
    });
    this.on("bump.bottom",function(collision) {
      this.p.vy = -100;
    });
  },
  die: function(){
    this.play("down", 1);
    //this.animate({ x: this.p.x, y: this.p.y+300, angle: 0 }, 1);
  },
  step: function(dt){
    if(this.vy>0){
      this.play("down");
    }else if(this.vy<0){
      this.play("up");
    }else
      this.play("stand");

    if(this.p.y > 750){
      this.destroy();
    }
}
});

Q.scene("HUD",function(stage) {

  
  // Contador descendente del poder del martillo
  var hammerSecs = Q.state.get("hammer");
  var remainingSecs = new Q.UI.Text({x: Q.width/2, y: 90, label: hammerSecs, color: "#707070", outlineWidth: 3});
  stage.insert(remainingSecs);

  // Contador ascendente de puntos por monedas
  var nCoins = Q.state.get("score");
  var text = new Q.UI.Text({x:80, y: 40, label: "Score: "+ nCoins, color: "#ffc600", outlineWidth: 3, outline: "#ff7200"});
  stage.insert(text);

  // Contador descendente de puntos de vida
  var lifePoints = Q.state.get("lifePoints");
  var life =new Q.UI.Text({x:110, y: 70, label: "Life points: "+ lifePoints, color: "#ffc600", outlineWidth: 3, outline: "#ff7200"});
  stage.insert(life);
});


Q.load([ "Hammer.mp3", "Victory.mp3","music_main.mp3", "coin.mp3", "music_level_complete.mp3" ], function() { 
  //Q.audio.play('music_main.mp3',{ loop: true });
});

Q.load(["galaxy.png", "hammer.png", "hammer.json", "thunder.png", "thunder.json", "prost_small.png", "prost.json", "mainTitle.png","princess.png","coin.png","coin.json","mario_small.png", "mario_small.json", "goomba.png", "goomba.json", "bloopa.png", "bloopa.json", "bgProst.png"], function(){
        Q.compileSheets("prost_small.png", "prost.json");
        Q.compileSheets("hammer.png", "hammer.json");
        Q.compileSheets("thunder.png", "thunder.json");
        Q.compileSheets("mario_small.png", "mario_small.json");
        Q.compileSheets("goomba.png", "goomba.json");
        Q.compileSheets("bloopa.png", "bloopa.json");
        Q.compileSheets("coin.png", "coin.json");
      });

Q.scene("level1",function(stage) {
      stage.insert(new Q.Repeater({ asset: "bgProst.png", speedX: 0.2, speedY: 0.2, type: 0 }));
      //stage.insert(new Q.Repeater({ asset: "galaxy.png", speedX: 0.5, speedY: 0.5, type: 0 }));
      Q.stageTMX("levelProst.tmx",stage);
      //var mario = stage.insert(new Q.Mario());
      var prost = stage.insert(new Q.Prost());

      for(var i=0; i<purse.length; i++){
        stage.insert(new Q.Coin(purse[i].x, purse[i].y));
      }
      var thunder = stage.insert(new Q.Thunder(200, 500));
      //var thunder2 = stage.insert(new Q.Thunder(240, 500));
      
      var goomba = stage.insert(new Q.Goomba(250, 380));
      var bloopa = stage.insert(new Q.Bloopa(350, 380));

      var goomba = stage.insert(new Q.Goomba(1350, 380));
      var bloopa = stage.insert(new Q.Bloopa(1450, 280));

      var goomba = stage.insert(new Q.Goomba(1550, 380));

      var thunder2 = stage.insert(new Q.Thunder(1750, 350));

      var goomba = stage.insert(new Q.Goomba(1750, 320));
      var goomba = stage.insert(new Q.Goomba(1850, 320));

      var goomba = stage.insert(new Q.Goomba(2150, 320));

      var princess=stage.insert(new Q.Princess());

      stage.add("viewport").follow(prost,{ x: true, y: false });
});

Q.loadTMX("levelProst.tmx", function() {
    //Q.stageScene("level1");
    Q.stageScene("menu");
    //Q.debug = true;
});

Q.scene('endGame',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));

  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: "Play Again" }));         
  var label = container.insert(new Q.UI.Text({x:5, y: -10 - button.p.h, 
                                                   label: stage.options.label, color: "#FFFFFF" }));
  button.on("click",function() {
    Q.clearStages();
    Q.audio.stop();
    Q.state.reset({score: 0, hammer: " ", game: "playing", lifePoints: 5});
    //Q.audio.play('music_main.mp3',{ loop: true });
    Q.stageScene('level1', 0);
    Q.stageScene('HUD', 1);
  });

  container.fit(20);
});

Q.scene('menu',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));

  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC", w:Q.width, h:Q.height, asset:"mainTitle.png" })); 
  
  button.on("click",function() {
    Q.clearStages();
    Q.state.reset({score: 0, hammer: " ", game: "playing", lifePoints: 5});
    Q.stageScene('level1', 0);
    Q.stageScene('HUD', 1);
  });

});

}