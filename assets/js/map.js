var stylesArrayMap = [  {    "featureType": "administrative.country",    "elementType": "geometry.stroke",    "stylers": [      { "saturation": -100 },      { "visibility": "off" }    ]  },{    "featureType": "road",    "elementType": "geometry.stroke",    "stylers": [      { "saturation": -100 },      { "weight": 0.5 },      { "visibility": "on" }    ]  },{    "featureType": "landscape",    "stylers": [      { "saturation": -100 },      { "visibility": "simplified" }    ]  },{    "stylers": [      { "saturation": -100 }    ]  },{    "featureType": "landscape.natural",    "elementType": "geometry",    "stylers": [      { "saturation": -100 },      { "lightness": 28 }    ]  },{    "featureType": "road.highway",    "stylers": [      { "saturation": -87 },      { "lightness": 64 }    ]  },{    "featureType": "water",    "stylers": [      { "saturation": -100 },      { "gamma": 0.5 }    ]  },{    "featureType": "poi.park",    "elementType": "geometry",    "stylers": [      { "saturation": -100 },      { "lightness": 82 }    ]  },{    "featureType": "road.arterial",    "elementType": "labels",    "stylers": [      { "visibility": "off" },      { "saturation": 74 }    ]  },{    "featureType": "transit.station.airport",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "saturation": -100 },      { "lightness": -22 },      { "gamma": 0.7 }    ]  },{    "featureType": "landscape",    "stylers": [      { "saturation": -100 }    ]  },{    "featureType": "road",    "elementType": "labels",    "stylers": [      { "lightness": 24 },      { "visibility": "off" },      { "saturation": -100 }    ]  },{    "featureType": "transit.line",    "elementType": "labels.text",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "poi",    "elementType": "labels.icon",    "stylers": [      { "saturation": -100 },      { "gamma": 0.81 }    ]  },{    "featureType": "transit.line",    "stylers": [      { "saturation": -100 },      { "lightness": -4 }    ]  },{    "featureType": "administrative.locality",    "elementType": "labels.text",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "transit.station",    "elementType": "labels.icon",    "stylers": [      { "visibility": "on" },      { "saturation": -100 },      { "gamma": 0.7 }    ]  },{    "featureType": "administrative.province",    "elementType": "geometry",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "administrative.province",    "elementType": "labels.text",    "stylers": [      { "saturation": -100 },      { "gamma": 0.6 }    ]  },{    "featureType": "poi",    "stylers": [      { "saturation": -100 },      { "gamma": 0.96 },      { "visibility": "simplified" }    ]  },{    "featureType": "road.arterial",    "elementType": "labels.icon",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "poi",    "elementType": "labels.text",    "stylers": [      { "visibility": "simplified" },      { "lightness": 38 }    ]  }]


function initialize() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 35.011770, lng: 135.768036},
    zoom: 13,
    mapTypeControl: false,
    disableDoubleClickZoom: true,
    styles: stylesArrayMap,
  });

  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var search_markers = [];
  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    search_markers.forEach(function(marker) {
      marker.setMap(null);
    });
    search_markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      /*
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
      */

      // Create a marker for each place.
      search_markers.push(new google.maps.Marker({
        map: map,
        //icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

  // クリックイベントを追加
  map.addListener('dblclick', function(e) {
    new google.maps.Marker({
      map: map,
      position: e.latLng
    });
  });
}
