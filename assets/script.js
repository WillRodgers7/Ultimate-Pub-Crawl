// displays info received from Zomato API
var displayResults = $(".results");
var barHopNumber = 3; //start with 3 bars minimum
// 0 for 3 bars, 1 for 4 bars, 2 for 5 bars
var offsetNumBars = 0; // reassigned once you update filter parameters
var city; // will variable to hold city from index to pass into home.html
var searchQ = "bar"; // search query initialize to bar
var searchRadius = 3218; // initialize call to 2 miles; 3218 meters
var mainCityLat; // lat and long of queried city
var mainCityLong;
var midpoint; // holds calculated midpoint
var totalDistanceInKm; // holds total distance of generated route; used for custom zoom.
var mapAPIKey = "85e9d3f13d3845e0a0ca48b327bba8c4";
var mode = "walk";
var routingURL; // global var holding the dynamic ROUTING API CALL
var alcSelect; // array of choices from filter button

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
  return [long3, lat3];
}

// takes in an array of restaurants and randomizes them
// returns randomized choices of restaurants in array form
// can change depending on how many bars they want to hop; offset variable
function getRandomRestaurants(resArray) {
  var randomizedArray = [];
  // go through array and select random res 3 times, without duplicates
  // this is done by splicing out a choice, and then choosing from the rest
  //  https://stackoverflow.com/questions/34913566/random-pick-from-array-without-duplicate
  // how to pick from random in array without duplicates
  do {
    var id = Math.floor(Math.random() * resArray.length);
    var restaurant = resArray[id];
    randomizedArray.push(restaurant);
    resArray.splice(id, 1);
  } while (resArray.length > 17 - offsetNumBars); // this for three bars; we have 20 results now
  return randomizedArray;
}

// receives the randomized array of bars/restaurants
// and calculates distance/midpoints/routingURL depending on how many bars user wants
function howManyBars(randomizedArray) {
  if (barHopNumber == 3) {
    // 3 bars case
    // first bar
    var long1 = randomizedArray[0].restaurant.location.longitude;
    var lat1 = randomizedArray[0].restaurant.location.latitude;
    // middle bar
    var middleLong1 = randomizedArray[1].restaurant.location.longitude;
    var middleLat1 = randomizedArray[1].restaurant.location.latitude;
    // last bar
    var long2 = randomizedArray[2].restaurant.location.longitude;
    var lat2 = randomizedArray[2].restaurant.location.latitude;
    // midpoint will be an array; [lat, long]
    midpoint = midpointCalculator(long1, lat1, long2, lat2);
    // add distance from point to point
    totalDistanceInKm = getDistanceFromLatLonInKm(
      lat1,
      long1,
      middleLat1,
      middleLong1
    );
    totalDistanceInKm =
      totalDistanceInKm +
      getDistanceFromLatLonInKm(middleLat1, middleLong1, lat2, long2);
    routingURL = `https://api.geoapify.com/v1/routing?waypoints=${lat1},${long1}|${middleLat1},${middleLong1}|${lat2},${long2}&mode=${mode}&apiKey=${mapAPIKey}`;
  } else if (barHopNumber == 4) {
    // 4 bars case
    // first bar
    var long1 = randomizedArray[0].restaurant.location.longitude;
    var lat1 = randomizedArray[0].restaurant.location.latitude;
    // middle bars
    var middleLong1 = randomizedArray[1].restaurant.location.longitude;
    var middleLat1 = randomizedArray[1].restaurant.location.latitude;
    var middleLong2 = randomizedArray[2].restaurant.location.longitude;
    var middleLat2 = randomizedArray[2].restaurant.location.latitude;
    // last bar
    var long2 = randomizedArray[3].restaurant.location.longitude;
    var lat2 = randomizedArray[3].restaurant.location.latitude;
    midpoint = midpointCalculator(long1, lat1, long2, lat2);
    // add distance from point to point
    totalDistanceInKm = getDistanceFromLatLonInKm(
      lat1,
      long1,
      middleLat1,
      middleLong1
    );
    totalDistanceInKm =
      totalDistanceInKm +
      getDistanceFromLatLonInKm(
        middleLat1,
        middleLong1,
        middleLat2,
        middleLong2
      );
    totalDistanceInKm =
      totalDistanceInKm +
      getDistanceFromLatLonInKm(middleLat2, middleLong2, lat2, long2);
    routingURL = `https://api.geoapify.com/v1/routing?waypoints=${lat1},${long1}|${middleLat1},${middleLong1}|${middleLat2},${middleLong2}|${lat2},${long2}&mode=${mode}&apiKey=${mapAPIKey}`;
  } else {
    //  5 bars case
    // first bar
    var long1 = randomizedArray[0].restaurant.location.longitude;
    var lat1 = randomizedArray[0].restaurant.location.latitude;
    // middle bars
    var middleLong1 = randomizedArray[1].restaurant.location.longitude;
    var middleLat1 = randomizedArray[1].restaurant.location.latitude;
    var middleLong2 = randomizedArray[2].restaurant.location.longitude;
    var middleLat2 = randomizedArray[2].restaurant.location.latitude;
    var middleLong3 = randomizedArray[3].restaurant.location.longitude;
    var middleLat3 = randomizedArray[3].restaurant.location.latitude;
    // last bar
    var long2 = randomizedArray[4].restaurant.location.longitude;
    var lat2 = randomizedArray[4].restaurant.location.latitude;
    midpoint = midpointCalculator(long1, lat1, long2, lat2);
    totalDistanceInKm = getDistanceFromLatLonInKm(
      lat1,
      long1,
      middleLat1,
      middleLong1
    );
    totalDistanceInKm =
      totalDistanceInKm +
      getDistanceFromLatLonInKm(
        middleLat1,
        middleLong1,
        middleLat2,
        middleLong2
      );
    totalDistanceInKm =
      totalDistanceInKm +
      getDistanceFromLatLonInKm(
        middleLat2,
        middleLong2,
        middleLat3,
        middleLong3
      );
    totalDistanceInKm =
      totalDistanceInKm +
      getDistanceFromLatLonInKm(middleLat3, middleLong3, lat2, long2);
    routingURL = `https://api.geoapify.com/v1/routing?waypoints=${lat1},${long1}|${middleLat1},${middleLong1}|${middleLat2},${middleLong2}|${middleLat3},${middleLong3}|${lat2},${long2}&mode=${mode}&apiKey=${mapAPIKey}`;
  }
}

// takes in name of user input city
// begin nested ajax calls. Get lat and long of user input city ---> Search query using the searchQ/lat/long/searchRadius/ ---> call Maps API
function getCityId(cityName) {
  var apiKey = "2f0db10ea057aa7670716496e756f590";
  // limits to one possible result, the main city
  var queryU =
    "https://developers.zomato.com/api/v2.1/locations?query=" +
    cityName +
    "&count=1";
  // begin first ajax call
  $.ajax({
    headers: {
      Accept: "text/plain; charset=utf-8",
      "Content-Type": "text/plain; charset=utf-8",
      "user-key": "2f0db10ea057aa7670716496e756f590",
    },
    method: "GET",
    url: queryU,
    success: function (response) {
      mainCityLat = response.location_suggestions[0].latitude;
      mainCityLong = response.location_suggestions[0].longitude;
      // search Q  is dynamic depending on customized settings
      // update queryU for our next Zomato API "search" call
      queryU =
        "https://developers.zomato.com/api/v2.1/search?q=" +
        searchQ +
        "&lat=" +
        mainCityLat +
        "&lon=" +
        mainCityLong +
        "&radius=" +
        searchRadius;
      $.ajax({
        headers: {
          Accept: "text/plain; charset=utf-8",
          "Content-Type": "text/plain; charset=utf-8",
          "user-key": "2f0db10ea057aa7670716496e756f590",
        },
        method: "GET",
        url: queryU,
        success: function (response) {
          // randomize the 20 results, and spit out an array carrying the desired amount of bars
          var randomResArray = getRandomRestaurants(response.restaurants);
          // iPlus represents id to match in home.html
          var iPlus;
          // show cards depending on how many bars selected
          if (barHopNumber == 3) {
            $("#row4").hide();
            $("#row5").hide();
          } else if (barHopNumber == 4) {
            $("#row5").hide();
            $("#row4").show();
          } else {
            $("#row4").show();
            $("#row5").show();
          }
          // dynamically write onto the cards the restaurant info
          for (var i = 0; i < randomResArray.length; i++) {
            // hold this particular restaurant info in this iteration
            var thisRestaurant = randomResArray[i].restaurant;
            var name = thisRestaurant.name;
            var cost = thisRestaurant.average_cost_for_two;
            var description = thisRestaurant.highlights;
            var address = thisRestaurant.location.address;
            var phone = thisRestaurant.phone_numbers;
            iPlus = i + 1;
            // Populates cards with restaurant information
            $("#title" + iPlus).text(name);
            $("#address" + iPlus).text("Address: " + address);
            $("#price" + iPlus).text("Average cost for two: $" + cost);
            $("#phone" + iPlus).text("Phone Number: " + phone);
            $("#desc" + iPlus).text(
              "Highlights: " +
                description[0] +
                ", " +
                description[1] +
                ", " +
                description[2]
            );
          }
          // count how many bars there are and run distance/midpoint/routingURL calculations based on that
          howManyBars(randomResArray);
          var customZoom;
          // change zoom according to how far away the endpoints are from each other
          if (totalDistanceInKm < 1.5) {
            customZoom = 15;
          } else if (totalDistanceInKm < 3) {
            customZoom = 14;
          } else if (totalDistanceInKm < 5) {
            customZoom = 13;
          } else if (totalDistanceInKm < 11) {
            customZoom = 12;
          } else if (totalDistanceInKm < 14) {
            customZoom = 11;
          } else {
            customZoom = 10;
          }
          // creating map tile
          var map = new mapboxgl.Map({
            container: "my-map",
            center: midpoint,
            zoom: customZoom,
            style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${mapAPIKey}`,
          });
          // adding zoom buttons
          map.addControl(new mapboxgl.NavigationControl());
          // when the map loads, execute...
          map.on("load", function () {
            $.ajax({
              method: "GET",
              url: routingURL,
              success: function (result) {
                // begin route drawing
                map.addSource("route", {
                  type: "geojson",
                  data: result,
                });
                // add the drawing
                map.addLayer({
                  id: "route",
                  type: "line",
                  source: "route",
                  layout: {
                    "line-join": "round",
                    "line-cap": "round",
                  },
                  paint: {
                    "line-color": "#4DDBFF",
                    "line-width": 7,
                  },
                });
                // Script for loading geojson bar markers
                var pointgeojson = { type: "FeatureCollection", features: [] };
                for (var i = 0; i < randomResArray.length; i++) {
                  addPoint = {
                    type: "Feature",
                    geometry: {
                      type: "Point",
                      coordinates: [
                        randomResArray[i].restaurant.location.longitude,
                        randomResArray[i].restaurant.location.latitude,
                      ],
                    },
                    properties: {
                      title: randomResArray[i].restaurant.name,
                      description: randomResArray[i].restaurant.timings,
                    },
                  };
                  pointgeojson.features.push(addPoint);
                }
                // load the markers
                map.loadImage(
                  "https://api.geoapify.com/v1/icon/?type=awesome&color=%23467cda&icon=glass-martini&apiKey=85e9d3f13d3845e0a0ca48b327bba8c4",
                  function (error, image) {
                    if (error) throw error;
                    map.addImage("custom-marker", image);
                    map.addSource("waypoints", {
                      type: "geojson",
                      data: pointgeojson,
                    });
                    map.addLayer({
                      id: "waypoints",
                      type: "symbol",
                      source: "waypoints",
                      layout: {
                        "icon-image": "custom-marker",
                        // get the title name from the source's "title" property
                        "text-field": ["get", "title"],
                        "text-font": [
                          "Open Sans Semibold",
                          "Arial Unicode MS Bold",
                        ],
                        "text-offset": [0, 1.25],
                        "text-anchor": "top",
                      },
                    });
                  }
                );
              },
            });
          });
        },
      });
    },
  });
}

// executes when the user submits on any text area
$("#userForm").on("submit", function (event) {
  event.preventDefault();
  // grab the appropriate text value depending on which page you're on
  if (location.href.includes("/home.html")) {
    city = $("#textarea2").val().trim();
  } else {
    city = $("#textarea1").val().trim();
  }
  localStorage.setItem("currentCity", city);
  // if no user input city, do nothing and return
  if (city == "") {
    return;
  } else {
    // regenerate bar crawl with updated parameters
    if (location.href.includes("/home.html")) {
      barHopNumber = $("#crawlLength").val();
      if (barHopNumber == 3) {
        offsetNumBars = 0;
      } else if (barHopNumber == 4) {
        offsetNumBars = 1;
      } else {
        offsetNumBars = 2;
      }
      // run the API calls with updated info
      getCityId(city);
    } else {
      window.location.href = "./home.html";
      // if we submit from index.html, then go to next page
    }
  }
});

// Side bar nav start
document.addEventListener("DOMContentLoaded", function () {
  var elems = document.querySelectorAll(".sidenav");
  var instances = M.Sidenav.init(elems, {});
});
// Initialize collapsible
var collapsibleElem = document.querySelector(".collapsible");
var collapsibleInstance = M.Collapsible.init(collapsibleElem, {});

// get locally stored city every time we load page on home.html
$("#textarea2").val(localStorage.getItem("currentCity"));

$(document).ready(function () {
  // executes when you click the generate button
  $("#generateBtn").on("click", function (event) {
    event.preventDefault();
    // initialize form select of establishment types
    var instance = M.FormSelect.getInstance($("#alcoholType"));
    // holds an array of the selected options
    alcSelect = instance.getSelectedValues();
    // reset the search query string
    // and build a new one depending on what user selected
    searchQ = "";
    for (var i = 0; i < alcSelect.length; i++) {
      searchQ = searchQ + alcSelect[i] + " ";
    }
    // update parameters
    barHopNumber = $("#crawlLength").val();
    if (barHopNumber == 3) {
      offsetNumBars = 0;
    } else if (barHopNumber == 4) {
      offsetNumBars = 1;
    } else {
      offsetNumBars = 2;
    }
    searchRadius = $("#search-radius").val();
    // convert to meters
    searchRadius = searchRadius * 1.609 * 1000;
    // re-generate bars from the city thats written in the text area
    getCityId($("#textarea2").val());
  });
  if (location.href.includes("/home.html")) {
    // initialize the form select only on home.html
    $("select").formSelect();
    var ourCity = $("#textarea2").val();
    // execute call on the home page, on reload
    getCityId(ourCity);
  } else {
    // else means we are in index.html
    return;
  }
});
