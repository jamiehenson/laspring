var pGame = new Phaser.Game(worldX, worldY, Phaser.AUTO, 'patterby');
var catIcon, pMenuFilter, pGameFilter, pMenuTimer = 0, pMenuFlashText;

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

    pGame.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    pGame.scale.aspectRatio = 1.6;

    pMenuFilter = pGame.add.filter('Retro', worldX, worldY);

    background.filters = [pMenuFilter];

    var icon = pGame.add.sprite(pGame.world.centerX, pGame.world.centerY, 'cat-sheet')
    var title = pGame.add.image(pGame.world.centerX, 10, 'pat-title');
    var desc = pGame.add.text(pGame.world.centerX, pGame.world.height - 10, "Pat as many pets as you can within the time, but only pat the right ones - some bite!",
      {font: "18px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: pGame.world.width, align: "center", backgroundColor: "#0000FF", padding: 10 }
    );
    desc.lineSpacing = 5;
    pMenuFlashText = pGame.add.text(pGame.world.centerX, pGame.world.centerY, "TAP TO      START!",
      {font: "30px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: pGame.world.width, align: "center"}
    );

    pGame.add.tween(icon.scale).to({x: 1.25, y: 1.25}, 3000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    icon.animations.add('loop');
    icon.animations.play('loop', 2, true);
    icon.anchor.set(0.5);
    title.anchor.set(0.5, 0);
    desc.anchor.set(0.5, 1);
    pMenuFlashText.anchor.set(0.5);

    pGame.input.onTap.addOnce(this.start, this);
  },

  update: function() {
    pMenuTimer += pGame.time.elapsed;
    if ( pMenuTimer >= 1000 ) {
      pMenuTimer -= 1000;
      pMenuFlashText.visible = !pMenuFlashText.visible;
    }
    pMenuFilter.update();
  },

  start: function() {
    pGame.state.start('play');
  }
};

var unusedPets, activePets, goodPets, badPets, zones, goodCount, badCount,
  score = 0, scoreText = "", endTime, timeLeft, timeText = "", circles,
  animals = [], endGameCondition = false;

var playState = {
  preload: function() {
    pGame.load.spritesheet('animal-sheet', 'assets/images/games/pat/animals.png', 80, 80);
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

    timeText = pGame.add.text(160, 10, "Time: " + (timeLeft / 1000),
      {font: "18px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: pGame.world.width, align: "right"}
    );
    scoreText = pGame.add.text(pGame.world.width - 10, 10, "Score: " + score,
      {font: "18px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: pGame.world.width, align: "right"}
    );
    timeLeft = 60000;

    scoreText.anchor.set(1, 0);

    this.generatePets();

    endTime = pGame.time.now + timeLeft;
  },

  generateCircles: function() {
    circles = pGame.add.graphics(0, 0);

    for (var j = 0; j < 3; j++) {
      for (var i = 0; i < 3; i++) {
        var bgColour = "0x";
        bgColour += Math.random().toString(16).slice(2, 8).toUpperCase();
        circles.lineStyle(2, 0xFFFF00, 1);
        circles.beginFill(bgColour, 1);
        circles.drawCircle((130 * i) + 240, (110 * j) + 95, 100);
      }
    }
  },

  generatePets: function(){
    this.resetAnimalArrays();
    this.generateCircles();

    var pet = pGame.add.text(10, 10, "PAT!",
      {font: "18px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: pGame.world.width, align: "center"}
    );
    var avoid = pGame.add.text(10, pGame.world.height / 2, "AVOID!",
      {font: "18px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: pGame.world.width, align: "center"}
    );

    this.animalGenerationLoop(10, 40, true);
    this.animalGenerationLoop(10, 210, false);
    this.drawPets();
  },

  resetAnimalArrays: function() {
    unusedPets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    activePets = [];
    goodPets = [];
    badPets = [];
    goodCount = 0;
    badCount = 0;
    zones = 9;
  },

  drawPets: function() {
    for (var j = 0; j < 3; j++) {
      for (var i = 0; i < 3; i++) {
        var animal = pGame.add.sprite((i * 130) + 240, (j * 110) + 95, 'animal-sheet')
        var chosenFrame = Math.floor(Math.random() * activePets.length);
        animal.frame = activePets[chosenFrame];
        animal.anchor.set(0.5);
        animal.inputEnabled = true;
        animal.input.userHandCursor = true;
        animal.key = activePets[chosenFrame]
        animal.events.onInputDown.add(this.animalPressed, this);
        if (goodPets.indexOf(animal.key) != -1) {
          goodCount += 1;
        }
        if (badPets.indexOf(animal.key) != -1) {
          badCount += 1;
        }
        animals.push(animal);
      }
    }
  },

  animalPressed: function(animal) {
    if (goodPets.indexOf(animal.key) != -1) {
      score += 50;
      goodCount -= 1;
    } else {
      endTime -= 5000;
      badCount -= 1;
    }

    zones -= 1;

    animal.destroy();
    scoreText.text = "Score: " + score;

    if (goodCount <= 0 || zones <= 0) {
      animals.forEach( function(animal) {
        animal.destroy();
      });
      this.generatePets();
    }
  },

  animalGenerationLoop: function(xmod, ymod, good) {
    for (var j = 0; j < 2; j++) {
      for (var i = 0; i < 2; i++) {
        var animal = pGame.add.sprite((i * 69) + xmod, (j * 69) + ymod, 'animal-sheet')
        var chosenFrame = Math.floor(Math.random() * unusedPets.length);
        animal.frame = unusedPets[chosenFrame];
        animal.width = 64;
        animal.height = 64;
        animals.push(animal);
        activePets.push(unusedPets[chosenFrame]);
        if (good) {
          goodPets.push(unusedPets[chosenFrame]);
        } else {
          badPets.push(unusedPets[chosenFrame]);
        }
        unusedPets.splice(chosenFrame, 1);
      }
    }
  },

  update: function(){
    pGameFilter.update();
    if (timeLeft <= 0 && endGameCondition == false) {
      this.endGame();
      timeText.text = "Time: 0";
      endGameCondition = true;
    } else {
      timeLeft = endTime - pGame.time.now;
      timeText.text = "Time: " + parseInt(timeLeft / 1000);
    }
  },

  endGame: function(){
    var rect = pGame.add.graphics(0, 0);
    rect.beginFill(0x00FFFF, 0.6);
    rect.drawRect(0, 0, pGame.world.width, pGame.world.height);

    var endText = pGame.add.text(pGame.world.centerX, 10, "You got " + score + " points!\n\nThat's " + score / 50 + " critters who felt the love.",
      {font: "32px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: pGame.world.width, align: "center", backgroundColor: "#0000FF"}
    );
    var endSubText = pGame.add.text(pGame.world.centerX, pGame.world.height - 10, "Tap here to go again!",
      {font: "26px ArcadeNormal", fill: "white", wordWrap: true, backgroundColor: "blue", wordWrapWidth: pGame.world.width / 1.5, align: "center", backgroundColor: "#0000FF"}
    );
    endText.anchor.set(0.5, 0);
    endSubText.anchor.set(0.5, 1);
    endSubText.inputEnabled = true;
    endSubText.events.onInputDown.add(this.restart, this);
  },

  restart: function() {
    endGameCondition = false;
    pGame.state.start(pGame.state.current);
  }
}

pGame.state.add('menu', menuState);
pGame.state.add('play', playState);
pGame.state.start('menu');
