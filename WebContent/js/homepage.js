$(document).ready(function() {
  /* ChartJS
   * -------
   * Here we will create a few charts using ChartJS
   */

  //-------------
  //- BAR CHART -
  //-------------
  var barChartCanvas = $('#barChart').get(0).getContext('2d')
  var barChart = new Chart(barChartCanvas)
  var barChartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
        label: 'Electronics',
        fillColor: 'rgba(210, 214, 222, 1)',
        strokeColor: 'rgba(210, 214, 222, 1)',
        pointColor: 'rgba(210, 214, 222, 1)',
        pointStrokeColor: '#c1c7d1',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(220,220,220,1)',
        data: [65, 59, 80, 81, 56, 55, 40]
      },
      {
        label: 'Digital Goods',
        fillColor: 'rgba(60,141,188,0.9)',
        strokeColor: 'rgba(60,141,188,0.8)',
        pointColor: '#3b8bba',
        pointStrokeColor: 'rgba(60,141,188,1)',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(60,141,188,1)',
        data: [28, 48, 40, 19, 86, 27, 90]
      }
    ]
  }
  barChartData.datasets[1].fillColor = '#00a65a'
  barChartData.datasets[1].strokeColor = '#00a65a'
  barChartData.datasets[1].pointColor = '#00a65a'
  var barChartOptions = {
    //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
    scaleBeginAtZero: true,
    //Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines: true,
    //String - Colour of the grid lines
    scaleGridLineColor: 'rgba(0,0,0,.05)',
    //Number - Width of the grid lines
    scaleGridLineWidth: 1,
    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: true,
    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: true,
    //Boolean - If there is a stroke on each bar
    barShowStroke: true,
    //Number - Pixel width of the bar stroke
    barStrokeWidth: 2,
    //Number - Spacing between each of the X value sets
    barValueSpacing: 5,
    //Number - Spacing between data sets within X values
    barDatasetSpacing: 1,
    //String - A legend template
    legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].fillColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
    //Boolean - whether to make the chart responsive
    responsive: true,
    maintainAspectRatio: true
  }

  barChartOptions.datasetFill = false
  barChart.Bar(barChartData, barChartOptions);

  $.ajax({
    url: '/dashboard/getShowDataByCountry'
  }).then(function(response) {
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
  });

  $.ajax({
    url: 'dashboard/getTagsfromReviews'
  }).then(function(response) {
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
  });

  $.ajax({
    url: 'dashboard/getShows'
  }).then(function(response) {
    console.log(response);
    showList = response;
    $("#selectShows1").populate(response, false);
    $("#selectShows2").populate(response, true);
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

    console.log(body);

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
        $("#feedbackForm")[0].reset();
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

  var showList = [];

});
