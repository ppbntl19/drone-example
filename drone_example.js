<!DOCTYPE html>
<html lang="en">

<head>
  <title>Bootstrap Example</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <style>
    /* Set height of the grid so .sidenav can be 100% (adjust if needed) */

    .row.content {
      height: 1500px
    }

    /* Set gray background color and 100% height */

    .sidenav {
      background-color: #f1f1f1;
      height: 100%;
    }

    /* Set black background color, white text and some padding */

    footer {
      background-color: #555;
      color: white;
      padding: 15px;
    }

    /* On small screens, set height to 'auto' for sidenav and grid */

    @media screen and (max-width: 767px) {
      .sidenav {
        height: auto;
        padding: 15px;
      }
      .row.content {
        height: auto;
      }
    }
  </style>
</head>

<body>

  <div class="container-fluid">
    <div class="row content">
      <div class="col-sm-4 sidenav drone_dashboard">
        <h4>Drone List</h4>
        <ul class="drone_list nav nav-pills nav-stacked">
        </ul><br>
        <h4>Add Drone</h4>
        <div class="input-group">
          <input name="name" type="text" class="form-control" placeholder="Add Drone Name">
          <input name="start" type="text" class="form-control" placeholder="Current position of drone">
          <span class="input-group-btn">
          <button class="btn btn-default add" type="button">
            Add
          </button>
        </span>
        </div>
        <br>
        <br>
        <div class="input-group">
          <button class="btn btn-default start" type="button">Start All</button>
          <button class="btn btn-default" type="button">Stop All</button>
          <button class="btn btn-default" type="button">Reset</button>
        </div>
      </div>

      <div class="col-sm-8">
        <div id="map" style="width:100%;height:400px;"></div>
      </div>
    </div>
  </div>

  <footer class="container-fluid">
    <p>Drone Example</p>
  </footer>

</body>


<script>
  //Add Googlr MAP
  function myMap() {
    var mapCanvas = document.getElementById("map");
    var mapOptions = {
      center: new google.maps.LatLng(51.5, -0.2),
      zoom: 10
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);
  }


  //get start position
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  }
  else {
    alert("Geolocation is not supported by this browser.");
  }
  //Markers
  var all_drones = {};
  var new_drone;
  var map;
  
  function showPosition(position) {
    //Get  map details
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var myCenter = new google.maps.LatLng(lat, lng);
    var mapCanvas = document.getElementById("map");
    var mapOptions = {
      center: myCenter,
      zoom: 5
    };
    
    map = new google.maps.Map(mapCanvas, mapOptions);
    //On click get GEO to add drone location
    google.maps.event.addListener(map, 'click', function(event) {
      //Set start 
      $("input[name='start']").val(event.latLng.lat() + ',' + event.latLng.lng())
      //get new drone position and add marker
      new_drone = new google.maps.Marker({
        position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
        label: {
          text: $("input[name='name']").val()
        },
        id: $("input[name='name']").val()
      });
    });
  }
  //Add a drone
  $(".add").click(function(e) {
    //Check if drone name added
    if ($("input[name='name']").val().length < 4) return alert("Please add a drone name first And click Add Button");
    //get location
    if (!$("input[name='start']").val()) return alert("Please click on map to select location");
    //Set marker as a drone in map
    new_drone.setMap(map);
    //Save Marker refrence
    all_drones[$("input[name='name']").val()] = new_drone;
    //Update marker list
    $(".drone_list").html("");
    //Apped list of drones
    for (var marker in all_drones) {
      if (all_drones.hasOwnProperty(marker)) {
        //Add list with name, position, and stop button
        $(".drone_list").append('<li><a href="#section1" class="' + marker + '">' + marker + '</a>&nbsp&nbsp<strong class="' + marker + '">Current Positoon:' + all_drones[marker].getPosition().lat() + ',' + all_drones[marker].getPosition().lng() + '</strong>&nbsp&nbsp<button data-drone_name="' + marker + '" class="' + marker + ' stop">Stop</button></li>');
      }
    }
    //Empty inputs
    $("input[name='name']").val("")
    $("input[name='start']").val("")
    //Add all markers in localstorage
    //todo
  });

  //Start Drone
  $(".start").click(function(e) {
    //Remove higlited drone
    $("li").css("background-color", "")
    //Start drone using setinterval (alternate of GPS)
    for (var marker in all_drones) {
      //If drone exists
      if (all_drones.hasOwnProperty(marker)) {
        //Set drone not active true
        all_drones[marker].not_active = false;
        //Set update location od drone with a increament
        var current_location_drone;
        //Update geo , show drone will move in to a staright direction
        current_location_drone = all_drones[marker].getPosition().lat();
        //Clear any existing interval
        clearInterval(all_drones[marker].timeout);
        //Start and update position of drone
        all_drones[marker].timeout = setInterval(function() {
          //Check if drone is active
          if (!all_drones[marker].not_active) {
            current_location_drone = current_location_drone + .008176926815496;
            //Get Update GEO
            var latlng = new google.maps.LatLng(current_location_drone, all_drones[marker].getPosition().lng());
            //Update position
            all_drones[marker].setPosition(latlng);
            //Update postion in dashbaord
            $("strong."+marker).text(current_location_drone +','+all_drones[marker].getPosition().lng());
          } 
        }, 100);
      }
    }
  });

  //Stop Aa drone
  $(".drone_dashboard").on('click', '.stop', function(e) {
    //get refrence of this
    var that = this
    //Stop drone
    clearInterval(all_drones[$(this).attr("data-drone_name")].timeout)
    //Set not active true
    all_drones[$(this).attr("data-drone_name")].not_active = true;
    //Highlight  after 10 seconds if not active
    setTimeout(function() {
      if (all_drones[$(that).attr("data-drone_name")].not_active) {
        //Highlite with red
        $(that).parents("li").css("background-color", "red")
      }
    }, 10000)
  });
</script>
<!--Google map library-->
<script src='https://maps.google.com/maps/api/js?key=AIzaSyCV_xLiy90YG3yIYab2VsvyIsvmennqDgw&Esensor=false&callback=myMap'></script>

</html>
