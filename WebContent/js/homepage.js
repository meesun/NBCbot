$(document).ready(function() {

  $('#importantModal').modal('show');

  /* ChartJS
   * -------
   * Here we will create a few charts using ChartJS
   */

  $("#worldMap").LoadingOverlay('show');
  $.ajax({
      url: '/dashboard/getShowDataByCountry'
    })
    .then(function(response) {
      // jvectormap data
      var visitorsData = response;

      // World map by jvectormap
      $('#world-map-markers').vectorMap({
        map: 'world_mill_en',
        backgroundColor: 'transparent',
        regionStyle: {
          initial: {
            fill: '#e4e4e4',
            'fill-opacity': 1,
            stroke: 'none',
            'stroke-width': 0,
            'stroke-opacity': 1
          }
        },
        series: {
          regions: [{
            values: visitorsData,
            scale: ['#92c1dc', '#ebf4f9'],
            normalizeFunction: 'polynomial'
          }]
        },
        onRegionLabelShow: function(e, el, code) {
          if (typeof visitorsData[code] != 'undefined')
            el.html(el.html() + ': ' + visitorsData[code] + ' new visitors');
        }
      });
    })
    .always(function() {
      $("#worldMap").LoadingOverlay('hide');
    });

  $("#feedbackSection").LoadingOverlay('show');
  $.ajax({
      url: 'dashboard/getTagsfromReviews'
    })
    .then(function(response) {
      console.log(response);
      /* jQCloud Word Cloud
       * ------------
       * Create an array of word objects, each representing a word in the cloud
       */
      var word_array = [];
      for (var key in response) {
        if (response.hasOwnProperty(key)) {
          word_array.push({
            text: key,
            weight: response[key]
          })
        }
      }
      $("#wordcloud").jQCloud(word_array);
    })
    .always(function() {
      $("#feedbackSection").LoadingOverlay('hide');
    });

  $.ajax({
      url: 'dashboard/getShows'
    })
    .then(function(response) {
      console.log(response);
      showList = response;
      $("#selectShows1").populate(response, false);
      $("#selectShows2").populate(response, true);
    });


  $.ajax({
      url: 'dashboard/getGender'
    })
    .then(function(response) {
      console.log(response);
      showList = response;
      $("#selectGender").populate1(response, true);
    });

  $.ajax({
      url: 'dashboard/getCity'
    })
    .then(function(response) {
      console.log(response);
      showList = response;
      $("#selectCity").populate1(response, true);
    });

  $("#favShowBox").LoadingOverlay("show");
  $.ajax({
    url: 'shows/getMostFavoriteShows'
  }).then(function(show) {
    console.log(show);

    // var users = "";
    // for (var i = 0; i < show.favUserList.length; i++) {
    //   users += '<img class="img-circle img-sm margin" src="http://localhost:8080/users/getUserDetailsbyId?userId=' + show.favUserList[i] + '" alt="User Image">';
    // }
    //
    // console.log(users);

    var usrString = `<div class="box-header with-border">
      <h3>Most Favourite Show</h3>
      <div class="user-block">
        <span class="username"><a href="` + show.videoURL + `" target="_blank">` + show.name + `</a></span>
        <span class="description">` + show.startTime + ` - ` + show.endTime + `</span>
      </div>
      <!-- /.user-block -->
      <div class="box-tools">
        <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
        <button type="button" class="btn btn-box-tool" data-widget="remove"><i class="fa fa-times"></i></button>
      </div>
      <!-- /.box-tools -->
    </div>
    <!-- /.box-header -->
    <div class="box-body">
      <img class="img-responsive" src="` + show.imageURL + `" alt="Photo">
      <p>` + show.description + `</p>
      <div class="box-comment" id="userLiked">
        <img class="img-circle img-sm margin" src="../dist/img/user4-128x128.jpg" alt="User Image">
      </div>
    </div>
    <!-- /.box-body -->`;

    $("#favShowBox").append(usrString);
  }).always(function() {
    $("#favShowBox").LoadingOverlay("hide");
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

  $('#feedbackForm').on('submit', function(e) {
    $.LoadingOverlay("show");
    e.preventDefault();
    var dataArray = $(this).serializeArray();
    var data = objectifyForm(dataArray);
    var options = [data.option1, data.option2, data.option3];
    var body = {
      "show": data.showName,
      "options": options,
      "answer": "",
      "type": "feedback",
      "qn": data.feedbackQuestion
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
        $("#feedbackForm")[0].reset();
      });
  });

  $('#pushEventForm').on('submit', function(e) {
    $.LoadingOverlay("show");
    e.preventDefault();
    var dataArray = $(this).serializeArray();
    var data = objectifyForm(dataArray);

    var settings = {
      "async": true,
      "url": "shows/sendTrailerLink?showId=" + data.showName + "&videoLink=" + data.trailerLink,
      "method": "GET"
    }

    $.ajax(settings)
      .done(function(response) {
        console.log(response);
      })
      .always(function() {
        $.LoadingOverlay("hide");
        $("#pushEventForm")[0].reset();
      });
  });

  $('#sendTargetedMessageForm').on('submit', function(e) {
    $.LoadingOverlay("show");
    e.preventDefault();
    var dataArray = $(this).serializeArray();
    var data = objectifyForm(dataArray);
    console.log(data);
    var settings = {
      "async": true,
      "url": "shows/sendTargetedMessage?gender=" + data.genderName + "&location=" + data.cityName+"&message="+data.message,
      "method": "GET"
    }

    $.ajax(settings)
      .done(function(response) {
        console.log(response);
      })
      .always(function() {
        $.LoadingOverlay("hide");
        $("#pushEventForm")[0].reset();
      });
  });

  $('#addshowform').on('submit', function(e) {
    $.LoadingOverlay("show");
    e.preventDefault();
    var dataArray = $(this).serializeArray();
    var data = objectifyForm(dataArray);

    var body = {
      "name": data.showName,
      "startTime": data.starttime,
      "endTime": data.endtime,
      "imageURL": data.showimage,
      "videoURL": data.showtrailer,
      "favUserList": [],
      "description": data.description,
      "tags": data.showtags.split(',')
    }

    console.log(JSON.stringify(body));

    var settings = {
      "async": true,
      "url": "dashboard/saveShows",
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
        $("#addshowform")[0].reset();
      });

  });

  //serialize data function
  function objectifyForm(formArray) {
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++) {
      returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
  }

  $.fn.populate = function(optionArray, bindId) {
    for (var i = 0; i < optionArray.length; i++) {
      var option = bindId ? optionArray[i]["_id"] : optionArray[i]["name"];
      $(this).append('<option value="' + option + '">' + optionArray[i]["name"] + '</option>');
    }
  }

  $.fn.populate1 = function(optionArray, bindId) {
    for (var i = 0; i < optionArray.length; i++) {
      $(this).append('<option value="' + optionArray[i] + '">' + optionArray[i] + '</option>');
    }
  }

  var showList = [];

});
