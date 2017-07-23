$(function() {
  $.LoadingOverlay("show");

  $.ajax({
    url: '/dashboard/getAllQuestions'
  }).done(function(questions) {
    console.log(questions);
  }).always(function() {
    $.LoadingOverlay("hide");
  });
});
