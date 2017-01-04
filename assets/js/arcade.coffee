---
---

$ ->
  audio = ''
  codes = [
    'mayo', 'pupper', 'bosco', 'cashflow', 'submithub'
    'snapes', 'trendell', 'radio1', 'billington', 'may',
    'george', 'robkhan', 'harison', 'dayalan', 'itb',
    'uta', 'primary', 'coda', 'koorifm', 'kiss',
    'fox', 'gold', 'krck', '6music', 'premier',
    'rogers', 'brewers', 'penty', 'tones', 'bates'
  ]

  $(".arcade-player").click ->
    if audio != ''
      if $(".play-button").hasClass("fa-volume-off") then audio.play() else audio.pause()
      $(this).toggleClass("playing paused")
      $(".play-button").toggleClass("fa-volume-off fa-volume-up")

  surfaces = ['arrows', 'carbon', 'cube', 'honeycomb', 'marrakech', 'posh', 'rhombus', 'stars', 'zigzag']

  generateColour = (manual) ->
    colour = '#'
    colour += '0123456789ABCDEF'[Math.floor(Math.random() * 16)] for i in [1..6]
    $(".arcade-header").css("background-color", colour)
    $(".arcade-drawer .drawer-button").css("background-color", colour)

    if manual || $(window).width() > 768
      $(".arcade-drawer").removeClass(surface) for surface in surfaces
      $(".arcade-drawer").addClass(surfaces[Math.floor(Math.random() * surfaces.length)])

  generalGameLoadStuff = ->
    $(".game-view").css("display", "flex")
    $(".game-menu").addClass("off")
    $(".play-button").addClass("fa fa-volume-up")
    $(".arcade-player").addClass("on").addClass("playing")
    $(".game-auth-input").val("")

  resetAudio = ->
    if typeof(audio) == 'object'
      audio.pause()
      audio.currentTime = 0
      audio.setAttribute('src', '')
      audio.load();
      audio = ''

  determineIE = ->
    agent = window.navigator.userAgent
    return (agent.indexOf('MSIE') > 0 || ! !agent.match(/Trident\/7\./))

  generateColour()

  $(".game-icon-content").click ->
    if $(this).parent().hasClass("game-one")
      generalGameLoadStuff()
      $(".game-frame.game-one").css("display", "flex")
      $(".play-message").text("Passerby")
      audio = new Audio('assets/tunes/passerby64.m4a')
      audio.play()
    if $(this).parent().hasClass("game-two")
      $(".game-two .game-icon-content").hide()
      $(".game-auth-box").addClass("on")
      $(".game-auth-input").addClass("open")
      setTimeout ( ->
        $(".game-auth-input").removeClass("open")
      ), 1000

  $(".game-auth-go").click ->
    if codes.indexOf($(".game-auth-input").val().toLowerCase()) != -1
      generalGameLoadStuff()
      $(".game-frame.game-two").css("display", "flex")
      $(".play-message").text("Heart & Soul")
      $(".game-auth-box").removeClass("on")
      $(".game-two .game-icon-content").show()
      audio = new Audio('assets/tunes/hands64.m4a')
      audio.play()
    else
      $(".game-auth-input").addClass("invalid")
      setTimeout ( ->
        $(".game-auth-input").removeClass("invalid")
      ), 1000

  $(".game-auth-cancel").click ->
    $(".game-auth-box").removeClass("on")
    $(".game-two .game-icon-content").show()

  $(".back").click ->
    game.state.start('menu') for game in Phaser.GAMES
    $(".game-menu").css("display", "flex")
    $(".game-frame").hide()
    $(".game-view").hide()
    $(".game-menu").removeClass("off")
    $(".screen").removeClass("off")
    $(".play-message").text("")
    $(".play-button").removeClass("fa fa-volume-up fa-volume-off")
    $(".arcade-player").removeClass("on").removeClass("playing").removeClass("paused")
    $(".about-view").addClass("off")
    $(".game-menu").removeClass("off")
    resetAudio()

  $(".colour-shuffle").click ->
    generateColour(true)

  $(".about-link").click ->
    resetAudio()
    $(".play-message").text("")
    $(".play-button").removeClass("fa fa-volume-up fa-volume-off")
    $(".arcade-player").removeClass("on").removeClass("playing").removeClass("paused")
    if $(".about-view").hasClass("off")
      $(".about-view").removeClass("off")
      $(".game-menu").addClass("off")
      $(".game-frame").hide()
      $(".game-view").hide()
    else
      $(".about-view").addClass("off")
      $(".game-menu").removeClass("off")

  $(window).unload ->
    resetAudio()

  $(".outer-arcade").addClass("ie") if determineIE()
