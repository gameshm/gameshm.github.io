var game = function() {

// Set up an instance of the Quintus engine  and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.
var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX")
        // Maximize this game to whatever the size of the browser is
        .setup({ maximize: true })
        // And turn on default input controls and touch input (for UI)
        .controls().touch()


// ## Player Sprite
// The very basic player sprite, this is just a normal sprite
// using the player sprite sheet with default controls added to it.
Q.Sprite.extend("Mario",{

  // the init constructor is called on creation
  init: function(p) {

    // You can call the parent's constructor with this._super(..)
    this._super(p, {
      sprite: "mario_small",
      sheet: "marioR",  // Setting a sprite sheet sets sprite width and height
      x: 150,           // You can also set additional properties that can
      y: 380,           // be overridden on object creation
      gravity: 0.3             
    });
    this.add('2d, platformerControls, animation');

    this.on("hit.sprite",function(collision) {

      if(collision.obj.isA("Tower")) {
        Q.stageScene("endGame",1, { label: "You Won!" }); 
        this.destroy();
      }
    });

  },

  step: function(dt){
    if(this.p.y > 550){
      this.p.x = 150;
      this.p.y = 380;
      this.p.vy = 0;
    }
  }

});

Q.Sprite.extend("Goomba",{
  init: function(p) {
    this._super(p, {
      sprite: "goomba",
      sheet: "goomba",  // Setting a sprite sheet sets sprite width and height
      x: 250,           // You can also set additional properties that can
      y: 380,           // be overridden on object creation
      gravity: 1             
    });
    this.add('2d, platformerControls, animation');
    this.on("hit.sprite",function(collision) {

      // Check the collision, if it's the Tower, you win!
      if(collision.obj.isA("Tower")) {
        Q.stageScene("endGame",1, { label: "You Won!" }); 
        this.destroy();
      }
    });
  },
  step: function(dt){
    if(this.p.y > 550){
      this.p.x = 150;
      this.p.y = 380;
      this.p.vy = 0;
    }
  }

});

Q.load(["mario_small.png", "mario_small.json", "goomba.png", "goomba.json"], function(){
        Q.compileSheets("mario_small.png", "mario_small.json");
        Q.compileSheets("goomba.png", "goomba.json");
      });

Q.scene("level1",function(stage) {
      Q.stageTMX("level.tmx",stage);

      var mario = stage.insert(new Q.Mario());
      var goomba = stage.insert(new Q.Goomba());
      stage.add("viewport").follow(mario);
});
 
Q.loadTMX("level.tmx", function() {

    Q.stageScene("level1");

});


}