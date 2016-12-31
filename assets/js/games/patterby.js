var pGame = new Phaser.Game(worldX, worldY, Phaser.AUTO, 'patterby');
var catIcon, pFilter;

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

    pFilter = pGame.add.filter('Retro', worldX, worldY);

    background.filters = [pFilter];

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
    pFilter.update();
  }
};

pGame.state.add('menu', menuState);
pGame.state.start('menu');
