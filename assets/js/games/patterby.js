function Patterby() {
  var game = new Phaser.Game(worldX, worldY, Phaser.AUTO, "patterby");
  var catIcon, pMenuFilter, gameFilter, pMenuTimer = 0, pMenuFlashText;

  var menuState = {
    preload: function() {
      game.load.image("pat-title", "assets/images/games/pat/pat-title.png");
      game.load.spritesheet("cat-sheet", "assets/images/games/pat/cat-sheet.png", 128, 128);
      game.load.script("filter", "assets/js/games/retro-filter.js");
    },

    create: function() {
      background = game.add.sprite(0, 0);
      background.width = worldX;
      background.height = worldY;

      if (!Phaser.Device.ie) {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.aspectRatio = 1.6;
      }

      pMenuFilter = game.add.filter("Retro", worldX, worldY);

      background.filters = [pMenuFilter];

      var icon = game.add.sprite(game.world.centerX, game.world.centerY, "cat-sheet")
      var title = game.add.image(game.world.centerX, 10, "pat-title");
      var desc = game.add.text(game.world.centerX, game.world.height - 10, "Pat as many pets as you can within the time, but only pat the right ones - some bite!",
        {font: "18px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: game.world.width, align: "center", backgroundColor: "#0000FF", padding: 10 }
      );
      desc.lineSpacing = 5;
      pMenuFlashText = game.add.text(game.world.centerX, game.world.centerY, "TAP TO      START!",
        {font: "30px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: game.world.width, align: "center"}
      );

      game.add.tween(icon.scale).to({x: 1.25, y: 1.25}, 3000, Phaser.Easing.Linear.None, true, 0, 1000, true);

      icon.animations.add("loop");
      icon.animations.play("loop", 2, true);
      icon.anchor.set(0.5);
      title.anchor.set(0.5, 0);
      desc.anchor.set(0.5, 1);
      pMenuFlashText.anchor.set(0.5);

      game.input.onTap.addOnce(this.start, this);
    },

    update: function() {
      pMenuTimer += game.time.elapsed;
      if ( pMenuTimer >= 1000 ) {
        pMenuTimer -= 1000;
        pMenuFlashText.visible = !pMenuFlashText.visible;
      }
      pMenuFilter.update();
    },

    start: function() {
      game.state.start("play");
    }
  };

  var unusedPets, activePets, goodPets, badPets, zones, goodCount, badCount,
    score = 0, scoreText = "", timer, timeLeft, timeText = "", circles,
    animals = [];

  var playState = {
    preload: function() {
      game.load.spritesheet("animal-sheet", "assets/images/games/pat/animals.png", 80, 80);
      game.load.shader("gameFilter", "assets/js/games/swirl-filter.frag");
      game.load.image("twit", "assets/images/games/twit.png");
      game.time.advancedTiming = true;
    },

    create: function() {
      gameFilter = new Phaser.Filter(game, null, game.cache.getShader("gameFilter"));
      gameFilter.setResolution(worldX, worldY);
      background = game.add.sprite(0, 0);
      background.width = worldX;
      background.height = worldY;

      background.filters = [gameFilter];

      var ui = game.add.graphics(0, 0);

      ui.lineStyle(2, 0x00FFFF, 1);
      ui.beginFill(0x0000FF, 1)
      ui.drawRect(0, 0, 150, game.world.height);

      ui.beginFill(0x008000, 1)
      ui.drawRect(150, 0, game.world.width, 40);
      ui.alpha = 0.75;

      score = 0;
      timeLeft = 60;
      timeText = game.add.text(160, 10, "Time: " + timeLeft,
        {font: "18px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: game.world.width, align: "right"}
      );
      scoreText = game.add.text(game.world.width - 10, 10, "Score: " + score,
        {font: "18px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: game.world.width, align: "right"}
      );

      scoreText.anchor.set(1, 0);

      this.generatePets();

      timer = game.time.events.loop(Phaser.Timer.SECOND, this.updateTimer, this);
    },

    updateTimer: function() {
      if (timeLeft <= 1) {
        this.endGame();
      } else {
        timeLeft -= 1;
        timeText.text = "Time: " + timeLeft;
      }
      timeText.addColor("#FFFFFF", 0);
      scoreText.addColor("#FFFFFF", 0);
    },

    generateCircles: function() {
      circles = game.add.graphics(0, 0);

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

      var pet = game.add.text(10, 10, "PAT!",
        {font: "18px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: game.world.width, align: "center"}
      );
      var avoid = game.add.text(10, game.world.height / 2, "AVOID!",
        {font: "18px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: game.world.width, align: "center"}
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
          var animal = game.add.sprite((i * 130) + 240, (j * 110) + 95, "animal-sheet");
          var chosenFrame = Math.floor(Math.random() * activePets.length);
          animal.frame = activePets[chosenFrame];
          animal.anchor.set(0.5);
          animal.inputEnabled = true;
          animal.key = activePets[chosenFrame];
          animal.hitArea = new Phaser.Rectangle(-80, -80, 100, 100);
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
        scoreText.addColor("#00FF00", 0);
      } else {
        timeLeft -= 4;
        badCount -= 1;
        timeText.addColor("#FF0000", 0);
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
          var animal = game.add.sprite((i * 69) + xmod, (j * 69) + ymod, "animal-sheet")
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
      gameFilter.update();
    },

    endGame: function(){
      game.world.removeAll();
      game.stage.backgroundColor = "#0000FF";
      game.time.events.remove(timer);

      var randomiser = Math.floor(Math.random() * 18);
      for (var j = 0; j < 4; j++) {
        for (var i = 0; i < 5; i++) {
          var width = game.world.width / 5;
          var height = game.world.height / 4;
          var icon = game.add.sprite(width * i, height * j, "animal-sheet");
          icon.frame = ((j * 5) + i + randomiser) % 18;
          icon.width = width;
          icon.height = height;
        }
      }

      var rect = game.add.graphics(0, 0);
      rect.beginFill(0x00FFFF, 0.6);
      rect.drawRect(0, 0, game.world.width, game.world.height);

      var pluralisedCritter = score != 50 ? "critters" : "critter";
      var pluralisedPet = score != 50 ? "pets" : "pet";
      var endText = game.add.text(game.world.centerX, 10, "You got " + score + " points!\n\nThat's " + parseInt(score / 50) + " " + pluralisedCritter + " who felt the love.",
        { font: "32px ArcadeNormal", fill: "white", wordWrap: true, wordWrapWidth: game.world.width, align: "center", backgroundColor: "#0000FF" }
      );
      var endSubText = game.add.text(game.world.centerX, game.world.height - 10, "Tap here to go again!",
        { font: "26px ArcadeNormal", fill: "white", wordWrap: true, backgroundColor: "blue", wordWrapWidth: game.world.width / 1.5, align: "center" }
      );

      var tweetButton = game.add.button(game.world.centerX, game.world.height - 110, "twit", function() {
        var link = "https://twitter.com/intent/tweet?text=";
        var tweetString = "I just patted " + parseInt(score / 50) + " " + pluralisedPet + " on Patterby whilst listening to @wearelaspring! bit.ly/PlayLASpring #playlaspring";
        var tweet = encodeURIComponent(tweetString);
        window.open(link + tweet, "_blank");
      }, this);

      endText.anchor.set(0.5, 0);
      endSubText.anchor.set(0.5, 1);
      endSubText.inputEnabled = true;
      tweetButton.anchor.set(0.5);
      tweetButton.hitArea = new Phaser.Rectangle(-40, -40, 80, 80);
      endSubText.events.onInputDown.add(this.restart, this);
    },

    restart: function() {
      game.state.start(game.state.current);
    }
  };

  game.state.add("menu", menuState);
  game.state.add("play", playState);
  game.state.start("menu");
}
