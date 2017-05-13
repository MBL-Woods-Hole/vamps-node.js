


toggle_metadata = document.getElementById('toggle_metadata') || null;
if (toggle_metadata !== null) {
  toggle_metadata.addEventListener('click', function () {
      toggle_metadata_view();
  });
}


//
// TOGGLE_METADATA_VIEW
//
function toggle_metadata_view()
{
  // page: metadata_table
  // toggles all/selected metadata
  
  var ckbx = document.getElementById('toggle_metadata');
  var load;
  if (ckbx.checked === true) {
          ckbx.checked = true;
          document.getElementById('md_select_phrase1').innerHTML = "Showing All Metadata";
          document.getElementById('md_select_phrase2').innerHTML = "Show Selected Metadata Only?";
          load = 'all'
  } else {
          ckbx.checked = false;
          document.getElementById('md_select_phrase1').innerHTML = "Showing Selected Metadata Only";
          document.getElementById('md_select_phrase2').innerHTML = "Show All Metadata?";
          load = 'selected'
  }

	var xmlhttp = new XMLHttpRequest();  
  xmlhttp.open("GET", '/visuals/partials/load_metadata?load='+load);
  xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState == 4 ) {
           var string = xmlhttp.responseText;
           document.getElementById('metadata_table_div').innerHTML = string;
           new Tablesort(document.getElementById('metadata_table'));
        }
  };
  xmlhttp.send();

}





function create_geospatial() {
      //alert('zoom_level')
     //  geospatial_created = true;
     //  var geo_div = document.getElementById('map-canvas');
      var mapCanvas = document.getElementById('map-canvas');
      mapCanvas.innerHTML = '';
      mapCanvas.style.display = 'block';
      mapCanvas.style.height = '900px';
      
      var loc_data = [];
      var lat_lon_collector = {};
      var pid_collector = {};
      var latlon;
      
      for (var ds in md_local) {
          //ds = md_local[ds]
          //alert(ds)
          pid_collector[ds]       = {}
          pid_collector[ds].pid   = md_local[ds].pid
          pid_collector[ds].value = md_local[ds].value
          var lat = '';
          var lon = '';
          for (var k in md_local[ds]) {
            md_item = k;
            if(md_item == 'latitude') {
              lat = Number(md_local[ds][k]);
              //alert(lat)
            }
            if(md_item == 'longitude'){              
              lon = Number(md_local[ds][k]);
            }    
          } 
          
          if(typeof lat == 'number' && typeof lon == 'number'){
            latlon = lat.toString() +';'+ lon.toString();
            if (latlon in lat_lon_collector) {
              newds = lat_lon_collector[latlon] + ":::" + ds;
              lat_lon_collector[latlon] = newds;
            }else{
              lat_lon_collector[latlon] = ds;
            }            
          }
      }
      var z = 1;

      for(latlon in lat_lon_collector){
        //alert(lat_lon_collector[latlon])
        ds = lat_lon_collector[latlon];
        var latlons =  latlon.split(';');
        loc_data.push([ds, latlons[0], latlons[1], z]);
        z+=1; 

      }
      //alert(loc_data[0][2])
      if (loc_data.length === 0){
          mapCanvas.innerHTML='No Lat-Lon Data Found';

      }else{
        //var center = new google.maps.LatLng(loc_data[0][1],loc_data[0][2]); 
        //alert(center)
        //var mapCanvas = document.getElementById('map-canvas');
        var mapOptions = {
          center : new google.maps.LatLng(0,0),
          zoom   : parseInt(3),
          //zoom: 3, for world view far out
          //zoom 13 for marsh
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(mapCanvas, mapOptions);
        var infowindow =  new google.maps.InfoWindow({
          content: ''
        });

        setMarkers(map, loc_data, pid_collector, infowindow);
      }  
}
//
//
//
function setMarkers(map, loc_data, pid_collector, infowindow) {
  for (var i = 0; i < loc_data.length; i++) {
    // create a marker
   // alert(locations[0])
    var data = loc_data[i];
  //alert(data)
    var myLatLng = new google.maps.LatLng(data[1],data[2]); 
    var marker = new google.maps.Marker({
      //title: data[0],
      position: myLatLng,
      map: map
    });
    
    // add an event listener for this marker
    lines = data[0].split(':::')
    
    // if(lines.length > 10){
    //   var html = "<div style='height:200px;width:300px;overflow:auto;'>";
    // }else{
    //   var html = "<div style='width:300px;'>";
    // }
    // for(l in lines){
    //   var pid = pid_collector[lines[l]].pid;
    //   var val = pid_collector[lines[l]].value;
    //   html += "<a href='/projects/"+pid+"'>" + lines[l] + "</a>"+val.toString()+"<br>"
    // }
    // html += "</div>";


    var html = '';
    html += "<table  class='table table_striped' >"
    html += '<tr><th>Dataset</th><th>'+mditem+'</th></tr>';
    for(l in lines){
      var pid = pid_collector[lines[l]].pid;
      var val = pid_collector[lines[l]].value;
      html += "<tr><td><a href='/projects/"+pid+"'>" + lines[l] + "</a></td><td>"+val+"</td></tr>"
    }
    html += '</table>'
    
    bindInfoWindow(marker, map, infowindow, "<p>"+html+"</p>"); 

  }

}
//
//
//
function bindInfoWindow(marker, map, infowindow, html) { 
  google.maps.event.addListener(marker, 'mouseover', function() { 
    infowindow.setContent(html); 
    infowindow.open(map, marker); 
  }); 
} 

//
// works:
// $(document).ready(function(){
//   event = "E";
//   $('.biome_1').change(function(){
//     custChange.call(this, event);
//   });

var biome_seq_options = {
    "marine": ["none",
    "abyssal",
    "aquatic",
    "basaltic hydrothermal vent",
    "bathyal",
    "benthic",
    "continental margin",
    "estuarine",
    "hadal",
    "marine cold seep biome",
    "neritic",
    "pelagic",
    "polar",
    "ultramafic hydrothermal vent biome"],
    "terrestrial": ["none",
    "aquatic",
    "freshwater lake",
    "freshwater river",
    "large lake biome",
    "polar",
    "subglacial lake"],
    "subterrestrial": ["none",
    "aquatic",
    "endolithic"],
    "subseafloor": ["none",
    "aquatic",
    "benthic",
    "endolithic",
    "sub-seafloor microbial biome"]
  };
  
  var feature_seq_options = {
  "well": ["none",
  "aquifer",
  "marine",
  "oil well",
  "research well",
  "terrestrial",
  "water well"],
  "aquifer": ["none",
  "confined",
  "fracture - geological",
  "fracture - micro",
  "fracture - shear",
  "groundwater",
  "spring",
  "sub-continental",
  "subseafloor",
  "unconfined",
  "water well"]
  };
    
$(document).ready(function(){  
  $('.biome_primary').change(function(){
    populate_secondary_select.call(this, ['biome', biome_seq_options]);
  });
  $('.feature_primary').change(function(){
    populate_secondary_select.call(this, ['feature', feature_seq_options]);
  });
});

function populate_secondary_select(args) {
  alert("this.id");
  alert(this.id);
  alert("arguments");
  
  id_base = arguments[0][0]
  sec_options = arguments[0][1]
  alert(id_base);

  did = this.id.replace(id_base + "_primary", '')
  id2 = id_base + "_secondary"
  var B = document.getElementById(id2+did);
  
  // B = arguments[0];
  //clear out B
  B.length = 0;
  alert("B.id");
  alert(B.id);
  
  // alert('From configureDropDownLists');
  // alert(this.selectedIndex);
  
  
  //get the selected value from A
  var _val = this.options[this.selectedIndex].value;
  alert(_val);
  
  //loop through bOption at the selected value
  for (var i in sec_options[_val]) {
    // alert(i);
    // alert(bOptions[_val][i]);
    //create option tag
    var op = document.createElement('option');
    //set its value
    op.value = sec_options[_val][i];
    // alert(op.value);
    
    //set the display label
    op.text = sec_options[_val][i];
    // alert(op.text);
    //append it to B
    B.appendChild(op);
  }    
}
