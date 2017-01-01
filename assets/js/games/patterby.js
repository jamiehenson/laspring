var pGame = new Phaser.Game(worldX, worldY, Phaser.AUTO, 'patterby');
var catIcon, pMenuFilter, pGameFilter;

var menuState = {
  preload: function() {
    pGame.load.image('pat-title', 'assets/images/games/pat/pat-title.png');
    pGame.load.spritesheet('cat-sheet', 'assets/images/games/pat/cat-sheet.png', 128, 128);
    pGame.load.script('filter', 'assets/js/games/retro-filter.js');
  },

  create: function() {
    background = pGame.add.sprite(0, 0);
    background.width = worldX;
    background.height = worldY;

    pMenuFilter = pGame.add.filter('Retro', worldX, worldY);

    background.filters = [pMenuFilter];

    var icon = pGame.add.sprite(pGame.world.centerX, pGame.world.centerY, 'cat-sheet')
    var title = pGame.add.image(pGame.world.centerX, 10, 'pat-title');
    var desc = pGame.add.text(pGame.world.centerX, pGame.world.height - 10, "Pat as many pets as you can within the time, but only pat the right ones - some bite!",
      {font: "18px Arcade", fill: "white", wordWrap: true, wordWrapWidth: pGame.world.width, align: "center"}
    );

    pGame.add.tween(icon.scale).to({x: 1.25, y: 1.25}, 3000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    icon.animations.add('loop');
    icon.animations.play('loop', 2, true);
    icon.anchor.set(0.5);
    title.anchor.set(0.5, 0);
    desc.anchor.set(0.5, 1);
  },

  update: function() {
    pMenuFilter.update();
  }
};

var unusedPets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
var activePets = [];
var goodPets = [];
var badPets = [];
var zones = [];
var score = 0;
var scoreText = "";
var endTime;
var timeLeft = 30000;
var timeText = "";

var playState = {
  preload: function() {
    pGame.load.spritesheet('animal-sheet', 'assets/images/games/pat/animal-sheet.png', 128, 128);
    pGame.load.shader('pGameFilter', 'assets/js/games/swirl-filter.frag');
    pGame.time.advancedTiming = true;
  },

  create: function() {
    pGameFilter = new Phaser.Filter(pGame, null, pGame.cache.getShader('pGameFilter'));
    pGameFilter.setResolution(worldX, worldY);
    background = pGame.add.sprite(0, 0);
    background.width = worldX;
    background.height = worldY;

    background.filters = [pGameFilter];

    var ui = pGame.add.graphics(0, 0);

    ui.lineStyle(2, 0x00FFFF, 1);
    ui.beginFill(0x0000FF, 1)
    ui.drawRect(0, 0, 150, pGame.world.height);

    ui.beginFill(0x008000, 1)
    ui.drawRect(150, 0, pGame.world.width, 40);
    ui.alpha = 0.75;

    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var bgColour = "0x";
        bgColour += Math.random().toString(16).slice(2, 8).toUpperCase();
        ui.beginFill(bgColour, 1);
        ui.drawCircle((130 * i) + 240, (100 * j) + 100, 90);
      }
    }

    timeText = pGame.add.text(160, 10, "Time: " + (timeLeft / 1000),
      {font: "18px Arcade", fill: "white", wordWrap: true, wordWrapWidth: pGame.world.width, align: "right"}
    );
    scoreText = pGame.add.text(pGame.world.width - 10, 10, "Score: " + score,
      {font: "18px Arcade", fill: "white", wordWrap: true, wordWrapWidth: pGame.world.width, align: "right"}
    );

    scoreText.anchor.set(1, 0);

    this.generatePets();

    endTime = pGame.time.now + 30000;
  },

  generatePets: function(){
    var pet = pGame.add.text(10, 10, "PAT!",
      {font: "18px Arcade", fill: "white", wordWrap: true, wordWrapWidth: pGame.world.width, align: "center"}
    );
    var avoid = pGame.add.text(10, pGame.world.height / 2, "AVOID!",
      {font: "18px Arcade", fill: "white", wordWrap: true, wordWrapWidth: pGame.world.width, align: "center"}
    );

    this.animalGenerationLoop(10, 40, true);
    this.animalGenerationLoop(10, 210, false);
    this.drawPets();
  },

  drawPets: function() {
    for (var j = 0; j < 3; j++) {
      for (var i = 0; i < 3; i++) {
        var animal = pGame.add.sprite((i * 130) + 240, (j * 100) + 100, 'animal-sheet')
        var chosenFrame = Math.floor(Math.random() * activePets.length);
        animal.frame = activePets[chosenFrame];
        animal.width = 70;
        animal.height = 70;
        animal.anchor.set(0.5);
        animal.inputEnabled = true;
        animal.input.userHandCursor = true;
        animal.key = activePets[chosenFrame]
        animal.events.onInputDown.add(this.animalPressed, this);
        zones.push(animal);
      }
    }
  },

  animalPressed: function(animal) {
    if (goodPets.indexOf(animal.key) != -1) {
      score += 50;
    } else {
      endTime -= 1000;
    }
    scoreText.text = "Score: " + score;
  },

  animalGenerationLoop: function(xmod, ymod, good) {
    for (var j = 0; j < 2; j++) {
      for (var i = 0; i < 2; i++) {
        var animal = pGame.add.sprite((i * 69) + xmod, (j * 69) + ymod, 'animal-sheet')
        var chosenFrame = Math.floor(Math.random() * unusedPets.length);
        animal.frame = unusedPets[chosenFrame];
        animal.width = 64;
        animal.height = 64;
        activePets.push(unusedPets[chosenFrame]);
        if (good) {
          goodPets.push(unusedPets[chosenFrame])
        } else {
          badPets.push(unusedPets[chosenFrame]);
        }
        unusedPets.splice(chosenFrame, 1);
      }
    }
  },

  update: function(){
    pGameFilter.update();
    if (timeLeft <= 0) {
      this.endGame();
      timeText.text = "Time: 0";
    } else {
      timeLeft = endTime - pGame.time.now;
      timeText.text = "Time: " + parseInt(timeLeft / 1000);
    }
  },

  restart: function() {
  },

  endGame: function(){
    console.log("over");
  }
}

pGame.state.add('menu', menuState);
pGame.state.add('play', playState);
pGame.state.start('play');
