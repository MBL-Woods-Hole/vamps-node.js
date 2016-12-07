// search.js
// $('.selectpicker').selectpicker();
// $(document).ready(function(){
//     $('a.back').click(function(){
//         parent.history.back();
//         return false;
//     });
// });
// document.getElementById("livesearch_result_div").value = '';
// document.getElementById("create_fasta_hidden_id").value = ''
// document.getElementById("find_datasets_hidden_id").value = ''
// document.getElementById("find_datasets_btn").disabled=true;
// document.getElementById("create_fasta_btn").disabled=true;

var metadata_search_range_div1 = document.getElementById('metadata_search_range_div1') || null;
var metadata_search_field1 = document.getElementById('field1_metadata_search') || null;
var metadata_search_range_div2 = document.getElementById('metadata_search_range_div2') || null;
var metadata_search_field2 = document.getElementById('field2_metadata_search') || null;
var metadata_search_range_div3 = document.getElementById('metadata_search_range_div3') || null;
var metadata_search_field3 = document.getElementById('field3_metadata_search') || null;
var search_metadata_activate_btn2 = document.getElementById('search_metadata_activate_btn2') || null;
var search_metadata_activate_btn3 = document.getElementById('search_metadata_activate_btn3') || null;
var search_metadata_btn = document.getElementById('search_metadata_btn') || null;

if (search_metadata_btn !== null) {
  search_metadata_btn.addEventListener('click', function () {
	  var form = document.getElementById('metadata_search_form');
	  var search1_comparison = document.getElementById('search1_comparison');
	  //alert(search1_comparison.value);

	  form.submit();

  });
}

if (search_metadata_activate_btn2 !== null) {
  search_metadata_activate_btn2.addEventListener('click', function () {

	if(metadata_search_field2.disabled === true){

	  metadata_search_field2.disabled = false;
    }else{
      metadata_search_field2.disabled = true;
    }

  });
}
if (search_metadata_activate_btn3 !== null) {
  search_metadata_activate_btn3.addEventListener('click', function () {
    if(metadata_search_field3.disabled === true){
      metadata_search_field3.disabled = false;
    }else{
      metadata_search_field3.disabled = true;
    }
  });
}



var selection_choices = ['equal_to','less_than','greater_than','not_equal_to','between_range','outside_range'];

if (metadata_search_field1 !== null) {
  metadata_search_field1.addEventListener('change', function () {
      var item = metadata_search_field1.value;
      if(item == 'NONE'){
        metadata_search_range_div1.style.display    = "none";
      }else{
        var html = "";
        if(Array.isArray(mi_local[item])){
          //html += "<br>";
          for(var i in mi_local[item]){
            val = mi_local[item][i];
            name = 'search1_data_'+item+'[]';
            html += " <input type='checkbox' id='"+val+"' name='"+name+"' value='"+val+"' >&nbsp;"+val;
            //html += " <input type='checkbox' id='"+val+"' name='data[]' value='"+val+"' onclick=\"save_value1(this.value,'"+item+"')\" >"+val;
          }
        }else{
          var min = mi_local[item].min;
          var max = mi_local[item].max;
          var range = max - min;
          if(range > 1){
            range = Math.ceil(max) - Math.floor(min);
          }

          html += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Values Min: "+min+" Max: "+max;
          //html += " -->> Select range to search: "+range

          html += "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-->> Select Comparison:";

          html += " <select id='search1_comparison' name='search1_comparison' onchange=\"change_comparison(this.value,'1')\" >";
          for (var y in selection_choices) {
			       html += "      <option class='' value='"+selection_choices[y]+"'>"+selection_choices[y]+"</option>";
          }
          html += "</select> ";
          html += "<div id='input1_comparison'> ";
          html += " Enter: <input type='text' id='' name='search1_single-comparison-value' value='' maxlength='10' size='10' > (numeric only)";
          html += "</div>";

        }
        //html += "<br><input type='button' value='Search Datasets' >"
        metadata_search_range_div1.innerHTML        = html;
        metadata_search_range_div1.style.display    = "block";
        metadata_search_range_div1.style.background = "#C0C0C0";
        metadata_search_range_div1.style.padding    = "3px";
        metadata_search_range_div1.style.width      = "95%";
        document.getElementById('search_metadata_btn').disabled    = false;
      }
  });
}

//
if (metadata_search_field2 !== null) {
  metadata_search_field2.addEventListener('change', function () {
      var item = metadata_search_field2.value;
      if(item == 'NONE'){
        metadata_search_range_div2.style.display    = "none";
      }else{
        var html = "";
        if(Array.isArray(mi_local[item])){
          //html += "<br>";
          for (var i in mi_local[item]){
            val = mi_local[item][i];
            name = 'search2_data_'+item+'[]';
            html += " <input type='checkbox' id='"+val+"' name='"+name+"' value='"+val+"' >&nbsp;"+val;
          }
        }else{
          var min = mi_local[item].min;
          var max = mi_local[item].max;
          var range = max - min;
          if(range > 1){
            range = Math.ceil(max) - Math.floor(min);
          }

          html += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Values Min: "+min+" Max: "+max;
          //html += " -->> Select range to search: "+range

          html += "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-->> Select Comparison:";

          html += " <select id='search2_comparison' name='search2_comparison' onchange=\"change_comparison(this.value,'2')\" >";
          for(var x in selection_choices) {
            html += "      <option class='' value='"+selection_choices[x]+"'>"+selection_choices[x]+"</option>";
          }
          html += "</select> ";
          html += "<div id='input2_comparison'> ";
          html += " Enter: <input type='text' id='' name='search2_single-comparison-value' value='' maxlength='10' size='10' > (numeric only)";
          html += "</div>";

        }
        //html += "<br><input type='button' value='Search Datasets' >"
        metadata_search_range_div2.innerHTML        = html;
        metadata_search_range_div2.style.display    = "block";
        metadata_search_range_div2.style.background = "#C0C0C0";
        metadata_search_range_div2.style.padding    = "3px";
        metadata_search_range_div2.style.width      = "95%";
        document.getElementById('search_metadata_btn').disabled    = false;
      }
  });
}
//
if (metadata_search_field3 !== null) {
  metadata_search_field3.addEventListener('change', function () {
      var item = metadata_search_field3.value;
      if(item == 'NONE'){
        metadata_search_range_div3.style.display    = "none";
      }else{
        var html = "";
        if(Array.isArray(mi_local[item])){
          //html += "<br>";
          for (var i in mi_local[item]){
            val = mi_local[item][i];
            name = 'search3_data_'+item+'[]';
            html += " <input type='checkbox' id='"+val+"' name='"+name+"' value='"+val+"' >&nbsp;"+val;
          }
        }else{
          var min = mi_local[item].min;
          var max = mi_local[item].max;
          var range = max - min;
          if(range > 1){
            range = Math.ceil(max) - Math.floor(min);
          }

          html += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Values Min: "+min+" Max: "+max;
          //html += " -->> Select range to search: "+range

          html += "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-->> Select Comparison:";

          html += " <select id='search3_comparison' name='search3_comparison' onchange=\"change_comparison(this.value,'3')\" >";
          for (var z in selection_choices) {
            html += "      <option class='' value='"+selection_choices[z]+"'>"+selection_choices[z]+"</option>";
          }
          html += "</select> ";
          html += "<div id='input3_comparison'> ";
          html += " Enter: <input type='text' id='' name='search3_single-comparison-value' value='' maxlength='10' size='10' > (numeric only)";
          html += "</div>";
        }
        //html += "<br><input type='button' value='Search Datasets' >"
        metadata_search_range_div3.innerHTML        = html;
        metadata_search_range_div3.style.display    = "block";
        metadata_search_range_div3.style.background = "#C0C0C0";
        metadata_search_range_div3.style.padding    = "3px";
        metadata_search_range_div3.style.width      = "95%";
        document.getElementById('search_metadata_btn').disabled    = false;
      }
  });
}
//
//
//
function change_comparison(comparison, item){
    var comparison_input;
    var minval;
    var maxval;
    var oneval;

  if(item==1){
    comparison_input = document.getElementById('input1_comparison');
    minval = 'search1_min-comparison-value';
    maxval = 'search1_max-comparison-value';
    oneval = 'search1_single-comparison-value';
  }else if(item==2){
    comparison_input = document.getElementById('input2_comparison');
    minval = 'search2_min-comparison-value';
    maxval = 'search2_max-comparison-value';
    oneval = 'search2_single-comparison-value';
  }else if(item==3){
    comparison_input = document.getElementById('input3_comparison');
    minval = 'search3_min-comparison-value';
    maxval = 'search3_max-comparison-value';
    oneval = 'search3_single-comparison-value';
  }

  var html;
  if(comparison == selection_choices[4] || comparison == selection_choices[5]){  // inside or outside range
    html = " Enter Min: <input type='text' id='' name='"+minval+"' value='' maxlength='10' size='7' >";
    html += "  Max: <input type='text' id='' name='"+maxval+"' value='' maxlength='10' size='7' > (numeric only)";
    comparison_input.innerHTML = html;
  }else{  // single value
    html = " Enter: <input type='text' id='' name='"+oneval+"' value='' maxlength='10' size='10' > (numeric only)";
    comparison_input.innerHTML = html;
  }

}
//
//
//
function showMetadataHint(str) {
    var html='';
	if (str.length == 0) {
        document.getElementById("txtHint").innerHTML = "";
        return;
    } else {
	    var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                //var response = xmlhttp.responseText;

				var response = xmlhttp.responseText;
				if(response == 'No Suggestions'){
					html = response;
				}else{
				    var items = response.split('--');

       	            html += "<div class='my_custom_dropdown' >";

                    html += "<ul class='' >";
                    for(i in items){
                 	   html += "<li ><a role=\"menuitem\" tabindex=\"-1\" href='metadata_name/"+items[i]+"' >"+items[i]+"</a></li>";
                    }
                    html += "</ul>";
                    html += "</div>";
				    //html = "<div>my div</div>"
					//alert(html)
				}
				//alert('here '+html)
				document.getElementById("txtHint").innerHTML = html;

            }
        }
        xmlhttp.open("GET", "gethint/" + str, true);
        xmlhttp.send();
    }
}
//
//  SHOW  RESULTS for Taxonomy Search
//
function showTaxResult(str) {

  var find_datasets_btn = document.getElementById("find_datasets_btn") || null;
  var create_fasta_btn = document.getElementById("create_fasta_btn") || null;
  if (str.length==0) {
    document.getElementById("livesearch_taxonomy").innerHTML="";
    document.getElementById("livesearch_taxonomy").style.border="0px";
    document.getElementById("livesearch_taxonomy").style.height="0";
    document.getElementById("livesearch_result_div").value = ''
    if(find_datasets_btn != null){
      document.getElementById("find_datasets_btn").disabled=true;
      document.getElementById("find_datasets_hidden_id").value = ''
    }
    if(create_fasta_btn != null){
      document.getElementById("create_fasta_btn").disabled=true;
      document.getElementById("create_fasta_hidden_id").value = ''
    }
    document.getElementById("livesearch_tax_dropdown").style.visibility='hidden';
    return;
  }else{
    if(find_datasets_btn != null){
      document.getElementById("find_datasets_btn").disabled=false;
    }
    if(create_fasta_btn != null){
      document.getElementById("create_fasta_btn").disabled=false;
    }
    document.getElementById("livesearch_tax_dropdown").style.visibility='visible';
  }
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
      document.getElementById("livesearch_taxonomy").innerHTML=xmlhttp.responseText;
      document.getElementById("livesearch_taxonomy").style.border="1px solid #A5ACB2";
      document.getElementById("livesearch_taxonomy").style.height="200px";
      document.getElementById("livesearch_taxonomy").style.width="500px";
      document.getElementById("livesearch_taxonomy").style.overflow="auto";
    }
  }
  xmlhttp.open("GET","/search/livesearch_taxonomy/"+str,true);
  xmlhttp.send();
}
//
//  SHOW  RESULTS for User Search
//
function showUserResult(str) {
  if (str.length==0) {
    document.getElementById("livesearch_user").innerHTML="";
    document.getElementById("livesearch_user").style.border="0px";
    document.getElementById("livesearch_user").style.height="0";
    document.getElementById("livesearch_user_dropdown").style.visibility='hidden';
    //document.getElementById("livesearch_result_div").value = ''
    //document.getElementById("find_datasets_btn").disabled=true;
    //document.getElementById("create_fasta_btn").disabled=true;
    //document.getElementById("create_fasta_hidden_id").value = ''
    //document.getElementById("find_datasets_hidden_id").value = ''
    return;
  }else{
    //document.getElementById("find_datasets_btn").disabled=false;
    //document.getElementById("create_fasta_btn").disabled=false;
    document.getElementById("livesearch_user_dropdown").style.visibility='visible';
  }
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
      document.getElementById("livesearch_user").innerHTML=xmlhttp.responseText;
      document.getElementById("livesearch_user").style.border="1px solid #A5ACB2";
      document.getElementById("livesearch_user").style.height="200px";
      document.getElementById("livesearch_user").style.width="500px";
      document.getElementById("livesearch_user").style.overflow="auto";
    }
  }
  xmlhttp.open("GET","livesearch_user/"+str,true);
  xmlhttp.send();
}
//
//  SHOW  RESULTS for Project Search
//
function showProjectResult(str) {
  //alert(str)
  if (str.length==0) {
    document.getElementById("livesearch_project").innerHTML="";
    document.getElementById("livesearch_project").style.border="0px";
    document.getElementById("livesearch_project").style.height="0";
    document.getElementById("livesearch_project_dropdown").style.visibility='hidden';
    return;
  }else{
    //document.getElementById("find_datasets_btn").disabled=false;
    //document.getElementById("create_fasta_btn").disabled=false;
    document.getElementById("livesearch_project_dropdown").style.visibility='visible';
  }
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange=function() {
    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
      document.getElementById("livesearch_project").innerHTML=xmlhttp.responseText;
      document.getElementById("livesearch_project").style.border="1px solid #A5ACB2";
      document.getElementById("livesearch_project").style.height="200px";
      document.getElementById("livesearch_project").style.width="500px";
      document.getElementById("livesearch_project").style.overflow="auto";
    }
  }
  xmlhttp.open("GET","livesearch_project/"+str,true);
  xmlhttp.send();
}
//
//
//
function get_tax_str(taxon,rank){

	var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          document.getElementById("find_datasets_btn").disabled=false;
          document.getElementById("create_fasta_btn").disabled=false;
          var response = xmlhttp.responseText;
          var tmp = JSON.parse(response);
          document.getElementById("livesearch_result_div").value = tmp.full_string;
          document.getElementById("create_fasta_hidden_id").value = tmp.full_string;
          document.getElementById("find_datasets_hidden_id").value = tmp.full_string;
        }
    }
    xmlhttp.open("GET", "livesearch_taxonomy/" + rank+'/'+taxon, true);
    xmlhttp.send();
}
//
//
//
function validate_lat_lon(form){

  if(form.lat_min.value == '' || isNaN(form.lat_min.value)){
    lat_min = 0
  }else{
    lat_min = form.lat_min.value
  }
  if(form.lat_max.value == '' || isNaN(form.lat_max.value)){
    lat_max = 0
  }else{
    lat_max = form.lat_max.value
  }
  if(form.lon_min.value == '' || isNaN(form.lon_min.value)){
    lon_min = 0
  }else{
    lon_min = form.lon_min.value
  }
  if(form.lon_max.value == '' || isNaN(form.lon_max.value)){
    lon_max = 0
  }else{
    lon_max = form.lon_max.value
  }

  var msg = []
  if(parseFloat(lat_min) > parseFloat(lat_max)){
    tmp = lat_min
    lat_min = lat_max
    lat_max = tmp
    msg.push('<p>I switched the Latitudes!</p>')
  }
  if(parseFloat(lon_min) > parseFloat(lon_max)){
    tmp = lon_min
    lon_min = lon_max
    lon_max = tmp
    msg.push('<p>I switched the Longitudes!</p>')
  }
  bounds = {'lat_min':lat_min,'lat_max':lat_max,'lon_min':lon_min,'lon_max':lon_max}
  //{lat: minlat, lng: minlon}

  get_bounded_ajax(bounds, msg)
  // testing
  // lat_min = 20
  // lat_max = 30
  // lon_min = -80
  // lon_max= -70
}
//
//
//
function get_bounded_ajax(bounds, msg){
  //console.log(JSON.stringify(bounds))
  args = 'lat_min='+ bounds.lat_min.toString()
  args += '&lat_max='+bounds.lat_max.toString()
  args += '&lon_min='+bounds.lon_min.toString()
  args += '&lon_max='+bounds.lon_max.toString()
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", "geo_search", true);
  xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

          var response = xmlhttp.responseText;
          //console.log(response)
          data = JSON.parse(response)
          var html = ''
          if(Object.keys(data.points).length == 0){
            msg.push('<p><b>No Data Found</b> within this area:</p>')
            msg.push('<li>Latitude: Min: '+bounds.lat_min.toString()+';  Max: '+bounds.lat_max.toString()+'</li>')
            msg.push('<li>Longitude: Min: '+bounds.lon_min.toString()+'; Max: '+bounds.lon_max.toString()+'</li>')
            for(i in msg){
              html += msg[i]
            }
          }else{
            html += "<form id='' method='POST' action='/visuals/unit_selection'>"
            html += "Select <input type='radio' checked id='ds_select' name='ds_select' onclick=\"check_selected('all')\"> All&nbsp;&nbsp;&nbsp;"
            html += "<input type='radio' id='ds_select' name='ds_select' onclick=\"check_selected('none')\"> None&nbsp;&nbsp;&nbsp;&nbsp;"
            html += "<input type='button' class='btn btn-xs btn-primary' value='Use Selected' onclick='validate_geo_selected(this.form)'>"
            html += "<input type='hidden' name='from_geo_search' value='1'>"
            html += "<div id='geo_result_div' >"
            html += "<table class='table'>"
            for(did in data.points){
              html += "<tr>"
              html +="<td><input checked type='checkbox' name='dids' value='"+did+"'></td>"
              html += "<td><a href='/projects/"+data.points[did].pid+"'>"+data.points[did].project+"</a></td>"
              html += "<td>"+data.points[did].dataset+"</td>"
              html += "<td>Latitude: "+data.points[did].latitude+"</td>"
              html += "<td>Longitude: "+data.points[did].longitude+"</td>"
              html += "</tr>"
            }
            html += "</table>"
            html += "</div>"
            html += "</form>"
          }
          document.getElementById("geo_result").innerHTML = html;
          initMap(data);
        }
  }

  xmlhttp.send(args);

}
function validate_geo_selected(form){
  var did_els = document.getElementsByName('dids')
  var num_checked = 0
  for(n=0;n<did_els.length;n++){
    if(did_els[n].checked == true){
      num_checked += 1
    }
  }
  if(num_checked == 0){
    alert('you must select some data')
    return
  }
  form.submit()
}
function check_selected(code){

  var did_els = document.getElementsByName('dids')
  if(code == 'all'){
    for(n=0;n<did_els.length;n++){
      did_els[n].checked = true
    }
  }else{
    for(n=0;n<did_els.length;n++){
      did_els[n].checked = false
    }
  }
}

function initMap(data) {

        if(typeof data === 'undefined'){
          data = {}
          data.points = []
          data.boundry = {lat_min:0,lat_max:0,lon_min:0,lon_max:0}
        }
        var minlat = +data.boundry.lat_min
        var maxlat = +data.boundry.lat_max
        var minlon = +data.boundry.lon_min
        var maxlon = +data.boundry.lon_max

        var SW = {lat: minlat, lng: minlon}
        var SE = {lat: minlat, lng: maxlon}
        var NW = {lat: maxlat, lng: minlon}
        var NE = {lat: maxlat, lng: maxlon}
        document.getElementById("SWbox").innerHTML = 'Lat: '+minlat.toFixed(6)+'; Long: '+ minlon.toFixed(6);
        document.getElementById("SEbox").innerHTML = 'Lat: '+minlat.toFixed(6) +'; Long: '+maxlon.toFixed(6);
        document.getElementById("NWbox").innerHTML = 'Lat: '+maxlat.toFixed(6) +'; Long: '+minlon.toFixed(6);
        document.getElementById("NEbox").innerHTML = 'Lat: '+maxlat.toFixed(6)+'; Long: '+ maxlon.toFixed(6);
        var clat = minlat + ((maxlat - minlat)/2)
        var clon = minlon + ((maxlon - minlon)/2)
        var center = {lat:clat,lng:clon}
        var z  // start close??
        var map = new google.maps.Map(document.getElementById('map'), {
          //zoom: z,
          //center: center,
          mapTypeId: 'hybrid'
        });
        var oms = new OverlappingMarkerSpiderfier(map);

        if(minlat==0 && maxlat==0 && minlon==0 && maxlon==0){
              map.setMapTypeId('roadmap');
              map.setZoom(2)
              map.setCenter({lat: 0, lng: 0})
        }else{
          var southWest = new google.maps.LatLng(minlat, minlon);
          var northEast = new google.maps.LatLng(maxlat, maxlon);
          var bounds = new google.maps.LatLngBounds(southWest,northEast);
          map.fitBounds(bounds);
        }

        var markerSW = new google.maps.Marker({
          position: SW,
          map: map,
          title:'SW',
          draggable: true,
          icon: '../images/blue_tilted_pin48x48.png'
        });
        var markerSE = new google.maps.Marker({
          position: SE,
          map: map,
          title:'SE',
          draggable: true,
          icon: '../images/blue_tilted_pin48x48.png'
        });
        var markerNW = new google.maps.Marker({
          position: NW,
          map: map,
          title:'NW',
          draggable: true,
          icon: '../images/blue_tilted_pin48x48.png'
        });
        var markerNE = new google.maps.Marker({
          position: NE,
          map: map,
          title:'NE',
          draggable: true,
          icon: '../images/blue_tilted_pin48x48.png'
        });
        var iw = new google.maps.InfoWindow();
        oms.addListener('click', function(marker, event) {
          iw.setContent(marker.link);
          iw.open(map, marker);
        });
        oms.addListener('spiderfy', function(markers) {
          iw.close();
        });
        if(Object.keys(data.points).length > 0){
          for(did in data.points){
            //loc = {lat: +data.points[did].latitude, lng: +data.points[did].longitude}
            loc = new google.maps.LatLng(+data.points[did].latitude, +data.points[did].longitude)
            var data_point = new google.maps.Marker({
              position: loc,
              map: map,
              url: '/projects/'+data.points[did].pid,
              title: data.points[did].proj_dset
            });
            data_point.link = "<a href='/projects/"+data.points[did].pid+"'>"+data.points[did].proj_dset+"</a>"
            oms.addMarker(data_point);
            //google.maps.event.addListener(data_point, 'click', function() {window.location.href = data_point.url;});

          }
        }
        var BoundCoordinates = [  SW,NW,NE,SE,SW   ];
        var linePath = new google.maps.Polyline({
          path: BoundCoordinates,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 1
        });

        linePath.setMap(map);
        google.maps.event.addListener(map, 'mousemove', function (event) {
              displayCoordinates(event.latLng);
        });

        google.maps.event.addListener(markerSW, 'dragend', function (event) {
            document.getElementById("SWbox").innerHTML = 'Lat: '+event.latLng.lat().toFixed(6)+'; Long: '+ event.latLng.lng().toFixed(6);
            SW = {lat: event.latLng.lat(), lng: event.latLng.lng()}
            adjust_boundry(map,linePath,'SW',SW,NW,NE,SE)

        });
        google.maps.event.addListener(markerSE, 'dragend', function (event) {
            document.getElementById("SEbox").innerHTML = 'Lat: '+event.latLng.lat().toFixed(6)+'; Long: '+ event.latLng.lng().toFixed(6);
            SE = {lat: event.latLng.lat(), lng: event.latLng.lng()}
            adjust_boundry(map,linePath,'SE',SW,NW,NE,SE)
        });
        google.maps.event.addListener(markerNW, 'dragend', function (event) {
            document.getElementById("NWbox").innerHTML = 'Lat: '+event.latLng.lat().toFixed(6)+'; Long: '+ event.latLng.lng().toFixed(6);
            NW = {lat: event.latLng.lat(), lng: event.latLng.lng()}
            adjust_boundry(map,linePath,'NW',SW,NW,NE,SE)
        });
        google.maps.event.addListener(markerNE, 'dragend', function (event) {
            document.getElementById("NEbox").innerHTML = 'Lat: '+event.latLng.lat().toFixed(6) +'; Long: '+ event.latLng.lng().toFixed(6);
            NE = {lat: event.latLng.lat(), lng: event.latLng.lng()}
            adjust_boundry(map,linePath,'NE',SW,NW,NE,SE)
            //alert(JSON.stringify(linePath.getPath()))
        });
}
function adjust_boundry(map, linePath, pt, SW, NW, NE, SE){
  var BoundCoordinates = [   SW,NW,NE,SE,SW   ];
  linePath.setPath(BoundCoordinates);
  var new_bounds = get_new_bounds(pt,SW,NW,NE,SE)
  get_bounded_ajax(new_bounds,[])
  var southWest = new google.maps.LatLng(new_bounds.lat_min, new_bounds.lon_min);
  var northEast = new google.maps.LatLng(new_bounds.lat_max, new_bounds.lon_max);
  var bounds = new google.maps.LatLngBounds(southWest,northEast);
  map.fitBounds(bounds);
}
function get_new_bounds(pt,SW,NW,NE,SE){

        var minlat = SW.lat
        var maxlat = NW.lat
        var minlon = SW.lng
        var maxlon = SE.lng
        if(pt == 'NE'){
          // adjust maxlon and maxlat
          maxlon = NE.lng
          maxlat = NE.lat
        }else if (pt == 'NW'){
          // adjust minlon and maxlat
          minlon = NW.lng
          maxlat = NW.lat
        }else if (pt == 'SE'){
          // adjust maxlon and minlat
          maxlon = SE.lng
          minlat = SE.lat
        }else if (pt == 'SW'){
          // adjust minlon and minlat
          minlon = SW.lng
          minlat = SW.lat
        }
        bounds = {'lat_min':minlat,'lat_max':maxlat,'lon_min':minlon,'lon_max':maxlon}
        //console.log(JSON.stringify(bounds))
        return bounds
}
function displayCoordinates(pnt) {
        var lat = pnt.lat();
        lat = lat.toFixed(4);
        var lng = pnt.lng();
        lng = lng.toFixed(4);
        document.getElementById("coord").innerHTML = 'Cursor location --Latitude: '+lat+' --Longitude: '+lng;
        //console.log("Latitude: " + lat + "  Longitude: " + lng);
}
