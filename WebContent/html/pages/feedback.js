$(function() {
  var allQuestions = {};
  var allShows = [];

  $("#selectShows").on('change', function(e) {
    console.log(e.target.value);
    $("#reviewsContainer").html(getContentCreated(allQuestions[e.target.value]));
  })

  $.LoadingOverlay("show");
  $.ajax({
    url: '/dashboard/getAllQuestions'
  }).done(function(questions) {
    console.log(questions);

    for (var i = 0; i < questions.length; i++) {
      if (!allQuestions[questions[i].show]) {
        allQuestions[questions[i].show] = [];
      }
      allQuestions[questions[i].show].push(questions[i]);
    }

    for (var show in allQuestions) {
      if (allQuestions.hasOwnProperty(show)) {
        allShows.push(show);
      }
    }

    console.log(allQuestions);
    console.log(allShows);

    var showsStr = "";
    for (var i = 0; i < allShows.length; i++) {
      showsStr += '<option value="' + allShows[i] + '">' + allShows[i] + '</option>';
    }

    $("#selectShows").html(showsStr);
    $("#reviewsContainer").html(getContentCreated(allQuestions[allShows[0]]));

  }).always(function() {
    $.LoadingOverlay("hide");
  });

  function getContentCreated(questions) {

    console.log(questions);

    var reviewsStr = "";

    for (var i = 0; i < questions.length; i++) {
      var question = questions[i];
      var userReview = "";

      for (var j = 0; j < question.response.length; j++) {
        userReview += `<section class="review__wrapper">
          <div class="row">
            <div class="col-md-2">
              <img class="review__avatar" src="../../dist/img/avatar.png" alt="profile picture">
              <p class="review__name">User</p>
              <!-- <p class="review__date">Jul 17, 2017</p> -->
            </div>
            <div class="col-md-10">
              <p>` + question.response[j].response + `</p>
            </div>
          </div>
        </section>
        <!-- END REVIEW WRAPPER -->`;
      }

      reviewsStr += `<div class="box box-default">
      <div class="box-header with-border">
        <i class="fa fa-question-circle-o"></i>
        <h3 class="box-title">` + question.qn + `</h3>

        <div class="box-tools pull-right">
          <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
          <button type="button" class="btn btn-box-tool" data-widget="remove"><i class="fa fa-times"></i></button>
        </div>
      </div>
      <!-- END BOX HEADER -->
      <div class="box-body">
        ` + userReview + `
      </div>
      <!-- END box body -->
    </div>
    <!-- END QUESTION BOX -->`;
    }

    return reviewsStr;
  }
});
