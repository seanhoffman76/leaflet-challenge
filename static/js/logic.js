// Define map layers
var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});

var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.dark",
  accessToken: API_KEY
});

var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite-streets",
  accessToken: API_KEY
});

// Create our map, giving it the outdoormap layer to display on load
// Center the map at the intersection of the Equator and Prime Meridian on load
var myMap = L.map("map", {
  center: [
    0, 0
  ],
  zoom: 3,
  layers: [outdoormap]
});

// Define a baseMaps object to hold our base layers
var baseMaps = {
  "Outdoors": outdoormap,
  "Dark": darkmap,
  "Light": lightmap,
  "Satellite": satmap
};

// Create a layer control
// Pass in our baseMaps and overlayMaps
// Add the layer control to the map
var controlLayers = L.control.layers(baseMaps, {}, {collapsed: false}).addTo(myMap);

// Store our USGS API endpoint inside monthQuake to pick up our earthquake data
var monthQuake = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Store our URL for our plate tectonics boundary json
var plateBound = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


//Function to create marker size for earthquakes
function quakeRad(magnitude) {
  return (magnitude/5) * 20;
};

//colors for circles
var palette = ["#cdff52", "#fae058", "#ffca4d", "#fa6453", "#d32919", "#980000"];

//function to return color of circle
function chooseColor(magnitude) {
  if (magnitude < 1) {
    return palette[0];
  }
  else if (magnitude < 2) {
    return palette[1];
  }
  else if (magnitude < 3) {
    return palette[2];
  }
  else if (magnitude < 4) {
    return palette[3];
  }
  else if (magnitude < 5) {
    return palette[4];
  }
  else {
    return palette[5];
  }
};


// Create a GeoJSON layer containing the features array on the earthquakeData object
// Run the onEachFeature function once for each piece of data in the array
// Once we get a response, send the data.features object to the createFeatures function
d3.json(monthQuake, function(quake) {
  earthquakes = L.geoJSON(quake, {
    pointToLayer: function(feature) {
      return L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
          fillColor: chooseColor(+feature.properties.mag),
          color: "black",
          weight: 1.5,
          opacity: 0.8,
          fillOpacity: 0.5,
          radius: quakeRad(+feature.properties.mag)
      })
    },
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    onEachFeature: function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + 
        "</p><hr><p>" + "Magnitude: " + (feature.properties.mag) + "</p>");
      // Set mouse events to change map styling
      layer.on({
          // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to 90% so that it stands out
          mouseover: function(event) {
            layer = event.target;
            layer.setStyle({
              fillOpacity: 0.9
            });
          },
          // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 50%
          mouseout: function(event) {
            layer = event.target;
            layer.setStyle({
              fillOpacity: 0.5
            });
          }
      });
    }
  }).addTo(myMap);
  // Add earthquakes as an overlay to layer control
  controlLayers.addOverlay(earthquakes, "Earthquakes");
});

//Plate boundary / faults overlay
d3.json(plateBound, function(boundary) {
    //create geoJSON layer and add to map
    faults = L.geoJSON(boundary, {
      style: {
          color: "violet",
          weight: 2,
          opacity: 1
      }
  }).addTo(myMap);

  //add as an overlay map
  controlLayers.addOverlay(faults, "Fault Lines");
});

// Create a legend
var legend = L.control({position: 'bottomleft'});
legend.onAdd = function() {
    //create a legend element
    var div = L.DomUtil.create('div', 'info legend');

    //create labels and values to find colors
    var labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
    var grades = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];

    //create legend html
    div.innerHTML = '<div><strong>Legend</strong></div>';
    for(var i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style = "background: ' + chooseColor(grades[i]) + '">&nbsp;</i>&nbsp;&nbsp;'
        + labels[i] + '<br/>';
    };
    return div;
};
//add legend to map
legend.addTo(myMap);