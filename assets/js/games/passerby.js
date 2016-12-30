var worldX = 500;
var worldY = 360;
var game = new Phaser.Game(worldX, worldY, Phaser.AUTO, 'pass-er-by', { preload: preload, create: create, update: update, render: render });

function preload() {
  game.load.image('bullet', 'assets/images/games/spice/icecream.png');
  game.load.image('enemyBullet', 'assets/images/games/spice/fire.png');
  game.load.image('invader', 'assets/images/games/spice/chili.png', 30, 30);
  game.load.image('ship', 'assets/images/games/spice/hand.png');
  game.load.image('background', 'assets/images/games/spice/floor.jpg');
  game.load.image('kaboom', 'assets/images/games/spice/water.png', 128, 128);
  game.load.bitmapFont('arcade', 'assets/fonts/arcade.png');
}

var player;
var aliens;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var background;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var enemyBullet;
var firingTimer = 0;
var stateText;
var livingEnemies = [];

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);

  //  The scrolling background background
  background = game.add.tileSprite(0, 0, worldX, worldY, 'background');

  //  Our bullet group
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(30, 'bullet');
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 1);
  bullets.setAll('outOfBoundsKill', true);
  bullets.setAll('checkWorldBounds', true);

  // The enemy's bullets
  enemyBullets = game.add.group();
  enemyBullets.enableBody = true;
  enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
  enemyBullets.createMultiple(30, 'enemyBullet');
  enemyBullets.setAll('anchor.x', 0.5);
  enemyBullets.setAll('anchor.y', 1);
  enemyBullets.setAll('outOfBoundsKill', true);
  enemyBullets.setAll('checkWorldBounds', true);

  //  The hero!
  player = game.add.sprite(worldX/2, worldY - 50, 'ship');
  player.anchor.setTo(0.5, 0.5);
  player.width = 40;
  player.height = 40;
  game.physics.enable(player, Phaser.Physics.ARCADE);

  //  The baddies!
  aliens = game.add.group();
  aliens.enableBody = true;
  aliens.physicsBodyType = Phaser.Physics.ARCADE;

  createAliens();

  //  The score
  scoreString = 'Score : ';
  scoreText = game.add.text(10, 10, scoreString + score, { font: '20px arcade', fill: 'yellow' });

  //  Lives
  lives = game.add.group();
  game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '20px arcade', fill: 'yellow' });

  //  Text
  stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '20px arcade', fill: 'yellow' });
  stateText.anchor.setTo(0.5, 0.5);
  stateText.visible = false;

  for (var i = 0; i < 3; i++)
  {
      var ship = lives.create(game.world.width - 100 + (35 * i), 60, 'ship');
      ship.anchor.setTo(0.5, 0.5);
      ship.angle = 90;
      ship.alpha = 0.8;
      ship.width = 35;
      ship.height = 35;
  }

  //  An explosion pool
  explosions = game.add.group();
  explosions.createMultiple(30, 'kaboom');
  explosions.forEach(setupInvader, this);

  //  And some controls to play the game with
  cursors = game.input.keyboard.createCursorKeys();
  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function createAliens () {
  for (var y = 0; y < 4; y++)
  {
      for (var x = 0; x < 10; x++)
      {
          var alien = aliens.create(x * 40, y * 35, 'invader');
          alien.anchor.setTo(0.5, 0.5);
          alien.width = 25;
          alien.height = 25;
          alien.body.moves = false;
      }
  }

  aliens.x = 10;
  aliens.y = 50;

  //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
  var tween = game.add.tween(aliens).to( { x: 160 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

  //  When the tween loops it calls descend
  tween.onLoop.add(descend, this);
}

function setupInvader (invader) {
  invader.anchor.x = 0.5;
  invader.anchor.y = 0.5;
  invader.animations.add('kaboom');
}

function descend() {
  aliens.y += 10;
}

function update() {
  //  Scroll the background
  background.tilePosition.y += 1;

  if (player.alive)
  {
      //  Reset the player, then check for movement keys
      player.body.velocity.setTo(0, 0);

      if (cursors.left.isDown)
      {
          player.body.velocity.x = -200;
      }
      else if (cursors.right.isDown)
      {
          player.body.velocity.x = 200;
      }

      //  Firing?
      if (fireButton.isDown)
      {
          fireBullet();
      }

      if (game.time.now > firingTimer)
      {
          enemyFires();
      }

      //  Run collision
      game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
      game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
  }
}

function render() {
    game.debug.body('ship');
}

function collisionHandler (bullet, alien) {
  //  When a bullet hits an alien we kill them both
  bullet.kill();
  alien.kill();

  //  Increase the score
  score += 20;
  scoreText.text = scoreString + score;

  //  And create an explosion :)
  var explosion = explosions.getFirstExists(false);
  explosion.reset(alien.body.x, alien.body.y);
  explosion.play('kaboom', 30, false, true);

  if (aliens.countLiving() == 0)
  {
      score += 1000;
      scoreText.text = scoreString + score;

      enemyBullets.callAll('kill',this);
      stateText.text = " Hey hey, you won!\nHave a coffee moment.";
      stateText.visible = true;

      //the "click to restart" handler
      game.input.onTap.addOnce(restart,this);
  }
}

function enemyHitsPlayer (player,bullet) {
  bullet.kill();

  live = lives.getFirstAlive();

  if (live)
  {
      live.kill();
  }

  //  And create an explosion :)
  var explosion = explosions.getFirstExists(false);
  explosion.reset(player.body.x, player.body.y);
  explosion.play('kaboom', 30, false, true);

  // When the player dies
  if (lives.countLiving() < 1)
  {
      player.kill();
      enemyBullets.callAll('kill');
      explosion.play('kaboom', 30, false, true);

      stateText.text="Too zingy...\nTap to restart!";
      stateText.visible = true;

      //the "click to restart" handler
      game.input.onTap.addOnce(restart,this);
  }
}

function enemyFires () {
  //  Grab the first bullet we can from the pool
  enemyBullet = enemyBullets.getFirstExists(false);

  livingEnemies.length=0;

  aliens.forEachAlive(function(alien){

      // put every living enemy in an array
      livingEnemies.push(alien);
  });

  if (enemyBullet && livingEnemies.length > 0)
  {
      enemyBullet.width = 35;
      enemyBullet.height = 35;

      var random=game.rnd.integerInRange(0,livingEnemies.length-1);

      // randomly select one of them
      var shooter=livingEnemies[random];
      // And fire the bullet from this enemy
      enemyBullet.reset(shooter.body.x, shooter.body.y);

      game.physics.arcade.moveToObject(enemyBullet,player,120);
      firingTimer = game.time.now + 2000;
  }
}

function fireBullet () {
  //  To avoid them being allowed to fire too fast we set a time limit
  if (game.time.now > bulletTime)
  {
      //  Grab the first bullet we can from the pool
      bullet = bullets.getFirstExists(false);
      bullet.width = 35;
      bullet.height = 35;

      if (bullet)
      {
          //  And fire it
          bullet.reset(player.x, player.y + 8);
          bullet.body.velocity.y = -400;
          bulletTime = game.time.now + 200;
      }
  }
}

function resetBullet (bullet) {
  //  Called if the bullet goes out of the screen
  bullet.kill();
}

function restart () {
  //  A new level starts

  //resets the life count
  lives.callAll('revive');
  //  And brings the aliens back from the dead :)
  aliens.removeAll();
  createAliens();

  //revives the player
  player.revive();
  //hides the text
  stateText.visible = false;
}