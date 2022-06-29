// DEFINE THE TILE LAYERS
// first define layer properties
var layerProperties = {"url" : "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
                        "attribution" : "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
                        "zoom": 18 }

// Light Map
var lightMap = L.tileLayer(layerProperties.url, {
attribution: layerProperties.attribution,
maxZoom: layerProperties.zoom,
id: "light-v10",
accessToken: API_KEY
});

// Create BASE and OVERLAYS 
var baseMaps = {
    "Light Map": lightMap,
    };

// CREATE THE MAP
var myMap = L.map("map", {
    center: [28.5994, -8.6731],
    zoom: 3,
    layers: [lightMap],
});

// Pass map layers into layer control and add layer control to map
L.control.layers(baseMaps).addTo(myMap);