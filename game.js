var sprites = {
  ironyman: { sx: 0, sy: 0, w: 200, h: 200, frames: 1 },
  missile: { sx: 105, sy: 220, w: 20, h: 70, frames: 1 }
};


window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});

var playGame = function() {
//  Game.setBoard(0,new movingSky(100,0.4));
//  Game.setBoard(1,new ironyMan());

  var board = new GameBoard();
	board.add(new movingSky(100,0.4));
	Game.setBoard(0,board);
	board.add(new ironyMan());
	Game.setBoard(1,board);
};

var startGame = function(){
  Game.setBoard(0,new splashScreen());
//  Game.setBoard(1,new movingSky());
}


var ironyMan = function(){
  this.w = SpriteSheet.map['ironyman'].w;
  this.h = SpriteSheet.map['ironyman'].h;
  this.x = Game.width/2 - this.w/2;
  this.y = Game.height - 10 - this.h;
  this.vx = 0;
  this.reloadTime = 0.25;  // Quarter second reload
  this.reload = this.reloadTime;
  this.maxVel = 200;

  this.step = function(dt) {
    if(Game.keys['left']){
      this.vx = -this.maxVel;
    }
    else if(Game.keys['right']){
      this.vx = this.maxVel;
    }
    else {
      this.vx = 0;
    }
    this.x += this.vx*dt;

    if(this.x < 0) {this.x = 0;}
    else if(this.x > Game.width - this.w){
      this.x = Game.width - this.w;
    }

	this.reload-=dt;
     if(Game.keys['fire'] && this.reload < 0) {
       Game.keys['fire'] = false;
       this.reload = this.reloadTime;

       this.board.add(new ironymanMissile(this.x,this.y+this.h/2));
       this.board.add(new ironymanMissile(this.x+this.w,this.y+this.h/2));
     }

  }

  this.draw = function(ctx){
    SpriteSheet.draw(ctx,'ironyman',this.x,this.y,0);
  }
}


var splashScreen = function(){
  var timeOut = 0;
  var img = new Image();
  img.onload = function() {
    Game.ctx.drawImage(img,0,0,Game.width,Game.height,0,0,Game.width,Game.height);
  };
  img.src = "images/splash.png";

  this.step = function(dt){
     timeOut += dt*1000;
     if(timeOut >= 2000) {
         playGame();
     }
  };

  this.draw = function(ctx){

  }
};

var movingSky = function(speed,opacity){
  var offset = 0;
  var sky = document.createElement("canvas");
  sky.width = Game.width;
  sky.height = Game.height;
  var skyCtx = sky.getContext("2d");
  var img = document.createElement("img");
  img.onload = function() {
    skyCtx.drawImage(img,0,0);
  }
  img.src = "images/movingsky1.png";

  this.step = function(dt) {
    offset += dt * speed;
    offset = offset % sky.height;
  }

  this.draw = function(ctx){
    var intOffset = Math.floor(offset);
    var remaining = sky.height - intOffset;

    if(intOffset > 0) {
      ctx.drawImage(sky,
                0, remaining,
                sky.width, intOffset,
                0, 0,
                sky.width, intOffset);
    }

    if(remaining > 0) {
      ctx.drawImage(sky,
              0, 0,
              sky.width, remaining,
              0, intOffset,
              sky.width, remaining);
    }
  };
};


var ironymanMissile = function(x,y){
	this.w = SpriteSheet.map['missile'].w;
	this.h = SpriteSheet.map['missile'].h;
	this.x = x - this.w/2;
	this.y = y - this.h;
	this.vy = -700;
};

ironymanMissile.prototype.step = function(dt){
	this.y += this.vy * dt;
	if(this.y < -this.h) {this.board.remove(this);}
}

ironymanMissile.prototype.draw = function(ctx){
	SpriteSheet.draw(ctx,'missile',this.x,this.y);
}


