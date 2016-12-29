---
---

$ ->
  $(".game-icon").click ->
    $(".game-view").css("display", "flex")
    $(".game-menu").hide()
    $(".game-frame.game-one").show() if $(this).hasClass("game-one")
    $(".game-frame.game-two").show() if $(this).hasClass("game-two")
    $(".game-frame.game-three").show() if $(this).hasClass("game-three")
    $(".game-frame.game-four").show() if $(this).hasClass("game-four")
    $(".game-frame.game-five").show() if $(this).hasClass("game-five")
    $(".game-frame.game-six").show() if $(this).hasClass("game-six")

  $(".back").click ->
    $(".game-menu").css("display", "flex")
    $(".game-frame").hide()
    $(".game-view").hide()