var mapAPIKey = "85e9d3f13d3845e0a0ca48b327bba8c4";

var map = new mapboxgl.Map({
    container: "my-map",
    center: [-118.141136, 34.14622],
    zoom: 15,
    style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${mapAPIKey}`,
});
map.addControl(new mapboxgl.NavigationControl());

map.on("load", function(){
    var mode = "walk"
    // location 1
    var lat1 = "34.14622"
    var long1 = "-118.141136"
    // location 2
    var lat2 = "34.145501"
    var long2 = "-118.149101"

    var routingURL = `https://api.geoapify.com/v1/routing?waypoints=${lat1},${long1}|${lat2},${long2}&mode=${mode}&apiKey=${mapAPIKey}`
    //This commented out link is the working example for reference
    // var routingURL = "https://api.geoapify.com/v1/routing?waypoints=34.150079,-118.144247|34.153289,-118.148936&mode=drive&apiKey=85e9d3f13d3845e0a0ca48b327bba8c4"
    $.ajax({
    method: "GET",
    url: routingURL,

    success: function (response) {
        map.addSource("route", {"type": "geojson", 'data': response});
        map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
        'line-join': 'round',
        'line-cap': 'round'
        },
        'paint': {
        'line-color': '#888',
        'line-width': 8
        }
    });
        console.log(response); // Full Object
        //Calculate distance
        var travelDistance = response.features[0].properties.distance;
        console.log("Travel Distance: " + travelDistance + " metres");

        //Calculate time
        var travelMinutes = (response.features[0].properties.time) % 60
        console.log("Minutes: " + travelMinutes)

    }

    });


});