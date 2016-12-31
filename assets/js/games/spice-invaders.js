var worldX = 590;
var worldY = 360;
var game = new Phaser.Game(worldX, worldY, Phaser.AUTO, 'spice-invaders');
var imp, filter;

var menuState = {

  preload: function() {
    game.load.image('spice-title', "assets/images/games/spice/spice-title.png");
    game.load.image('button', "assets/images/games/spice/fire.png");
    game.load.image('imp', "assets/images/games/spice/imp.png");
    game.load.image('chili', 'assets/images/games/spice/chili-med.png');
    game.load.script('filter', 'assets/js/games/fire-filter.js');
  },

  create: function() {
    imp = game.add.image(game.world.centerX, game.world.centerY, 'imp')
    var icon = game.add.image(game.world.centerX, game.world.centerY, 'chili');
    var title = game.add.image(game.world.centerX, 10, 'spice-title');
    var desc = game.add.text(game.world.centerX, game.world.height - 10, "It's time to cool down. Tap on the edges to move left and right, and in the middle to fire!",
      {font: "18px Arcade", fill: "white", wordWrap: true, wordWrapWidth: game.world.width, align: "center"}
    );

    imp.anchor.set(0.5);
    title.anchor.set(0.5, 0);
    desc.anchor.set(0.5, 1);
    icon.anchor.set(0.5);

    desc.stroke = 'black';
    desc.strokeThickness = 7;

    background = game.add.sprite(0, 0);
    background.width = 800;
    background.height = 600;

    filter = game.add.filter('Fire', worldX, worldY);
    filter.alpha = 0.0;

    background.filters = [filter];

    game.input.onTap.addOnce(this.start, this);
  },

  update: function() {
    imp.angle += 1;
    filter.update();
  },

  start: function() {
    game.state.start('play');
  }
};

var player, aliens, bullets, bulletTime = 0, cursors, fireButton, explosions, background,
  score = 0, scoreString = '', scoreText, lives, enemyBullet, firingTimer = 0, stateText,
  livingEnemies = [], isLeft, isRight, isFire;

var playState = {
  preload: function() {
    game.load.image('icecream', 'assets/images/games/spice/icecream.png');
    game.load.image('icecream2', 'assets/images/games/spice/icecream2.png');
    game.load.image('cone', 'assets/images/games/spice/cone.png');
    game.load.image('milk', 'assets/images/games/spice/milk.png');
    game.load.image('baby', 'assets/images/games/spice/baby.png');
    game.load.image('enemyBullet', 'assets/images/games/spice/fire.png');
    game.load.image('chili', 'assets/images/games/spice/chili.png', 30, 30);
    game.load.image('burrito', 'assets/images/games/spice/burrito.png', 30, 30);
    game.load.image('taco', 'assets/images/games/spice/taco.png', 30, 30);
    game.load.image('curry', 'assets/images/games/spice/curry.png', 30, 30);
    game.load.image('chicken', 'assets/images/games/spice/chicken.png', 30, 30);
    game.load.image('ship', 'assets/images/games/spice/hand.png');
    game.load.image('background', 'assets/images/games/spice/floor.jpg');
    game.load.image('kaboom', 'assets/images/games/spice/water.png', 128, 128);
  },

  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    background = game.add.tileSprite(0, 0, worldX, worldY, 'background');

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    for (var i = 0; i < 30; i++) {
      bullets.create(0, 0, ['icecream', 'icecream2', 'cone', 'baby', 'milk'][Math.floor(Math.random() * 5)], 0, false);
    }

    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    player = game.add.sprite(worldX/2, worldY - 50, 'ship');
    player.anchor.setTo(0.5, 0.5);
    player.width = 40;
    player.height = 40;
    game.physics.enable(player, Phaser.Physics.ARCADE);

    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    this.createEnemies();

    scoreString = 'Score: ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '20px Arcade', fill: 'yellow' });

    lives = game.add.group();
    game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '20px Arcade', fill: 'yellow' });

    stateText = game.add.text(game.world.centerX, game.world.centerY,' ', { font: '20px Arcade', fill: 'yellow' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    for (var i = 0; i < 3; i++) {
      var ship = lives.create(game.world.width - 100 + (35 * i), 60, 'ship');
      ship.anchor.setTo(0.5, 0.5);
      ship.angle = 90;
      ship.alpha = 0.8;
      ship.width = 35;
      ship.height = 35;
    }

    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(this.setupInvader, this);

    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  },

  createEnemies: function() {
    for (var y = 0; y < 4; y++) {
      for (var x = 0; x < 10; x++) {
        var alien = aliens.create(x * 40, y * 35, ['taco', 'burrito', 'chili', 'curry', 'chicken'][Math.floor(Math.random() * 5)]);
        alien.anchor.setTo(0.5, 0.5);
        alien.width = 25;
        alien.height = 25;
        alien.body.moves = false;
      }
    }

    aliens.x = 20;
    aliens.y = 50;

    var tween = game.add.tween(aliens).to( { x: 210 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    tween.onRepeat.add(this.descend, this);
  },

  setupInvader: function(invader) {
    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');
  },

  descend: function() {
    aliens.y += 10;
  },

  update: function() {
    background.tilePosition.y += 1;

    if (player.alive) {
      player.body.velocity.setTo(0, 0);

      livingEnemies.forEach(function(enemy){
        enemy.angle += 1;
      });

      isLeft = game.input.activePointer.isDown && (game.input.x < game.world.width * 0.25);
      isRight = game.input.activePointer.isDown && (game.input.x > game.world.width * 0.75);
      isFire = game.input.activePointer.isDown && (game.input.x >= game.world.width * 0.25 && game.input.x <= game.world.width * 0.75);

      if (isLeft || cursors.left.isDown) {
        player.body.velocity.x = -200;
      } else if (isRight || cursors.right.isDown) {
        player.body.velocity.x = 200;
      }

      if (isFire || fireButton.isDown) {
        this.fireBullet();
      }

      if (game.time.now > firingTimer) {
        this.enemyFires();
      }

      game.physics.arcade.overlap(bullets, aliens, this.collisionHandler, null, this);
      game.physics.arcade.overlap(enemyBullets, player, this.enemyHitsPlayer, null, this);
    }
  },

  collisionHandler: function(bullet, alien) {
    bullet.kill();
    alien.kill();

    score += 20;
    scoreText.text = scoreString + score;

    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    if (aliens.countLiving() == 0) {
      score += 1000;
      scoreText.text = scoreString + score;

      enemyBullets.callAll('kill',this);
      stateText.text = " Hey hey, you won!\nHave a coffee moment.";
      stateText.visible = true;

      game.input.onTap.addOnce(this.restart, this);
    }
  },

  enemyHitsPlayer: function(player,bullet) {
    bullet.kill();

    live = lives.getFirstAlive();

    if (live) {
      live.kill();
    }

    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);

    if (lives.countLiving() < 1) {
      player.kill();
      enemyBullets.callAll('kill');
      explosion.play('kaboom', 30, false, true);

      stateText.text="Too zingy...\nTap to restart!";
      stateText.visible = true;

      game.input.onTap.addOnce(this.restart,this);
    }
  },

  enemyFires: function() {
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    aliens.forEachAlive(function(alien) {
      livingEnemies.push(alien);
    });

    if (enemyBullet && livingEnemies.length > 0) {
      enemyBullet.width = 35;
      enemyBullet.height = 35;

      var random = game.rnd.integerInRange(0,livingEnemies.length-1);
      var shooter = livingEnemies[random];

      enemyBullet.reset(shooter.body.x, shooter.body.y);

      game.physics.arcade.moveToObject(enemyBullet,player,120);
      firingTimer = game.time.now + 2000;
    }
  },

  fireBullet: function() {
    if (game.time.now > bulletTime) {
      bullet = bullets.getFirstExists(false);
      bullet.width = 35;
      bullet.height = 35;

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

  restart: function() {
    lives.callAll('revive');
    aliens.removeAll();
    game.tweens.removeAll();
    this.createEnemies();

    player.revive();
    stateText.visible = false;
  }
}

game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.start('menu');
