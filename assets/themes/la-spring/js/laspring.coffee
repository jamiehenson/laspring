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
