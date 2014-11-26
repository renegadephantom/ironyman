var Game = new function() {
  var boards = [];

  this.initialize = function(canvasElementId,sprite_data,callback){
    this.canvas = document.getElementById(canvasElementId);
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
    this.setupInput();
    this.loop();
    SpriteSheet.load(sprite_data,callback);
  };

  // Handle Input
  var KEY_CODES = { 37:'left', 39:'right', 32 :'fire' };
  this.keys = {};

  this.setupInput = function() {
    window.addEventListener('keydown',function(e) {
      if(KEY_CODES[event.keyCode]) {
       Game.keys[KEY_CODES[event.keyCode]] = true;
       e.preventDefault();
      }
    },false);

    window.addEventListener('keyup',function(e) {
      if(KEY_CODES[event.keyCode]) {
       Game.keys[KEY_CODES[event.keyCode]] = false;
       e.preventDefault();
      }
    },false);
  };

  this.loop = function(){
    var dt = 30/1000;

    for(var i=0,len = boards.length;i<len;i++){
      if(boards[i]){
        boards[i].step(dt);
        boards[i].draw(Game.ctx);
      }
    }
    setTimeout(Game.loop,30);
  };

  this.setBoard = function(num,board){
      boards[num] = board;
  };

};




var SpriteSheet = new function() {
  this.map = {};

  this.load = function(spriteData,callback) {
    this.map = spriteData;
    this.image = new Image();
    this.image.onload = callback;
    this.image.src = "images/irony-sprites-new-mi1.png";
  };

  this.draw = function(ctx,sprite,x,y,frame) {
    var s = this.map[sprite];
    if(!frame) frame = 0;

    /* READ : understand why + frame x s.w*/
    ctx.drawImage(this.image,
                     s.sx + frame * s.w,
                     s.sy,
                     s.w, s.h,
                     x,   y,
                     s.w, s.h);

  };
};



var GameBoard = function(){
  /* imagine GB object creating a variable and adding itself into it */
  var board = this;
  this.objects = []; //array that maintains all objects on board
  this.cnt = [];

  /* GB creates a clone of itself and adds it to incoming objects to get access to all other objects*/
  this.add = function(obj){
    obj.board = this;
    this.objects.push(obj);
    this.cnt[obj.type] = (this.cnt[obj.type] || 0) + 1; // to keep a track of number of objects of a specific type
    return obj;
  }

  /* remove object is done in 3 steps
     1. reset list of objects identified for removal
     2. add into remove list only after checking if object was already removed or not
     3. finalize remove
  */
  this.resetRemoved = function(){
    this.removed = [];
  };

  this.remove = function(obj){
    var wasStillAlive = this.removed.indexOf(obj) != -1;
    if(wasStillAlive) {
      this.removed.push(obj);
    }
    return wasStillAlive;
  };

  this.finalizeRemoved = function(){
    for(var i=0,len = this.removed.length;i<len;i++){
      var idx = this.objects.indexOf(this.removed[i]);
      this.cnt[this.removed[i].type]--;
      this.objects.splice(idx,1);
    }
  };

  this.iterate = function(funcName){
    var args = Array.prototype.slice.call(arguments,1); //READ
    for(var i=0,len=this.objects.length;i<len;i++){
      var obj = this.objects[i];
      obj[funcName].apply(obj,args);
    }
  };


  this.step = function(dt){
    this.resetRemoved();
    this.iterate('step',dt);
    this.finalizeRemoved();
  };

  this.draw = function(ctx){
    this.iterate('draw',ctx);
  };

  /* READ */
  this.overlap = function(o1,o2){
    return !((o1.y + o1.h-1 < o2.y) || (o1.y > o2.y + o2.h-1) ||
            (o1.x + o1.w-1 < o2.x) || (o1.x > o1.x+o1.w-1));

  };

  /* READ */
  this.detect = function(func){
    for(var i=0,val=0,len=this.objects.length;i<len;i++){
      if(func.call(this.objects[i])) return this.objects[i];
    }
    return false;
  };

  /* READ */
  this.collide = function(obj,type){
    return this.detect(function() {
      if(obj != this){
        var col = ((!type || this.type & type) && board.overlap(obj,this))
        return col ? this : false;
      }
    });
  };
};





























