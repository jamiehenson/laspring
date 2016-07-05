---
---

$ ->
  $(".site-link").removeClass "current"
  console.log(".site-link." + document.location.pathname.split("/")[1])
  $(".site-link." + document.location.pathname.split("/")[1]).addClass "current"
