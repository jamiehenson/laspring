$ ->
  color = '#'
  color += '0123456789ABCDEF'[Math.floor(Math.random() * 16)] for i in [1..6]
  surfaces = ['carbon', 'cube', 'posh', 'rhombus', 'stars', 'zigzag']

  $(".arcade-header").css("background-color", color)
  $(".arcade-drawer a").css("background-color", color)
  $(".arcade-drawer").addClass(surfaces[Math.floor(Math.random() * surfaces.length)])

  $(".game-icon").click ->
    $(".game-view").css("display", "flex")
    $(".game-menu").addClass("off")
    $(".game-frame.game-one").css("display", "flex") if $(this).hasClass("game-one")
    $(".game-frame.game-two").css("display", "flex") if $(this).hasClass("game-two")

  $(".back").click ->
    $(".game-menu").css("display", "flex")
    $(".game-frame").hide()
    $(".game-view").hide()
    $(".game-menu").removeClass("off")
    $(".screen").removeClass("off")