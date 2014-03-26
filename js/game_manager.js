var myhero;
function GameManager(size, InputManager, Actuator, ScoreManager) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.scoreManager = new ScoreManager;
  this.actuator     = new Actuator;
  
  this.inputManager.on("jump", this.jump.bind(this));
  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
  this.startTiles   = 1;
  this.setup();

  this.timer();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.continue();
  this.setup();
};

// Keep playing after winning
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continue();
};

GameManager.prototype.isGameTerminated = function () {
  if (this.over || (this.won && !this.keepPlaying)) {
    return true;
  } else {
    return false;
  }
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid = new Grid(this.size);
  console.log(this.grid);
  //console.log(this.size);
  this.score = 0;
  this.over  = false;
  this.won   = false;
  this.keepPlaying = false;


  this.birdpos = 0.5;
  this.birdposleft = 0.5;
  this.birdspd = 0;
  this.ab = 1;
  this.cd = 1;




   //add start tile
    console.log("add start tile");
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);
    console.log(tile);
    //console.log(myhero);
    myhero = tile
    console.log(myhero);
    this.grid.insertTile(tile);
    
    //update the actutator
    this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);
    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.scoreManager.get() < this.score) {
    this.scoreManager.set(this.score);
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.scoreManager.get(),
    terminated: this.isGameTerminated(),
    birdpos:    this.birdpos,
    birdposleft:this.birdposleft,
    ab:         this.ab,
    cd:         this.cd
  });

};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  console.log('========move=======');
  // 0: up, 1: right, 2:down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  //var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();


  //just move now
  //console.log("in-move");console.log(vector);
  //cell is our hero
  cell = { x: myhero.x , y: myhero.y };
   //check if annother block exists
  tile = self.grid.cellContent(cell);
  if(tile){
   
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);
        cell = { x: myhero.x + vector.x, y: myhero.y + vector.y };
        //check if myhero goes out of arena 
        if(cell.x > 9 || cell.y > 9 || cell.x <0 || cell.y <0){
          console.log("collison with wall game over")
          this.over = true; // Game over!
        }
        else{
          self.moveTile(tile, cell);
          myhero=cell;
          console.log("updated my hero")
          console.log(myhero)
          moved=true;
        }
        
       }
   else{
        console.log("hero tile missing")
     }
    //move variable
  //update score





/*
  //move tile in direction clicked
    cell = { x: myhero.x , y: myhero.y };//update myhero later
    console.log(cell)
    tile = self.grid.cellContent(cell);
    console.log("tile"+tile);
      //tile is the content of current tile -- now my hero tile 
  //console.log("cell:"+cell.x);
 // console.log("tile:"+tile);
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);
  //tile = { x: myhero.x + vector.x, y: myhero.y + vector.y };
  
  //update score here



  self.moveTile(tile,next);
  myhero.x = cell.x;
  myhero.y = cell.y;
  //update myhero here*/



/*
   if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        //positions farthest and next 
        //farthest: previous,
        //next: cell // Used to check if a merge is required
        var next      = self.grid.cellContent(positions.next);

        if(next){ //means game over
          alert('game over');
        }
        else{
           self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }*/

        /*
        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;

          // The mighty 2048 tile
         // if (merged.value === 2048) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }*/
     // }

  // Traverse the grid in the right direction and move tiles
 /* traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;

          // The mighty 2048 tile
         // if (merged.value === 2048) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });*/

  if (moved) {
    //this.addRandomTile();
   // alert('yes moved');

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
      alert('game over');
    }

    this.actuate();
  }

};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // up
    1: { x: 1,  y: 0 },  // right
    2: { x: 0,  y: 1 },  // down
    3: { x: -1, y: 0 }   // left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  //for (var pos = 0; pos < this.size; pos++) {
    //console.log(this.size);
    //traversals.x.push(pos);
    //traversals.y.push(pos);
  //}

  // Always traverse from the farthest cell in the chosen direction
  //if (vector.x === 1) traversals.x = traversals.x.reverse();
  //if (vector.y === 1) traversals.y = traversals.y.reverse();
  if(vector.x === 0 && vector.y === -1){
    traversals.x.push(0);
    traversals.y.push(-1);
  }
  if(vector.x === 1 && vector.y === 0){
    traversals.x.push(pos);
    traversals.y.push(pos);
  }
  if(vector.x === 0 && vector.y === 1){
    traversals.x.push(0);
    traversals.y.push(1);
  }
  if(vector.x === -1 && vector.y === 0){
    traversals.x.push(-1);
    traversals.y.push(0);
  }

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};

GameManager.prototype.timer = function () {

  var self = this;
  
  // move
  //this.birdpos += this.birdspd;
  //this.birdpos += 0.00012;
  //console.log("Bird pos:  "+this.birdpos)
  //console.log("Bird spd:  "+this.birdspd)
  //this.birdspd += 0.00015 / (this.birdspd + 0.1);

  //if (this.birdpos > 1 && this.birdspd > 0) this.birdspd = -this.birdspd;
  //if (this.birdpos < -0.25 && this.birdspd < 0) this.birdspd = -this.birdspd;

  this.score += 1 / 64;

  // check

  var steppos = this.score - Math.floor(this.score);

  if (steppos > 5 / 12 && steppos < 11 / 12) {
    var range = {0: [-0.15, 0.3], 1: [0.2, 0.55], 2: [0.45, 0.9]};
    if (this.birdpos < range[this.ab][0] || this.birdpos > range[this.ab][1]) {
      this.score = steppos; // cut down the integer part
    }
  }

  if (steppos == 0) {
    this.ab = this.cd;
    this.cd = Math.floor(Math.random() * 3);
  }


  setTimeout(function () {self.timer();}, 384 / Math.sqrt(this.score + 256));
  this.actuate();
}

GameManager.prototype.jump = function (direction) {

  // 0: up, 1: right, 2:down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var vector     = this.getVector(direction);
  //var traversals = this.buildTraversals(vector);
  var moved      = false;
  
  //this.birdpos = 0.5;
  //this.birdposleft = 0.5;

//console.log("vec")
//console.log(vector)
          if(vector.x == 0 && vector.y == -1){
            //up
            if(this.birdpos < 0.1){
              this.over = true;
            }
            else{
              this.birdpos -= 0.1;
              moved = true;
            }
          }
          else if(vector.x == 1 && vector.y == 0){
            //risht
            if(this.birdposleft > 0.8){
              this.over = true;
            }
            else{
              this.birdposleft += 0.1;
              moved = true;
            }
          }
          else if(vector.x == 0 && vector.y == 1){
            //down
            if(this.birdpos > 0.8){
              this.over = true;
            }
            else{
              this.birdpos += 0.1;
              moved = true;
            }
          }
          else{
            //left
            if(this.birdposleft == 0){
              this.over = true;
            }
            else{
              this.birdposleft -= 0.1;
              moved = true;
            }
          }



  console.log(this.birdpos)
}
