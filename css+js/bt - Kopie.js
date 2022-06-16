// mapbox.com
var mbAttr = 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery &copy; <a href="https://mapbox.com">Mapbox</a>',
	mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';

// openstreetmap.org
var osmAttrib = 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
	osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

var osm2 = L.tileLayer(osmUrl, {attribution: osmAttrib});

// Orthophoto des LAiV M-V (WMS)
var wms_dop_laiv = L.tileLayer.wms("https://www.geodaten-mv.de/dienste/adv_dop", {
    layers: 'mv_dop',
    format: 'image/png',
	transparent: true,
    attribution: '&copy; <a href="https://www.laiv-mv.de/">LAiV_M-V</a> 2021'
});

// kein Hintergrund
var osmAttrib = 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
	osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

var osm_leer = L.tileLayer(osmUrl, {attribution: osmAttrib, opacity: 0.0});

var none = L.tileLayer.wms(" ", {
    layers: 'none',
    format: 'image/png',
	transparent: true,
	crs: 4326
});

// Öffnen der Anfangskarte
var map = L.map('map', {
	center: [53.50, 13.18],
	zoom: 12,
	layers: [osm2]
});

//neu
map.createPane('markers');
map.getPane('markers').style.zIndex = 100;
map.createPane('areas');
map.getPane('areas').style.zIndex = 200;

// Punkte der Bildkarten in GeoJSON-Format
var geojsonMarkerOptions = {
	radius: 6,
	color: "#f00",
	opacity: 1,
	weight: 1,
	fillColor: "#f00",
	fillOpacity: 1
};

var geojsonMarkerOptionsEmpty = {
	fill: false,
	stroke: false
};

function onEachFeature(feature, layer) {
	if (feature.properties && feature.properties.place) {
		html_content = "<b>" + feature.properties.place + "</b><br/>";
		
		if (feature.properties.text) {
		  html_content +=  feature.properties.text + "<br/>";
		}

		if (feature.properties.link) {
		  link_feature = feature.properties.link;
		  html_content +=  link_feature.link(feature.properties.link) + "<br/>";
		}
		
		if (feature.properties.Actionbound) {
		  ab_feature = feature.properties.Actionbound;
		  html_content +=  ab_feature.link(feature.properties.Actionbound) + "<br/>";
		}
		
		if (feature.properties.copyright) {
		  html_content += "<cp>&#0169 " + feature.properties.copyright + "</cp><br/>";
		}
		
		var imgname = feature.properties.file;
				
		html_content += "<a href='./pictures/"  + imgname + ".jpg' target='_blank'><img src='./pictures/" + imgname + ".jpg' width=200px onerror='this.src=\"./pictures/0.jpg\"; this.style.display = \"none\";'/></a>";

		layer.bindPopup(L.popup({maxWidth:200}).setContent(html_content, { autoPan: true}));
		layer.bindLabel(feature.properties.place, { className: "myLabel", noHide: false});
	}
}

var geojsonLayer = L.geoJson(touripunkte, {
	pointToLayer: function (feature, latlng) {
    geojsonMarkerOptions.color = feature.geometry.color;
    geojsonMarkerOptions.fillColor = feature.geometry.color;
		return L.circleMarker(latlng, geojsonMarkerOptions);
	},
	onEachFeature: onEachFeature
}).addTo(map);

var geojsonLabel = L.geoJson(touripunkte, {
	pointToLayer: function (feature, latlng) {
		return L.circleMarker(latlng, geojsonMarkerOptionsEmpty);
	},
	onEachFeature: function (feature, layer) {
		layer.bindLabel(feature.properties.place, { className: "myLabel", noHide: true});
	}
}).addTo(map);


// Layer Control
var baseLayers = {
	"OpenStreetMap": osm2,
	"Orthophoto": wms_dop_laiv,
 	"Kein Hintergrund": osm_leer
};
var overlays = {
	"Beschriftung": geojsonLabel
}
L.control.layers(baseLayers, overlays).addTo(map);


var polyline = L.polyline(touriwege, {color: 'red', weight: 1}).addTo(map);
var polyline2 = L.polyline(touriwege2, {color: 'blue', weight: 1}).addTo(map);
var polyline3 = L.polyline(touriwege3, {color: 'green', weight: 1}).addTo(map);
var polygon = L.polygon(gedenkflaechen, {color: "#ff6600", stroke: false, fillOpacity: 0.7, pane: 'areas'}).addTo(map);


// ------------------------------------------------------------------
// Legende

function getColor(d) {
         return d == 'Kultur' ? "#005080" :
                d == 'Gedenkst&#228tten' ? "#d06050" :
                d == 'Denkm&#228ler' ? "#32cccc" :
                d == 'Kirchen' ? "#f0d060" :
                d == 'Gutsh&#228user' ? "#a0d0f0" :
                d == 'Theater und Kunst' ? "#700070" :
                d == 'Freizeit' ? "#70a030" :
                d == 'Hotels und Gastst&#228tten' ? "#e02010" :
                d == 'Werkst&#228tten' ? "#b05010" :
                d == 'L&#228den' ? "#f0f0a0" :
                d == 'Infrastruktur' ? "#e0e030" :
				d == '-----------------------' ? 'white' :
				d == 'Wanderwege' ? 'green' :
                d == 'Radwege' ? 'red' :
                d == 'Pilgerwege' ? 'blue' :
				"#000000";
     }
	 
var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (map) {
	
    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Legende</strong><br>' + 'Hintergrundkarte und Beschriftung:' + '<br>' + 'siehe Symbol oben rechts'],
    categories = ['Kultur','Gedenkst&#228tten','Denkm&#228ler','Kirchen','Gutsh&#228user','Theater und Kunst','Freizeit','Hotels und Gastst&#228tten','Werkst&#228tten','L&#228den','Infrastruktur','-----------------------','Wanderwege','Pilgerwege','Radwege'];

    for (var i = 0; i < categories.length; i++) {

            div.innerHTML += 
            labels.push(
                '<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' +
            (categories[i] ? categories[i] : '+'));

        }
        div.innerHTML = labels.join('<br>');
    return div;
    };
    legend.addTo(map);
		
//function getColor(d) {
//         return d == 'Kultur' ? "#005080" :
//                d == 'Gedenkst&#228tten' ? "#d06050" :
//                d == 'Denkm&#228ler' ? "#32cccc" :
//                d == 'Kirchen' ? "#f0d060" :
//                d == 'Gutsh&#228user' ? "#a0d0f0" :
//                d == 'Theater und Kunst' ? "#700070" :
//                d == 'Freizeit' ? "#70a030" :
//                d == 'Hotels und Gastst&#228tten' ? "#e02010" :
//                d == 'Werkst&#228tten' ? "#b05010" :
//                d == 'L&#228den' ? "#f0f0a0" :
//                d == 'Infrastruktur' ? "#e0e030" :                         "#000000";
//     }
	 
//	 function getColor2(d2) {
//         return d2 == 'Gr&#252ne Runde' ? 'green' :
//                d2 == 'Radwege' ? 'red' :
//                d2 == 'Radwanderrouten' ? 'blue' :
//                d2 == 'Mecklenburger Seenrunde' ? "#c6b80f" :                   "#000000";
//     }
	
//var legend = L.control({position: 'bottomleft'});
//    legend.onAdd = function (map) {
	
//    var div = L.DomUtil.create('div', 'info legend');
//    labels = ['<strong>Legende</strong>'],
//    categories = ['Kultur','Gedenkst&#228tten','Denkm&#228ler','Kirchen','Gutsh&#228user','Theater und Kunst','Freizeit','Hotels und Gastst&#228tten','Werkst&#228tten','L&#228den','Infrastruktur'];

//    for (var i = 0; i < categories.length; i++) {

//            div.innerHTML += 
//            labels.push(
//                '<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' +
//            (categories[i] ? categories[i] : '+'));

//        }
//        div.innerHTML = labels.join('<br>');
//    return div;
//    };
//    legend.addTo(map);
	
//	var div2 = L.DomUtil.create('div', 'info legend');
//    labels2 = ['<strong>Wege</strong>'],
//    categories2 = ['Gr&#252ne Runde','Radwege','Radwanderrouten','Mecklenburger Seenrunde'];

//    for (var i = 0; i < categories2.length; i++) {

//            div.innerHTML += 
//            labels2.push(
//                '<i class="circle" style="background:' + getColor2(categories2[i]) + '"></i> ' +
//            (categories2[i] ? categories2[i] : '+'));

//        }
//        div.innerHTML = labels2.join('<br>');
//    return div;
//    };
//    legend.addTo(map);
