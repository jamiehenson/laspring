---
---

$ ->
  passerby = new Audio('')
  hands = new Audio('')
  audio = ''

  $(".play-button").click ->
    if $(this).hasClass("fa-play") then audio.play() else audio.pause()
    $(this).toggleClass("fa-play fa-pause")

  surfaces = ['arrows', 'carbon', 'cube', 'honeycomb', 'marrakech', 'posh', 'rhombus', 'stars', 'zigzag']

  generateColour = (manual) ->
    colour = '#'
    colour += '0123456789ABCDEF'[Math.floor(Math.random() * 16)] for i in [1..6]
    $(".arcade-header").css("background-color", colour)
    $(".arcade-drawer .drawer-button").css("background-color", colour)

    if manual || $(window).width() > 768
      $(".arcade-drawer").removeClass(surface) for surface in surfaces
      $(".arcade-drawer").addClass(surfaces[Math.floor(Math.random() * surfaces.length)])

  generateColour()

  $(".game-icon").click ->
    $(".game-view").css("display", "flex")
    $(".game-menu").addClass("off")
    $(".play-button").addClass("fa fa-play")
    if $(this).hasClass("game-one")
      $(".game-frame.game-one").css("display", "flex")
      $(".play-message").text("Passerby")
      audio = passerby
    if $(this).hasClass("game-two")
      $(".game-frame.game-two").css("display", "flex")
      $(".play-message").text("Heart & Soul")
      audio = hands

  $(".back").click ->
    game.state.start('menu') for game in Phaser.GAMES
    $(".game-menu").css("display", "flex")
    $(".game-frame").hide()
    $(".game-view").hide()
    $(".game-menu").removeClass("off")
    $(".screen").removeClass("off")
    $(".play-message").text("")
    $(".play-button").removeClass("fa fa-play fa-pause")
    audio.pause()

  $(".colour-shuffle").click ->
    generateColour(true)

  $(".about-link").click ->
    $(".about-view").removeClass("off")
    $(".game-menu").addClass("off")
    $(".game-frame").hide()
    $(".game-view").hide()

  $(".about-back").click ->
    $(".about-view").addClass("off")
    $(".game-menu").removeClass("off")
