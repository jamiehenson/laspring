---
---

$ ->
  if document.location.pathname != "/"
    $(".site-link").removeClass "current"
    $(".site-link." + document.location.pathname.split("/")[1]).addClass "current"

  $(".field").focusin ->
    $(".field").addClass "focused"

  $(".field").focusout ->
    $(".field").removeClass "focused"

  window.setTimeout (->
    $(".mailchimp").removeClass("closed").addClass("open")
  ), 5000

  $(".close").click ->
    $(".mailchimp").removeClass("open").addClass("closed")
