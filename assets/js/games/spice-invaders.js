function SpiceInvaders() {
  var game = new Phaser.Game(worldX, worldY, Phaser.WEBGL, "spice-invaders");
  var imp;
  var menuState = {
    preload: function() {
      game.load.image("spice-title", "assets/images/games/spice/spice-title.png");
      game.load.image("button", "assets/images/games/spice/fire.png");
      game.load.image("imp", "assets/images/games/spice/imp.png");
      game.load.shader("filter", "assets/js/games/fire-filter.frag");
    },

    create: function() {
      filter = new Phaser.Filter(game, null, game.cache.getShader("filter"));
      filter.setResolution(worldX, worldY);

      if (!Phaser.Device.ie) {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.aspectRatio = 1.6;
      }
      game.stage.backgroundColor = "#800000";

      background = game.add.sprite(0, 0);
      background.width = worldX;
      background.height = worldY;

      background.filters = [filter];

      imp = game.add.image(game.world.centerX, game.world.centerY, "imp");
      var title = game.add.image(game.world.centerX, 10, "spice-title");
      var desc = game.add.text(game.world.centerX, game.world.height - 10, "Tap the bottom corners to move, and the top half to fire (or use arrow keys and space).\n\nThat's it.\nGive your screen, a good old tap...",
        { font: "16px ArcadeNormal", fill: "yellow", wordWrap: true, wordWrapWidth: game.world.width, align: "center" }
      );

      imp.anchor.set(0.5);
      imp.width = 200;
      imp.height = 200;
      title.anchor.set(0.5, 0);
      desc.anchor.set(0.5, 1);

      desc.stroke = "black";
      desc.strokeThickness = 7;

      game.input.onTap.addOnce(this.start, this);
    },

    update: function() {
      imp.angle += 1;
      filter.update();
    },

    start: function() {
      game.state.start("play");
    }
  };

  var player, enemies, bullets, spiceBullets, bulletTime = 0, cursors, fireButton, explosions, background,
    score = 0, scoreString = "", scoreText, lives, enemyBullet, firingTimer = 0, stateText,
    livingEnemies = [], isLeft, isRight, isFire, endRect, tweetButton, level = 0, levelString = "",
    levelText, bulletModifier, firingModifier, restartTimerText = "", restartTimerValue = 3;

  var playState = {
    preload: function() {
      game.load.image("ship", "assets/images/games/spice/hand.png");
      game.load.image("background", "assets/images/games/spice/floor.jpg");
      game.load.image("fire", "assets/images/games/spice/fire.png");
      game.load.spritesheet("kaboom", "assets/images/games/spice/kaboom.png", 128, 128);
      game.load.spritesheet("bullet-sheet", "assets/images/games/spice/bullet-sheet.png", 35, 35);
      game.load.spritesheet("spice-sheet", "assets/images/games/spice/spice-sheet.png", 30, 30);
      game.load.image("twit", "assets/images/games/twit-clear.png");
    },

    create: function() {
      game.physics.startSystem(Phaser.Physics.ARCADE);

      background = game.add.tileSprite(0, 0, worldX, worldY, "background");

      bullets = game.add.group();
      bullets.enableBody = true;
      bullets.physicsBodyType = Phaser.Physics.ARCADE;
      bullets.createMultiple(30, "bullet-sheet")

      bullets.setAll("anchor.x", 0.5);
      bullets.setAll("anchor.y", 1);
      bullets.setAll("outOfBoundsKill", true);
      bullets.setAll("checkWorldBounds", true);

      spiceBullets = game.add.group();
      spiceBullets.enableBody = true;
      spiceBullets.physicsBodyType = Phaser.Physics.ARCADE;
      spiceBullets.createMultiple(30, "fire");
      spiceBullets.setAll("anchor.x", 0.5);
      spiceBullets.setAll("anchor.y", 1);
      spiceBullets.setAll("outOfBoundsKill", true);
      spiceBullets.setAll("checkWorldBounds", true);

      player = game.add.sprite(worldX/2, worldY - 50, "ship");
      player.anchor.setTo(0.5, 0.5);
      game.physics.enable(player, Phaser.Physics.ARCADE);

      enemies = game.add.group();
      enemies.enableBody = true;
      enemies.physicsBodyType = Phaser.Physics.ARCADE;

      this.createEnemies();

      scoreString = "Score: ";
      scoreText = game.add.text(10, 10, scoreString + score, { font: "20px ArcadeNormal", fill: "yellow" });

      levelString = "Level: ";
      levelText = game.add.text(10, 35, levelString + (level + 1), { font: "20px ArcadeNormal", fill: "yellow" });

      lives = game.add.group();
      game.add.text(game.world.width - 100, 10, "Lives : ", { font: "20px ArcadeNormal", fill: "yellow" });

      endRect = game.add.graphics(0, 0);
      endRect.beginFill(0xFF0000, 0.5);
      endRect.drawRect(0, 0, game.world.width, game.world.height);
      endRect.visible = false;

      score = 0;
      level = 0;

      stateText = game.add.text(game.world.centerX, game.world.centerY, "",
        { font: "24px ArcadeNormal", fill: "yellow", backgroundColor: "red", wordWrap: true, wordWrapWidth: game.world.width, align: "center" }
      );
      stateText.anchor.set(0.5);
      stateText.visible = false;
      stateText.inputEnabled = true;
      stateText.events.onInputDown.add(this.restart, this);

      tweetButton = game.add.button(game.world.centerX, game.world.height - 60, "twit", function() {
        var link = "https://twitter.com/intent/tweet?text=";
        var tweetString = "I just got " + score + " on Spice Invaders whilst listening to @wearelaspring! bit.ly/PlayLASpring #playlaspring";
        var tweet = encodeURIComponent(tweetString);
        window.open(link + tweet, "_blank");
      }, this);
      tweetButton.anchor.set(0.5);
      tweetButton.hitArea = new Phaser.Rectangle(-50, -50, 100, 100);
      tweetButton.visible = false;

      for (var i = 0; i < 3; i++) {
        var life = lives.create(game.world.width - 100 + (35 * i), 60, "ship");
        life.anchor.setTo(0.5, 0.5);
        life.angle = 90;
        life.alpha = 0.95;
        life.width = 35;
        life.height = 35;
      }

      explosions = game.add.group();
      explosions.createMultiple(30, "kaboom");
      explosions.forEach(this.setupInvader, this);

      cursors = game.input.keyboard.createCursorKeys();
      fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },

    createEnemies: function() {
      for (var y = 0; y < 3; y++) {
        for (var x = 0; x < 9; x++) {
          var enemy = enemies.create(x * 55, y * 45, "spice-sheet");
          enemy.frame = Math.floor(Math.random() * 5);
          enemy.anchor.set(0.5);
          enemy.body.moves = false;
        }
      }

      enemies.x = 20;
      enemies.y = 40;

      var tweenTime = Math.max(2000 - (level * 200), 500);
      var tween = game.add.tween(enemies).to( { x: 125 }, tweenTime, Phaser.Easing.Linear.None, true, 0, 1000, true);

      tween.onRepeat.add(this.descend, this);
    },

    setupInvader: function(invader) {
      invader.anchor.x = 0.5;
      invader.anchor.y = 0.5;
      invader.animations.add("kaboom");
    },

    descend: function() {
      enemies.y += 10;
    },

    update: function() {
      background.tilePosition.y += 1;

      if (player.alive) {
        player.body.velocity.setTo(0, 0);

        livingEnemies.forEach(function(enemy){
          enemy.angle += 1;
        });

        isLeft = game.input.activePointer.isDown && (game.input.x < game.world.width * 0.5) && (game.input.y > game.world.height * 0.5);
        isRight = game.input.activePointer.isDown && (game.input.x >= game.world.width * 0.5) && (game.input.y > game.world.height * 0.5);
        isFire = game.input.activePointer.isDown && (game.input.y <= game.world.height * 0.5);

        if ((isLeft || cursors.left.isDown) && player.body.position.x > 0 ) {
          player.body.velocity.x = -200;
        } else if ((isRight || cursors.right.isDown) && player.body.position.x < game.world.width - player.width) {
          player.body.velocity.x = 200;
        }

        if (isFire || fireButton.isDown) {
          this.fireBullet();
        }

        if (game.time.now > firingTimer) {
          this.enemyFires();
        }

        game.physics.arcade.overlap(bullets, enemies, this.collisionHandler, null, this);
        game.physics.arcade.overlap(spiceBullets, player, this.enemyHitsPlayer, null, this);
      }
    },

    collisionHandler: function(bullet, alien) {
      bullet.kill();
      alien.kill();

      score += 20;
      scoreText.text = scoreString + score;

      var explosion = explosions.getFirstExists(false);
      explosion.reset(alien.body.x, alien.body.y);
      explosion.play("kaboom", 30, false, true);

      if (enemies.countLiving() == 0) {
        spiceBullets.callAll("kill", this);

        var messages = [
          "Hey hey, you won!\nHave yourself a coffee moment.",
          "Oh you're so good!\n\nGive it another stir!",
          "That victory, was a little bit special...\n\nKeep going!",
          "Lovely... simply delightful.\n\nTime for a little more zing...",
          "That skill makes you wanna bounce up and down a little bit...",
        ];

        stateText.text = messages[Math.floor(Math.random() * messages.length)];
        stateText.visible = true;
        endRect.visible = true;
        restartTimerText = game.add.text(game.world.centerX, game.world.height - 80, restartTimerValue, { font: "40px ArcadeNormal", fill: "yellow", backgroundColor: "red" });
        restartTimerText.anchor.set(0.5);
        restartTimerValue -= 1;
        game.time.events.repeat(Phaser.Timer.SECOND * 1, 2, this.restartTimer, this);
        game.time.events.add(Phaser.Timer.SECOND * 3, this.playAgain, this);
      }
    },

    restartTimer: function() {
      restartTimerText.text = restartTimerValue;
      restartTimerValue -= 1;
    },

    enemyHitsPlayer: function(player, bullet) {
      bullet.kill();

      if (lives.getFirstAlive()) {
        lives.getFirstAlive().kill();
      }

      var explosion = explosions.getFirstExists(false);
      explosion.reset(player.body.x, player.body.y);
      explosion.play("kaboom", 30, false, true);

      if (lives.countLiving() < 1) {
        player.kill();
        spiceBullets.callAll("kill");
        explosion.play("kaboom", 30, false, true);

        var messages = [
          "Too hot and spicy. Ah nah bwoii.\n\nTap here to restart",
          "Don't cumin here and waste my thyme.\n\nTap here to show you have the mustard.",
          "Cause of death: Paprika-to-blood ratio over 200%\n\nTap here to cleanse",
          "The journey of a thousand meals starts with a single spice.\n\nTap forth here, my friend",
          "No Ainz, no gainz.\n\nTap here to make the great man proud."
        ];

        stateText.text = messages[Math.floor(Math.random() * messages.length)];
        stateText.visible = true;
        endRect.visible = true;
        tweetButton.visible = true;
      }
    },

    enemyFires: function() {
      enemyBullet = spiceBullets.getFirstExists(false);

      livingEnemies.length = 0;

      enemies.forEachAlive(function(alien) {
        livingEnemies.push(alien);
      });

      if (enemyBullet && livingEnemies.length > 0) {
        var random = game.rnd.integerInRange(0,livingEnemies.length - 1);
        var shooter = livingEnemies[random];

        enemyBullet.reset(shooter.body.x, shooter.body.y);
        enemyBullet.body.allowRotation = false;
        bulletModifier = (Math.random() * 40) + 125 + (level * 25);
        firingModifier = Math.max((Math.random() * 2000) + 1000 - (level * 100), 500);
        enemyBullet.rotation = game.physics.arcade.moveToObject(enemyBullet, player, bulletModifier) - 90;
        firingTimer = game.time.now + firingModifier;
      }
    },

    fireBullet: function() {
      if (game.time.now > bulletTime) {
        var bullet = bullets.getFirstExists(false);
        bullet.frame = Math.floor(Math.random() * 6);

        if (bullet) {
          bullet.reset(player.x, player.y + 8);
          bullet.body.velocity.y = -400;
          bulletTime = game.time.now + 200;
        }
      }
    },

    resetBullet: function(bullet) {
      bullet.kill();
    },

    playAgain: function() {
      stateText.visible = false;
      endRect.visible = false;
      tweetButton.visible = false;
      restartTimerText.visible = false;
      restartTimerValue = 3;
      game.tweens.removeAll();
      level += 1;
      levelText.text = levelString + (level + 1);
      bulletModifier = (Math.random() * 40) + 125 + (level * 25);
      firingModifier = (Math.random() * 2000) + 1000 + (level * 400);
      this.createEnemies();
    },

    restart: function() {
      if (lives.countLiving() < 1) {
        lives.callAll("revive");
        enemies.removeAll();
        game.tweens.removeAll();
        this.createEnemies();
        score = 0;
        scoreText.text = scoreString + score;
        level = 0;
        levelText.text = levelString + (level + 1);
        bulletModifier = (Math.random() * 40) + 125 + (level * 25);
        firingModifier = (Math.random() * 2000) + 1000 + (level * 400);

        player.revive();
        stateText.visible = false;
        endRect.visible = false;
        tweetButton.visible = false;
        restartTimerText.visible = false;
      }
    }
  };

  game.state.add("menu", menuState);
  game.state.add("play", playState);
  game.state.start("menu");
}