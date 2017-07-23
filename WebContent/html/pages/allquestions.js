$(function() {
  $.LoadingOverlay("show");
  $.ajax({
    url: '/dashboard/getQuizQuestions'
  }).done(function(questions) {
    console.log(questions);

    for (var i = 0; i < questions.length; i++) {
      var question = questions[i];
      var options = question.options;
      var optString = "";

      for (var j = 0; j < options.length; j++) {
        if (options[j] == question.answer) {
          optString += `<p class="text-green"><i class="fa fa-check-square-o"></i> ` + options[j] + `</p>`;
        } else {
          optString += `<p><i class="fa fa-fw"></i>` + options[j] + `</p>`;
        }
      }

      console.log(optString);

      var quesString = `<div class="box box-default">
        <div class="box-header with-border">
          <i class="fa fa-question-circle-o"></i>
          <h3 class="box-title">` + question.qn + `</h3>

          <div class="box-tools pull-right">
            <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-plus"></i></button>
            <button type="button" class="btn btn-box-tool" data-widget="remove"><i class="fa fa-times"></i></button>
          </div>
        </div>
        <!-- END BOX HEADER -->
        <div class="box-body">
          ` + optString + `
        </div>
        <!-- END box body -->
      </div>
      <!-- END QUESTION BOX -->`;

      $("#questionsSection").append(quesString);
    }
  }).always(function() {
    $.LoadingOverlay("hide");
  });

  $('#questionform').on('submit', function(e) {
    $.LoadingOverlay("show");
    e.preventDefault();
    var dataArray = $(this).serializeArray();
    var data = objectifyForm(dataArray);
    var options = [data.option1, data.option2, data.option3];
    var body = {
      "show": "",
      "options": options,
      "answer": options[data.gameanswer],
      "type": "quiz",
      "qn": data.gamequestion
    }

    console.log(body);

    var settings = {
      "async": true,
      "url": "dashboard/saveAllQuestions",
      "method": "POST",
      "headers": {
        "content-type": "application/json",
        "cache-control": "no-cache"
      },
      "data": JSON.stringify(body)
    }

    $.ajax(settings)
      .done(function(response) {
        console.log(response);
      })
      .always(function() {
        $.LoadingOverlay("hide");
        $("#questionform")[0].reset();
      });
  });
});
