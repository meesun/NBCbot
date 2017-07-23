$(document).ready(function() {
  console.log('document readu');
  $('#questionform').on('submit', function(e) {
    alert('button clicked ');
    console.log('button clicked');
    // var data = $("#questionform").serialize();
    // console.log(data); //use the console for debugging, F12 in Chrome, not alerts
    e.preventDefault();
  });
});
