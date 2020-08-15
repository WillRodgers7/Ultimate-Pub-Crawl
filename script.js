//this function sends the query by city chosen by user
// function queryURL(userCity) {
//   // userCity parameter holds the Zomato City ID
//   // we will use this in the query builder string 'queryU'
//   var apiKey = "2f0db10ea057aa7670716496e756f590";
//   var queryU =
//     "https://developers.zomato.com/api/v2.1/search?entity_id=281&entity_type=city&count=3&establishment_type=283";

//   console.log("right before ajax call");
//   $.ajax({
//     headers: {
//       Accept: "text/plain; charset=utf-8",
//       "Content-Type": "text/plain; charset=utf-8",
//       "user-key": "2f0db10ea057aa7670716496e756f590",
//     },
//     method: "GET",
//     url: queryU,
//     success: function (response) {
//       console.log(response);
//     },
//   });
// }

// displays info received from Zomato API
var displayResults = $(".results")
var city;
// gets and returns the Zomato City(entity) ID by city name
// begin recursive ajax calls

//  https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
// calculates distance from two points
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// https://stackoverflow.com/questions/4656802/midpoint-between-two-latitude-and-longitude
// this code was taken from a stack overflow question to calculate midpoint between two points
function midpointCalculator(long1, lat1, long2, lat2) {
  var dLon = long2 - long1;
  dLon = dLon * (Math.PI / 180);
  // dLon is now in radians

  lat1 = lat1 * (Math.PI / 180);
  lat2 = lat2 * (Math.PI / 180);
  long1 = long1 * (Math.PI / 180);

  var Bx = Math.cos(lat2) * Math.cos(dLon);
  var By = Math.cos(lat2) * Math.sin(dLon);
  var lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)
  );
  var long3 = long1 + Math.atan2(By, Math.cos(lat1) + Bx);

  // now convert back to degrees
  lat3 = lat3 * (180 / Math.PI);
  long3 = long3 * (180 / Math.PI);

  console.log("new longitude: " + long3 + ", new latitude: " + lat3);
  // returns coords as an array
  return [long3, lat3];
}

function getCityId(cityName) {
  var apiKey = "2f0db10ea057aa7670716496e756f590";
  // limits to one possible result
  var queryU =
    "https://developers.zomato.com/api/v2.1/cities?q=" + cityName + "&count=1";
  $.ajax({
    headers: {
      Accept: "text/plain; charset=utf-8",
      "Content-Type": "text/plain; charset=utf-8",
      "user-key": "2f0db10ea057aa7670716496e756f590",
    },
    method: "GET",
    url: queryU,
    success: function (response) {
      console.log(response);
      // this console.log can display the city ID
      console.log(
        "This should give me the city ID ===> " +
        response.location_suggestions[0].id
      );
      var cityID = response.location_suggestions[0].id;

      // another ajax call!
      // now use a search GET query after getting the zomato city ID
      // reassigning the query string var
      // will need to modify this depending on user need and other parameters
      queryU =
        "https://developers.zomato.com/api/v2.1/search?entity_id=" +
        cityID +
        "&entity_type=city&count=3&establishment_type=7";

      console.log("right before nested ajax call");
      $.ajax({
        headers: {
          Accept: "text/plain; charset=utf-8",
          "Content-Type": "text/plain; charset=utf-8",
          "user-key": "2f0db10ea057aa7670716496e756f590",
        },
        method: "GET",
        url: queryU,
        success: function (response) {
          for (var i = 0; i < response.restaurants.length; i++) {
            const restaurant = response.restaurants[i].restaurant;
            var establishment = restaurant.establishment[0]
            var name = restaurant.name
            var reviews = restaurant.user_rating.aggregate_rating
            var cost = restaurant.average_cost_for_two
            var hours = restaurant.timings
            var address = restaurant.location.address

            console.log(restaurant);

            $(".card-title").text(name)
            var addLi = $("<li>").text("Address: " + address)
            $(".list").append(addLi)




          }
          console.log("nested response object...");
          console.log(response);
          // get long and lat of some restaurants

          // hardcoded: testing first two results
          var long1 = response.restaurants[0].restaurant.location.longitude;
          var lat1 = response.restaurants[0].restaurant.location.latitude;
          var long2 = response.restaurants[1].restaurant.location.longitude;
          var lat2 = response.restaurants[1].restaurant.location.latitude;

          // for (let i = 0; i < response.restaurants.length; i++) {}

          // this will be an array
          var midpoint = midpointCalculator(long1, lat1, long2, lat2);

          // calculate distance from the endpoints
          var distanceInKm = getDistanceFromLatLonInKm(
            lat1,
            long1,
            lat2,
            long2
          );
          console.log(distanceInKm);
          var customZoom;

          // switch statement for custom zoom
          // switch (distanceInKm) {
          //   case :
          //       customZoom =
          //     break;
          //   case value:

          //     break;
          //   case value:

          //     break;

          //   default:
          //     break;
          // }
          if (distanceInKm < 1.5) {}

          console.log("longitude: " + long1 + ", latitude: " + lat1);
          console.log("longitude: " + long2 + ", latitude: " + lat2);
          console.log("outside of the function...." + midpoint);
          // able to get long at lat from the api call
          // MAP API STUFF GOES HERE
          // -----------------------------------------------------------------
          var mapAPIKey = "85e9d3f13d3845e0a0ca48b327bba8c4";

          // change the center to be one of the locations
          var map = new mapboxgl.Map({
            container: "my-map",
            center: midpoint,
            zoom: 15,
            style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${mapAPIKey}`,
          });
          map.addControl(new mapboxgl.NavigationControl());

          map.on("load", function () {
            var mode = "walk";
            // location 1
            // var lat1 = "34.14622";
            // var long1 = "-118.141136";
            // location 2
            // var lat2 = "34.145501";
            // var long2 = "-118.149101";

            var routingURL = `https://api.geoapify.com/v1/routing?waypoints=${lat1},${long1}|${lat2},${long2}&mode=${mode}&apiKey=${mapAPIKey}`;
            //This commented out link is the working example for reference
            // var routingURL = "https://api.geoapify.com/v1/routing?waypoints=34.150079,-118.144247|34.153289,-118.148936&mode=drive&apiKey=85e9d3f13d3845e0a0ca48b327bba8c4"
            console.log("this is right before nested MAPS api call.....");
            $.ajax({
              method: "GET",
              url: routingURL,

              success: function (response) {
                map.addSource("route", {
                  type: "geojson",
                  data: response
                });
                map.addLayer({
                  id: "route",
                  type: "line",
                  source: "route",
                  layout: {
                    "line-join": "round",
                    "line-cap": "round",
                  },
                  paint: {
                    "line-color": "#888",
                    "line-width": 8,
                  },
                });
                console.log(response); // Full Object
                //Calculate distance
                var travelDistance = response.features[0].properties.distance;
                console.log("Travel Distance: " + travelDistance + " metres");

                //Calculate time
                var travelMinutes = response.features[0].properties.time % 60;
                console.log("Minutes: " + travelMinutes);
              },
            });
          });
        },
      });

      // return cityID;
    },
  });
}

// prelim submit function
$("#userForm").on("submit", function (event) {
  event.preventDefault();
  console.log("submitted");
  city = $("#textarea1").val().trim();
  localStorage.setItem("currentCity", city);
  console.log(city);
  if (city == "") {
    return;
  } else {
    console.log("we are in the else");
    // get Zomato City Id, and then use that in the query function
    console.log("getting city ID...");
    // this console.log will be undefined because asynchronous behaviour
    // the function will still run though...
    console.log(getCityId(city));
    console.log("i should print before responses...!");
    // passing an ID to another function...aysynchonicity will cause problems
    // ajax call to get the zomato city ID, then run another ajax call to get the pubs in the city
    // because of multiple ajax calls that are dependent on the API responses
    // queryURL(getCityId(city));


    // Connecting Index and Home Page (Begining)
    location.href = "./home.html";
  }
  // saving text area
  console.log(city);
  var cityGrab = document.getElementById("currentCity");
  cityGrab.textContent = `Your Current City Is: ${city}`;
  $("#textarea2").val(localStorage.getItem("currentCity"));

  
 

});
// Connecting Index and Home Page (End)




// Side bar nav start
document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('.sidenav');
  var instances = M.Sidenav.init(elems, {});
});

// Initialize collapsible (uncomment the lines below if you use the dropdown variation)
// var collapsibleElem = document.querySelector('.collapsible');
// var collapsibleInstance = M.Collapsible.init(collapsibleElem, options);

// Or with jQuery

$(document).ready(function () {
  $('.sidenav').sidenav();
});
// save text area
$("#textarea2").val(localStorage.getItem("currentCity"));

//Side bar nav end