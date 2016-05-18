var stylesArrayMap = [  {    "featureType": "administrative.country",    "elementType": "geometry.stroke",    "stylers": [      { "saturation": -100 },      { "visibility": "off" }    ]  },{    "featureType": "road",    "elementType": "geometry.stroke",    "stylers": [      { "saturation": -100 },      { "weight": 0.5 },      { "visibility": "on" }    ]  },{    "featureType": "landscape",    "stylers": [      { "saturation": -100 },      { "visibility": "simplified" }    ]  },{    "stylers": [      { "saturation": -100 }    ]  },{    "featureType": "landscape.natural",    "elementType": "geometry",    "stylers": [      { "saturation": -100 },      { "lightness": 28 }    ]  },{    "featureType": "road.highway",    "stylers": [      { "saturation": -87 },      { "lightness": 64 }    ]  },{    "featureType": "water",    "stylers": [      { "saturation": -100 },      { "gamma": 0.5 }    ]  },{    "featureType": "poi.park",    "elementType": "geometry",    "stylers": [      { "saturation": -100 },      { "lightness": 82 }    ]  },{    "featureType": "road.arterial",    "elementType": "labels",    "stylers": [      { "visibility": "off" },      { "saturation": 74 }    ]  },{    "featureType": "transit.station.airport",    "elementType": "geometry",    "stylers": [      { "visibility": "on" },      { "saturation": -100 },      { "lightness": -22 },      { "gamma": 0.7 }    ]  },{    "featureType": "landscape",    "stylers": [      { "saturation": -100 }    ]  },{    "featureType": "road",    "elementType": "labels",    "stylers": [      { "lightness": 24 },      { "visibility": "off" },      { "saturation": -100 }    ]  },{    "featureType": "transit.line",    "elementType": "labels.text",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "poi",    "elementType": "labels.icon",    "stylers": [      { "saturation": -100 },      { "gamma": 0.81 }    ]  },{    "featureType": "transit.line",    "stylers": [      { "saturation": -100 },      { "lightness": -4 }    ]  },{    "featureType": "administrative.locality",    "elementType": "labels.text",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "transit.station",    "elementType": "labels.icon",    "stylers": [      { "visibility": "on" },      { "saturation": -100 },      { "gamma": 0.7 }    ]  },{    "featureType": "administrative.province",    "elementType": "geometry",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "administrative.province",    "elementType": "labels.text",    "stylers": [      { "saturation": -100 },      { "gamma": 0.6 }    ]  },{    "featureType": "poi",    "stylers": [      { "saturation": -100 },      { "gamma": 0.96 },      { "visibility": "simplified" }    ]  },{    "featureType": "road.arterial",    "elementType": "labels.icon",    "stylers": [      { "visibility": "off" }    ]  },{    "featureType": "poi",    "elementType": "labels.text",    "stylers": [      { "visibility": "simplified" },      { "lightness": 38 }    ]  }]
var places = [];

var infowindow = null;
var place_id = 0;

var search_markers = [];
var searchwindow = null;
var selected_search_place = null

var directionsRenderers = [];

function initialize() {

  $.ajax({
    type: 'GET',
    cache : false,
    url: 'register_window.txt',
    dataType: 'text',
    success: function(data) {
      infowindow = new google.maps.InfoWindow({
        content: data
      });
    },
    error:function() {
      alert('Failed loading register_window.txt');
    }
  });

  $.ajax({
    type: 'GET',
    cache : false,
    url: 'search_window.txt',
    dataType: 'text',
    success: function(data) {
      searchwindow = new google.maps.InfoWindow({
        content: data
      });
    },
    error:function() {
      alert('Failed loading search_window.txt');
    }
  });

  printRegisteredPlaces();

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 35.011770, lng: 135.768036},
    zoom: 13,
    mapTypeControl: false,
    //disableDoubleClickZoom: true,
    styles: stylesArrayMap,
  });

  directionsDisplay       = new google.maps.DirectionsRenderer({
    map:map,
    polylineOptions:{
      strokeColor:'#ff0000'
    }});

    google.maps.Polyline.prototype.setMap=(function(f,r){

      return function(map){
        if(
          this.get('icons')
          &&
          this.get('icons').length===1
          &&
          this.get('strokeOpacity')===0
          &&
          !this.get('noRoute')
        ){
          if(r.get('polylineOptions')&& r.get('polylineOptions').strokeColor){

            var icons=this.get('icons'),
            color=r.get('polylineOptions').strokeColor;
            icons[0].icon.fillOpacity=1;
            icons[0].icon.fillColor=color;
            icons[0].icon.strokeColor=color;
            this.set('icons',icons);
          }}
          f.apply(this,arguments);
        }

      })(
        google.maps.Polyline.prototype.setMap,
        directionsDisplay);

  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);


  $('#calendar').fullCalendar({
    header: {
      left: 'prev',
      center: 'title',
      right: 'next'
    },
    contentHeight: document.getElementById("calendar").clientHeight-60,
    defaultView: 'agendaDay', //初めの表示内容を指定　内容はこちらを参照→ http://fullcalendar.io/docs/views/Available_Views/
    timezone: 'local',
    allDaySlot: false,
    editable: true,
    forceEventDuration: true,
    displayEventEnd: true,
    longPressDelay: 300,
    droppable: true, // this allows things to be dropped onto the calendar
    eventReceive: function( event ) {
      console.log("eventReceive");
      calcRoute();
    },

    eventDrop: function(event, delta, revertFunc)
    {
      console.log("eventDrop");
      calcRoute();
    },

    eventResize: function(event, delta, revertFunc, jsEvent, ui, view)
    {
      console.log("eventResize");
      calcRoute();
    },

    eventRender: function(event, element) {
      if( event.move == true){
        console.log(event);
        var minutes = ((event.end - event.start)/60000) | 0;
        $(element).html('<span class="map-icon map-icon-walking"></span> '+ minutes + ' minutes');
      }
    },

    eventClick: function (calEvent, jsEvent, view) {
      if( calEvent.move == false ){
        map.setCenter(calEvent.marker.getPosition());
        openInfoWindow(calEvent.place);
      }
      else{
        calEvent.renderer.setMap(null);
        calEvent.renderer.setMap(map);
        calEvent.renderer.preserveViewport = false;
        calEvent.renderer.setDirections(calEvent.direction);
      }
    }

  });

  //$(".fc-head").hide();


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
    var search_marker = new google.maps.Marker({
      map: map,
      //icon: icon,
      title: place.name,
      position: place.geometry.location
    });
    search_marker.addListener('click', function() {
      selected_search_place = this;
      openSearchWindow(this);
    });
    search_markers.push(search_marker);

    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }

    if( search_markers.length == 1 ){
      selected_search_place = search_markers[0];
      openSearchWindow(search_markers[0]);
    }

  });
  map.fitBounds(bounds);
});

openInfoWindow = function(place){
  infowindow.open(map, place["marker"]);

  var input = document.getElementById("btn_place_name");
  input.onfocus = focusInput;

  document.getElementById("selected_place_id").value = place["id"];
  document.getElementById("btn_place_name").value = place["name"];
  document.getElementById("btn_place_description").value = place["description"];
}

openSearchWindow = function(marker){
  infowindow.close();
  searchwindow.open(map, marker);

  document.getElementById("search_title").value = marker.title;
}

pinThisPlace = function(){
  var new_place = addPlace(selected_search_place.title, '', selected_search_place);
  for(var i=0; i<search_markers.length; i++){
    if( search_markers[i] != selected_search_place ) search_markers[i].setMap(null);
  }

  searchwindow.close();
  openInfoWindow(new_place);
}

// クリックイベントを追加
map.addListener('click', function(e) {
  /*
  if( infowindow ){
    infowindow.close();
  }
  */
});

new LongPress(map, 500);
google.maps.event.addListener(map, 'longpress', function(e) {
  var marker = new google.maps.Marker({
    map: map,
    position: e.latLng
  });

  var place = addPlace(null, "", marker );

  marker.addListener('click', function() {
    var place = getPlaceByMarker( marker );
    openInfoWindow(place);
  });

  infowindow.setOptions({ maxWidth: 400 });

  openInfoWindow(place);

});
}

function LongPress(map, length) {
  this.length_ = length;
  var me = this;
  me.map_ = map;
  me.timeoutId_ = null;
  google.maps.event.addListener(map, 'mousedown', function(e) {
    me.onMouseDown_(e);
  });
  google.maps.event.addListener(map, 'mouseup', function(e) {
    me.onMouseUp_(e);
  });
  google.maps.event.addListener(map, 'drag', function(e) {
    me.onMapDrag_(e);
  });
};
LongPress.prototype.onMouseUp_ = function(e) {
  clearTimeout(this.timeoutId_);
  if( clickTimeout == false ){
    if( infowindow ) infowindow.close();
    if( searchwindow ) searchwindow.close();
  }
};
LongPress.prototype.onMouseDown_ = function(e) {
  clearTimeout(this.timeoutId_);
  var map = this.map_;
  clickTimeout = false;

  var event = e;
  this.timeoutId_ = setTimeout(function() {
    clickTimeout = true;
    google.maps.event.trigger(map, 'longpress', event);
  }, this.length_);
};
LongPress.prototype.onMapDrag_ = function(e) {
  clickTimeout = true;
  clearTimeout(this.timeoutId_);
};

function addPlace(name, description, marker) {
  if( name == null ){
    name = "New place #"+place_id;
  }
  places.push( {'id': place_id, 'name': name, 'description': description, 'marker': marker} );
  place_id += 1;
  printRegisteredPlaces();
  return places[places.length-1];
}

function deletePlace(id){
  for(var i=0; i<places.length; i++){
    if( places[i].id == id ){

      $('#calendar').fullCalendar('clientEvents', function(clEvent){
        if( typeof clEvent.place !== "undefined" && clEvent.place.id == places[i].id){
          $('#calendar').fullCalendar('removeEvents',clEvent._id);
        }
      });

      places.splice( i, 1 ) ;
    }
  }
  printRegisteredPlaces();
  calcRoute();
}

function getPlaceById(id){
  for(var i=0; i<places.length; i++){
    if( places[i].id == id ){
      return places[i];
    }
  }
  return null;
}

function getPlaceByMarker(marker){
  for(var i=0; i<places.length; i++){
    if( places[i].marker == marker ){
      return places[i];
    }
  }
  return null;
}

function deleteThisPlace(){
  var id = document.getElementById("selected_place_id").value;
  var place = getPlaceById(id);

  place["marker"].setMap(null);
  deletePlace(id);
}

function placeInfoUpdated(){
  var id = document.getElementById("selected_place_id").value;
  var place = getPlaceById(id);
  place["name"] = document.getElementById("btn_place_name").value;
  place["description"] = document.getElementById("btn_place_description").value;
  printRegisteredPlaces();

  $('#calendar').fullCalendar('clientEvents', function(clEvent){
    if(clEvent.place == place){
      clEvent.title=place["name"];
      $('#calendar').fullCalendar('updateEvent', clEvent);
    }
  });
}

function printRegisteredPlaces(){
  var str = "";
  for(var i=0; i<places.length; i++){
    str += '<div class="fc-event unselected" id="p' + places[i]["id"] + '">' + places[i]["name"] + '<br>\n' + places[i]["description"] + '</div>';
  }
  document.getElementById("registered-places").innerHTML = str;

  $('#external-events .unselected').each(function() {
    var pid = $(this).attr('id').substr(1);
    var place = getPlaceById(pid);
    // store data so the calendar knows to render an event upon drop
    $(this).data('event', {
      title: place["name"], // use the element's text as the event title
      stick: true, // maintain when user navigates (see docs on the renderEvent method)
      'place': place,
      'marker': place["marker"],
      'move': false,
      borderColor: '#ff0000',
      backgroundColor: '#ff0000',
      textColor: '#ffffff',
    });

    // make the event draggable using jQuery UI
    $(this).draggable({
      zIndex: 999,
      scroll: false,
      revert: true,      // will cause the event to go back to its
      revertDuration: 0  //  original position after the drag
    });

  });
}

function calcRoute()
{
  console.log("calcRoute");

  $('#calendar').fullCalendar('clientEvents', function(clEvent){
    if(clEvent.move == true ){
      $('#calendar').fullCalendar('removeEvents',clEvent._id);
    }
  });

  var events = $('#calendar').fullCalendar('clientEvents')

  for (var i = 0; i < directionsRenderers.length; i++) {
    directionsRenderers[i].setMap(null);
  }
  directionsRenderers = [];

  //Sort by event start time
  events.sort(function(a,b){
    if( a._start < b._start ) return -1;
    if( a._start > b._start ) return 1;
    return 0;
  });
  //console.log(events);
  for (var i = 0; i < events.length-1; i++) {
    //console.log( events[i].title + ' ' + events[i]._start );
    new google.maps.DirectionsService().route(
      {
        origin: events[i].marker.getPosition(),
        destination: events[i+1].marker.getPosition(),
        travelMode: google.maps.DirectionsTravelMode.TRANSIT,
        transitOptions: {
          departureTime: new Date(events[i].end),
          routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
        },
      },
      function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          console.log(result);

          var total_duration = 0;
          for (var i = 0; i < result.routes[0].legs.length; i++) {
            total_duration += result.routes[0].legs[i].duration.value;
          }
          console.log(total_duration);

          var directionsRenderer = new google.maps.DirectionsRenderer(
            {
              polylineOptions: {
                strokeColor: '#ff0000',
                strokeWeight: 2,
                strokeOpacity: 0.7
              },
              suppressMarkers : true,
              preserveViewport: true,
            }
          );
          directionsRenderer.setMap(map);
          directionsRenderer.setDirections(result);
          directionsRenderers.push(directionsRenderer);

          var moveEvent = {
            title:'',
            allDay: false,
            start: result.request.transitOptions.departureTime,
            end: new Date(result.request.transitOptions.departureTime.getTime()+total_duration*1000),
            color: '#aaaaaa',
            textColor: '#ffffff',
            move: true,
            direction: result,
            renderer: directionsRenderer,
          };
          $('#calendar').fullCalendar('renderEvent', moveEvent, true );

        }
        else{
          alert ('Failed to get directions');
        }
      }
    );
  }
}

function focusInput(e) {
  if (e) {
    (function(e){
      setTimeout( function() {setFocus(e);});
    })(e);
  }
}

function setFocus(e) {
  if (e) {
    var targetTag = e.target;
    targetTag.focus();
    //とりあえず全選択、選択範囲指定したいときはbgnとendを適宜指定
    var num = targetTag.value.length;
    var bgn = 0;
    var end = num;
    if(typeof(targetTag.selectionStart) != "undefined"){
      targetTag.selectionStart = bgn;
      targetTag.selectionEnd = end;
    } else if(document.selection) {
      var range = targetTag.createTextRange();
      range.collapse();
      range.moveEnd( "character", bgn );
      range.moveStart( "character", end );
      range.select();
    }
  }
}
