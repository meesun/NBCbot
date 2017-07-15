$(document).ready(function() {
  $.ajax({
    url: '../html/sidemenu.html',
    success: function(result) {
      $("#navigation_page").html(result);
    }
  });

  $.ajax({
    url: '../html/sidebar__left.html',
    success: function(result) {
      $("#main-sidebar").html(result);
    }
  })

  $.ajax({
    url: '../html/sidebar__right.html',
    success: function(result) {
      $("#sidebar__right").html(result);
    }
  })
})
