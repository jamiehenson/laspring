---
---

$ ->
  surfaces = ['arrows', 'carbon', 'cube', 'honeycomb', 'marrakech', 'posh', 'rhombus', 'stars', 'zigzag']

  generateColour = ->
    colour = '#'
    colour += '0123456789ABCDEF'[Math.floor(Math.random() * 16)] for i in [1..6]
    $(".arcade-header").css("background-color", colour)
    $(".arcade-drawer a").css("background-color", colour)
    $(".arcade-drawer").removeClass(surface) for surface in surfaces
    $(".arcade-drawer").addClass(surfaces[Math.floor(Math.random() * surfaces.length)])

  generateColour()

  $(".game-icon").click ->
    $(".game-view").css("display", "flex")
    $(".game-menu").addClass("off")
    $(".game-frame.game-one").css("display", "flex") if $(this).hasClass("game-one")
    $(".game-frame.game-two").css("display", "flex") if $(this).hasClass("game-two")
    window.ongoingGame = true;

  $(".back").click ->
    $(".game-menu").css("display", "flex")
    $(".game-frame").hide()
    $(".game-view").hide()
    $(".game-menu").removeClass("off")
    $(".screen").removeClass("off")
    window.ongoingGame = false;

  $(".colour-shuffle").click ->
    generateColour()
