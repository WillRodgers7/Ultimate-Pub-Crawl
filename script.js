// displays info received from Zomato API
var displayResults = $(".results");
// global vars
var barHopNumber = 3; //start with 3 bars minimum
// will need an offset number for number of bars wanted after filter/updated user parameters
// 0 for 3 spots, 1 for 4 spots, 2 for 5 spots
var offsetNumBars = 0; // it'll be reassigned once you update filter parameters

// will variable to hold city from index to pass into home.html
var city;
// lets do a search query instead with the keywords, bar, brewery, winery, pub..
var searchQ = "bar"; // initialize to bar
var searchRadius = 1500; // initialize call to 5000m or 5 km
var mainCityLat; // grabbed lat and long from first api call
var mainCityLong;
var midpoint; // holds calculated midpoint
var totalDistanceInKm; // holds total distance of generated route; used for custom zoom.
var mapAPIKey = "85e9d3f13d3845e0a0ca48b327bba8c4";
var mode = "walk";
var routingURL; // global var holding the dynamic ROUTING API CALL

var instanceSelect;
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

  console.log("new longitude: " + long3 + ", new latitude: " + lat3);
  // returns coords as an array
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

function howManyBars(randomizedArray) {
  if (barHopNumber == 3) {
    var long1 = randomizedArray[0].restaurant.location.longitude;
    var lat1 = randomizedArray[0].restaurant.location.latitude;

    // middle bars
    var middleLong1 = randomizedArray[1].restaurant.location.longitude;
    var middleLat1 = randomizedArray[1].restaurant.location.latitude;

    var long2 = randomizedArray[2].restaurant.location.longitude;
    var lat2 = randomizedArray[2].restaurant.location.latitude;
    // adding another point; 3 points minimum

    // midpoint will be an array; [lat, long]
    midpoint = midpointCalculator(long1, lat1, long2, lat2);
    console.log(
      "outside of the midpoint call function with 3 bars ===== " + midpoint
    );
    // calculate distance from the endpoints
    totalDistanceInKm = getDistanceFromLatLonInKm(
      lat1,
      long1,
      middleLat1,
      middleLong1
    );
    totalDistanceInKm =
      totalDistanceInKm +
      getDistanceFromLatLonInKm(middleLat1, middleLong1, lat2, long2);
    console.log("distance in km: " + totalDistanceInKm);
    routingURL = `https://api.geoapify.com/v1/routing?waypoints=${lat1},${long1}|${middleLat1},${middleLong1}|${lat2},${long2}&mode=${mode}&apiKey=${mapAPIKey}`;
  } else if (barHopNumber == 4) {
    // 4 bars _____________________________________________________
    // first bar
    var long1 = randomizedArray[0].restaurant.location.longitude;
    var lat1 = randomizedArray[0].restaurant.location.latitude;

    // middle bars
    var middleLong1 = randomizedArray[1].restaurant.location.longitude;
    var middleLat1 = randomizedArray[1].restaurant.location.latitude;
    var middleLong2 = randomizedArray[2].restaurant.location.longitude;
    var middleLat2 = randomizedArray[2].restaurant.location.latitude;

    // last bar
    var long2 = randomizedArray[2].restaurant.location.longitude;
    var lat2 = randomizedArray[2].restaurant.location.latitude;

    midpoint = midpointCalculator(long1, lat1, long2, lat2);
    console.log(
      "outside of the midpoint call function with 4 bars ===== " + midpoint
    );
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
    // _____________________________________________________
    // barhopNumber == 5
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
    console.log(
      "outside of the midpoint call function with 5 bars ===== " + midpoint
    );
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

// begin recursive ajax calls. Get lat and long of user input city ---> Search query using the searchQ/lat/long/searchRadius/ ---> call Maps API
function getCityId(cityName) {
  console.log(cityName);
  var apiKey = "2f0db10ea057aa7670716496e756f590";
  // limits to one possible result, the main city
  var queryU =
    "https://developers.zomato.com/api/v2.1/locations?query=" +
    cityName +
    "&count=1";

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
      console.log("right before search API call...");
      console.log("updated searchQ: " + searchQ);
      console.log("updated search radius: " + searchRadius);
      mainCityLat = response.location_suggestions[0].latitude;
      mainCityLong = response.location_suggestions[0].longitude;
      // -----------------------------------------------------------------------
      // search Q  is dynamic depending on filter settings
      queryU =
        "https://developers.zomato.com/api/v2.1/search?q=" +
        searchQ +
        "&lat=" +
        mainCityLat +
        "&lon=" +
        mainCityLong +
        "&radius=" +
        searchRadius;
      console.log("search radius is ======= " + searchRadius);

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

          for (var i = 0; i < randomResArray.length; i++) {
            // changed from const to var; renames to thisRestaurant
            var thisRestaurant = randomResArray[i].restaurant;
            var establishment = thisRestaurant.establishment[0];
            var name = thisRestaurant.name;
            var reviews = thisRestaurant.user_rating.aggregate_rating;
            var cost = thisRestaurant.average_cost_for_two;
            var hours = thisRestaurant.timings;
            var address = thisRestaurant.location.address;

            console.log("name of this restaurant in for loop: " + name);

            $(".card-title").text(name);
            var addLi = $("<li>").text("Address: " + address);
            $(".list").append(addLi);
          }

          // count how many bars there are and run distance/midpoint calculations based on that
          // this function could also build the MAP query string
          howManyBars(randomResArray);
          console.log("this is after the howManyBars() call");
          console.log(randomResArray);

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
          console.log("conditional zoom: " + customZoom);

          // MAP API STUFF GOES HERE, another AJAX call
          // change the center to be one of the locations
          var map = new mapboxgl.Map({
            container: "my-map",
            center: midpoint,
            zoom: customZoom,
            style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${mapAPIKey}`,
          });
          map.addControl(new mapboxgl.NavigationControl());

          map.on("load", function () {
            console.log("this is right before nested MAPS api call.....");
            $.ajax({
              method: "GET",
              url: routingURL,

              success: function (result) {
                map.addSource("route", {
                  type: "geojson",
                  data: result,
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
                    "line-color": "#4DDBFF",
                    "line-width": 7,
                  },
                });
                // Script for loading geojson bar points!!!
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

                // {
                //   type: 'Feature',
                //   geometry: {
                //     type: 'Point',
                //     coordinates: [randomResArray[1].restaurant.location.longitude, randomResArray[1].restaurant.location.latitude]
                //   },
                //   properties: {
                //     title: randomResArray[1].restaurant.name,
                //     description: randomResArray[1].restaurant.timings
                //   }
                // }]
                // };

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
                console.log("Map Object:");
                console.log(result); // Full Object; map
                console.log("Restaurants displayed");
                console.log(randomResArray);
                console.log("Restaurants Object: ");
                console.log(response); //Full Object; should be restaurants
              },
            });
          });
        },
      });
    },
  });
}

// prelim submit function
$("#userForm").on("submit", function (event) {
  event.preventDefault();
  if (location.href.includes("/index.html")) {
    city = $("#textarea1").val().trim();
  } else if (location.href.includes("/home.html")) {
    city = $("#textarea2").val().trim();
  }
  localStorage.setItem("currentCity", city);
  console.log("Submitted city: " + city);
  if (city == "") {
    return;
  } else {
    // Connecting Index and Home Page (Begining)
    // when we submit, if we are in index...then go to home page.
    // but if we are in home.html (else), then run the getcityID script! prevents page from reloading completely
    if (location.href.includes("/index.html")) {
      window.location.href = "./home.html";
    } else {
      // update number of bars
      barHopNumber = $("#crawlLength").val();
      if (barHopNumber == 3) {
        offsetNumBars = 0;
      } else if (barHopNumber == 4) {
        offsetNumBars = 1;
      } else {
        offsetNumBars = 2;
      }
      getCityId(city);
    }
  }
});
// Connecting Index and Home Page (End)

// Side bar nav start
document.addEventListener("DOMContentLoaded", function () {
  var elems = document.querySelectorAll(".sidenav");
  var instances = M.Sidenav.init(elems, {});
});

// Initialize collapsible (uncomment the lines below if you use the dropdown variation)
var collapsibleElem = document.querySelector(".collapsible");
var collapsibleInstance = M.Collapsible.init(collapsibleElem, {});

// initialize form select
// document.addEventListener("DOMContentLoaded", function () {
//   var elems = document.querySelectorAll("select");
//   instanceSelect = M.FormSelect.init(elems, options);
// });

// get locally stored city every time we load page
$("#textarea2").val(localStorage.getItem("currentCity"));
// getCityId($("#textarea2").val());

//Side bar nav end
// nav bar drop downs start

$(document).ready(function () {
  // initialize our forms
  $("select").formSelect();
  // $("#crawlLength").formSelect();

  $("#generateBtn").on("click", function (event) {
    event.preventDefault();
    console.log("hey yaaaaaaaaaaaa");
    var instance = M.FormSelect.getInstance($("#alcoholType"));
    // changed into a global
    alcSelect = instance.getSelectedValues();
    console.log(alcSelect);
    // var instance2 = M.FormSelect.getInstance($("#crawlLength"));
    // var lengthSelect = instance2.getSelectedValues();

    console.log($("#crawlLength").val());

    searchQ = "";
    for (var i = 0; i < alcSelect.length; i++) {
      searchQ = searchQ + alcSelect[i] + " ";
    }
    console.log("searchQ = " + searchQ);
    barHopNumber = $("#crawlLength").val();
    if (barHopNumber == 3) {
      offsetNumBars = 0;
    } else if (barHopNumber == 4) {
      offsetNumBars = 1;
    } else {
      offsetNumBars = 2;
    }

    console.log(
      "barHopNumber = " + barHopNumber + " and offset = " + offsetNumBars
    );

    searchRadius = $("#search-radius").val();

    // convert to meters
    searchRadius = searchRadius * 1.609 * 1000;
    console.log("search radius from slider = " + searchRadius);
    console.log($("#textarea2").val());
    getCityId($("#textarea2").val());
  });

  console.log(location.href + " askldmfklahsdf");
  // var stringURL = (location.href).toString
  // $(".sidenav").sidenav();
  if (location.href.includes("/home.html")) {
    console.log("OMMMMGGGGGGGGGGGGGGGGG");
    // var cityGrab = document.getElementById("currentCity");
    // cityGrab.textContent = `Your Current City Is: ${city}`;
    var ourCity = $("#textarea2").val();
    // execute call on the home page
    console.log(ourCity);
    getCityId(ourCity);
  } else {
    return;
  }
});
// nav bar drop downs end

// nav bar slider start

var slider = document.getElementById("test-slider");
noUiSlider.create(slider, {
  start: [20, 80],
  connect: true,
  step: 1,
  orientation: "horizontal", // 'horizontal' or 'vertical'
  range: {
    min: 0,
    max: 100,
  },
  //  format: wNumb({
  //    decimals: 0
  //  })
});

// nav bar slider end

// generate button
// $("#generateBtn").on("click", function (event) {
//   event.stopPropagation();
//   console.log("hey yaaaaaaaaaaaa");
//   event.preventDefault();
//   console.log("hey yaaaaaaaaaaaa");

//   // var alcSelect = instanceSelect.get
//   var instance = M.FormSelect.getInstance($("select"));
//   var alcSelect = instance.getSelectedValues();
//   console.log("this is the alc selections: " + alcSelect);
// });
