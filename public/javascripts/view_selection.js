
$("#metadata_local_table_div").on("click", "#metadata_table", function () {
    new Tablesort(document.getElementById('metadata_table'));
});


// code for tooltips

var $liveTip = $('<div id="livetip_chart"></div>').hide().appendTo('body'),
    $win = $(window),
    showTip;

var tip = {
  title: '',
  offset: 12,
  delay: 300,
  position: function(event) {
    var positions = {x: event.pageX, y: event.pageY};
    var dimensions = {
      x: [
        $win.width(),
        $liveTip.outerWidth()
      ],
      y: [
        $win.scrollTop() + $win.height(),
        $liveTip.outerHeight()
      ]
    };
 
    for ( var axis in dimensions ) {
 
      if (dimensions[axis][0] <dimensions[axis][1] + positions[axis] + this.offset) {
        positions[axis] -= dimensions[axis][1] + this.offset;
      } else {
        positions[axis] += this.offset;
      }
 
    }
 
    $liveTip.css({
      top: positions.y,
      left: positions.x
    });
  }
};


$("body").delegate(".tooltip", "mouseover mouseout mousemove", function (event) {
      var link = this,
      html = '';
      $link = $(this);
     
      if (event.type == 'mouseover') {
        tip.id = link.id;
        link.id = '';
        id_items = tip.id.split('-|-');
        html = "<table><tr>";
        if(id_items[0] == 'dheatmap') {
          html += "<td>"+id_items[1]+"</td>";
          html += "</tr><tr>";
          html += "<td>"+id_items[2]+"</td>";
          html += "</tr><tr>";
          html += "<td>Distance: "+id_items[3]+"</td>";
        }else if(id_items[0] == 'frequencies'){
          html += "<td>"+id_items[1]+"</td>";
          html += "</tr><tr>";
          html += "<td>"+id_items[2]+"</td>";
          html += "</tr><tr>";
          html += "<td>Count: "+id_items[3]+" ("+id_items[4]+"%)</td>";
        }else{  // barcharts and piecharts            
          html += "<td>"+id_items[1]+"</td>";
          html += "</tr><tr>";
          html += "<td>Count: "+id_items[2]+" ("+id_items[3]+"%)</td>";
        }
        html += "</tr><table>";

        showTip = setTimeout(function() {
     
          $link.data('tipActive', true);
          
          tip.position(event);
     //alert(event.pageX)
          $liveTip
          .html('<div>' + html  + '</div>')
          .fadeOut(0)
          .fadeIn(200);
     
        }, tip.delay);
      }
     
      if (event.type == 'mouseout') {
        link.id = tip.id || link.id;
        if ($link.data('tipActive')) {
          $link.removeData('tipActive');
          $liveTip.hide();
        } else {
          clearTimeout(showTip);
        }
      }
     
      if (event.type == 'mousemove' && $link.data('tipActive')) {
        tip.position(event);
      }
              
});              
          
// normalization radio-buttons
var norm_counts_radios = document.getElementsByName('normalization');
if (typeof norm_counts_radios[0] !=="undefined") {
  norm_counts_radios[0].addEventListener('click', function () {
	  document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
  norm_counts_radios[1].addEventListener('click', function () {
	  document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
  norm_counts_radios[2].addEventListener('click', function () {
	  document.getElementById('output_choices_submit_btn').disabled = false;
	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
  });
}
// Distance Metric Select (Combo)
selected_distance_combo = document.getElementById('selected_distance');
if (typeof selected_distance_combo !=="undefined") {
	selected_distance_combo.addEventListener('change', function () {
  	  document.getElementById('output_choices_submit_btn').disabled = false;
  	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
	});
}
// MIN Select (Combo)
min_range_combo = document.getElementById('min_range');
if (typeof min_range_combo !=="undefined") {
	min_range_combo.addEventListener('change', function () {
  	  document.getElementById('output_choices_submit_btn').disabled = false;
  	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
	});
}
// MAX Select (Combo)
max_range_combo = document.getElementById('max_range');
if (typeof max_range_combo !=="undefined") {
	max_range_combo.addEventListener('change', function () {
  	  document.getElementById('output_choices_submit_btn').disabled = false;
  	  document.getElementById('output_choices_submit_btn').style.background = '#FF6600';
	});
}
// COUNTS
var tax_counts_link = document.getElementById('counts_table_link_id');
var tax_counts_btn = document.getElementById('counts_table_hide_btn');
var tax_counts_div = document.getElementById('tax_table_div');
var counts_table_download_btn = document.getElementById('counts_table_download_btn');
if (typeof tax_counts_link !=="undefined") {
  tax_counts_link.addEventListener('click', function () {
      //alert(tax_table_created)
      if(typeof tax_table_created == "undefined"){
        get_user_input('counts_table', pi_local.ts);
		counts_table_download_btn.disabled = false
      }else{
        if(tax_counts_btn.value == 'close'){
          toggle_visual_element(tax_counts_div,'show',tax_counts_btn);
        }else{
          toggle_visual_element(tax_counts_div,'hide',tax_counts_btn);
        }
      }
  });
}
if (typeof tax_counts_btn !=="undefined") {
  tax_counts_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(tax_counts_btn.value == 'close'){
        toggle_visual_element(tax_counts_div,'show',tax_counts_btn);
      }else{
        toggle_visual_element(tax_counts_div,'hide',tax_counts_btn);
      }
      
  });
}
if (typeof counts_table_download_btn !=="undefined") {
  
  counts_table_download_btn.addEventListener('click', function () {
	  //download_matrix('counts_matrix'); 
	  
	  var f = document.createElement("form");
	  f.setAttribute('method',"POST");
	  f.setAttribute('action',"download_counts_matrix");
	  
	  var s = document.createElement("input"); //input element, text
	  s.setAttribute('type',"submit");
	  s.setAttribute('value',"Submit");
	  
	  f.appendChild(s)
	  document.getElementsByTagName('body')[0].appendChild(f);
	  f.submit();
  });
}
//
// METADATA
//
var metadata_link = document.getElementById('metadata_table_link_id');
var metadata_btn = document.getElementById('metadata_table_hide_btn');
var metadata_div = document.getElementById('metadata_local_table_div');
if (typeof metadata_link !=="undefined") {
  metadata_link.addEventListener('click', function () {
      if(typeof metadata_table_created == "undefined"){
        get_user_input('metadata_table', pi_local.ts);
      }else{
        if(metadata_btn.value == 'close'){
          toggle_visual_element(metadata_div,'show',metadata_btn);
        }else{
          toggle_visual_element(metadata_div,'hide',metadata_btn);
        }
      }
      
  });
}
if (typeof metadata_btn !=="undefined") {
  metadata_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(metadata_btn.value == 'close'){
        toggle_visual_element(metadata_div,'show',metadata_btn);
      }else{
        toggle_visual_element(metadata_div,'hide',metadata_btn);
      }
      
  });
}
//
// PIECHARTS
//
var piecharts_link = document.getElementById('piecharts_link_id');
var piecharts_btn = document.getElementById('piecharts_hide_btn');
var piecharts_div = document.getElementById('piecharts_div');
if (typeof piecharts_link !=="undefined") {
  piecharts_link.addEventListener('click', function () {
      if(typeof piecharts_created == "undefined"){
        get_user_input('piecharts', pi_local.ts);
      }else{
        if(piecharts_btn.value == 'close'){
          toggle_visual_element(piecharts_div,'show',piecharts_btn);
        }else{
          toggle_visual_element(piecharts_div,'hide',piecharts_btn);
        }
      }
      
  });
}
if (typeof piecharts_btn !=="undefined") {
  piecharts_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(piecharts_btn.value == 'close'){
        toggle_visual_element(piecharts_div,'show',piecharts_btn);
      }else{
        toggle_visual_element(piecharts_div,'hide',piecharts_btn);
      }
      
  });
}
//
// BARCHARTS
//
var barchart_link = document.getElementById('barcharts_link_id');
var barcharts_btn = document.getElementById('barcharts_hide_btn');
var barcharts_div = document.getElementById('barcharts_div');
if (typeof barchart_link !=="undefined") {
  barchart_link.addEventListener('click', function () {
      if(typeof barcharts_created == "undefined"){
        get_user_input('barcharts', pi_local.ts);
      }else{
        if(barcharts_btn.value == 'close'){        
          toggle_visual_element(barcharts_div,'show',barcharts_btn);
        }else{
          toggle_visual_element(barcharts_div,'hide',barcharts_btn);
        }
      }
      
  });
}
if (typeof barcharts_btn !=="undefined") {
  barcharts_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(barcharts_btn.value == 'close'){        
        toggle_visual_element(barcharts_div,'show',barcharts_btn);
      }else{
        toggle_visual_element(barcharts_div,'hide',barcharts_btn);
      }
      
  });
}
//
// DISTANCE HEATMAP
//
var dheatmap_link = document.getElementById('dheatmap_link_id');
var dheatmap_btn = document.getElementById('dheatmap_hide_btn');
var dheatmap_div = document.getElementById('dheatmap_div');
if (typeof dheatmap_link !=="undefined") {
  dheatmap_link.addEventListener('click', function () {
      if(typeof dheatmap_created == "undefined"){
        get_user_input('dheatmap', pi_local.ts);
      }else{
        if(dheatmap_btn.value == 'close'){        
          toggle_visual_element(dheatmap_div,'show',dheatmap_btn);
        }else{
          toggle_visual_element(dheatmap_div,'hide',dheatmap_btn);
        }
      }
      
  });
}
if (typeof dheatmap_btn !== "undefined") {
  dheatmap_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dheatmap_btn.value == 'close'){        
        toggle_visual_element(dheatmap_div,'show',dheatmap_btn);
      }else{
        toggle_visual_element(dheatmap_div,'hide',dheatmap_btn);
      }
      
  });
}
//
// FREQUENCY HEATMAP
//
var fheatmap_link = document.getElementById('fheatmap_link_id');
var fheatmap_btn = document.getElementById('fheatmap_hide_btn');
var fheatmap_div = document.getElementById('fheatmap_div');
if (typeof fheatmap_link !=="undefined") {
  fheatmap_link.addEventListener('click', function () {
      if(typeof fheatmap_created == "undefined"){
        get_user_input('fheatmap', pi_local.ts);
      }else{
        if(fheatmap_btn.value == 'close'){        
          toggle_visual_element(fheatmap_div,'show',fheatmap_btn);
        }else{
          toggle_visual_element(fheatmap_div,'hide',fheatmap_btn);
        }
      }      
  });
}
if (typeof fheatmap_btn !== "undefined") {
  fheatmap_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(fheatmap_btn.value == 'close'){        
        toggle_visual_element(fheatmap_div,'show',fheatmap_btn);
      }else{
        toggle_visual_element(fheatmap_div,'hide',fheatmap_btn);
      }
      
  });
}
//
// DENDROGRAM  D3
//
var dendrogram_link = document.getElementById('dendrogram_link_id');
var dendrogram_btn = document.getElementById('dendrogram_hide_btn');
var dendrogram_div = document.getElementById('dendrogram_div');
if (typeof dendrogram_link !=="undefined") {
  dendrogram_link.addEventListener('click', function () {
      if(typeof dendrogram_created == "undefined"){
        get_user_input('dendrogram', pi_local.ts);
      }else{
        if(dendrogram_btn.value == 'close'){        
          toggle_visual_element(dendrogram_div,'show',dendrogram_btn);
        }else{
          toggle_visual_element(dendrogram_div,'hide',dendrogram_btn);
        }
      }
      
  });
}
if (typeof dendrogram_btn !== "undefined") {
  dendrogram_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dendrogram_btn.value == 'close'){        
        toggle_visual_element(dendrogram_div,'show',dendrogram_btn);
      }else{
        toggle_visual_element(dendrogram_div,'hide',dendrogram_btn);
      }      
  });
}
//
// DENDROGRAM PNG
//
var dendrogram_pdf_link = document.getElementById('dendrogram_pdf_link_id');
var dendrogram_pdf_btn = document.getElementById('dendrogram_pdf_hide_btn');
var dendrogram_pdf_div = document.getElementById('dendrogram_pdf_div');
if (typeof dendrogram_pdf_link !=="undefined") {
  dendrogram_pdf_link.addEventListener('click', function () {
      if(typeof dendrogram_pdf_created == "undefined"){
        get_user_input('dendrogram_pdf', pi_local.ts);
      }else{
        if(dendrogram_pdf_btn.value == 'close'){        
          toggle_visual_element(dendrogram_pdf_div,'show',dendrogram_pdf_btn);
        }else{
          toggle_visual_element(dendrogram_pdf_div,'hide',dendrogram_pdf_btn);
        }
      }
      
  });
}
if (typeof dendrogram_pdf_btn !== "undefined") {
  dendrogram_pdf_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(dendrogram_pdf_btn.value == 'close'){        
        toggle_visual_element(dendrogram_pdf_div,'show',dendrogram_pdf_btn);
      }else{
        toggle_visual_element(dendrogram_png_div,'hide',dendrogram_pdf_btn);
      }      
  });
}
//
// PCOA
//
var pcoa_link = document.getElementById('pcoa_link_id');
var pcoa_btn = document.getElementById('pcoa_hide_btn');
var pcoa_div = document.getElementById('pcoa_div');
if (typeof pcoa_link !=="undefined") {
  pcoa_link.addEventListener('click', function () {
      if(typeof pcoa_created == "undefined"){
        get_user_input('pcoa', pi_local.ts);
      }else{
        if(pcoa_btn.value == 'close'){        
          toggle_visual_element(pcoa_div,'show',pcoa_btn);
        }else{
          toggle_visual_element(pcoa_div,'hide',pcoa_btn);
        }
      }      
  });
}
if (typeof pcoa_btn !== "undefined") {
  pcoa_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(pcoa_btn.value == 'close'){        
        toggle_visual_element(pcoa_div,'show',pcoa_btn);
      }else{
        toggle_visual_element(pcoa_div,'hide',pcoa_btn);
      }
      
  });
}
//
// GEOSPATIAL
//
var geospatial_link = document.getElementById('geospatial_link_id');
var geospatial_btn = document.getElementById('geospatial_hide_btn');
var geospatial_div = document.getElementById('map-canvas');
if (typeof geospatial_link !=="undefined") {
  //google.maps.event.addDomListener(window, 'load', initialize);

  geospatial_link.addEventListener('click', function () {
      if(typeof geospatial_created == "undefined"){
          get_user_input('geospatial', pi_local.ts);
      }else{
        if(geospatial_btn.value == 'close'){        
          toggle_visual_element(geospatial_div,'show',geospatial_btn);
        }else{
          toggle_visual_element(geospatial_div,'hide',geospatial_btn);
        }
      }      
  });
}
if (typeof geospatial_btn !== "undefined") {
  geospatial_btn.addEventListener('click', function () {
      //alert('here in tt')
      if(geospatial_btn.value == 'close'){        
        toggle_visual_element(geospatial_div,'show',geospatial_btn);
      }else{
        toggle_visual_element(geospatial_div,'hide',geospatial_btn);
      }
      
  });
}

//
//
//
// TEST
//
test_link = document.getElementById('test_page_link_id');
if (typeof test_link !=="undefined") {
  test_link.addEventListener('click', function () {
      //alert('here in pc')
      create_test_page(pi_local.ts);
  });
}
function create_test_page(ts) {
  
    var opened = window.open("");
    opened.document.write("<html><head><title>My title</title></head><body>open in another page:  test</body></html>");

}



function toggle_visual_element(table_div, tog, btn){
  if(tog == 'show') {
    table_div.style.display = 'none';
    btn.value = 'open';
  }else{
    table_div.style.display = 'block';
    btn.value = 'close';
  }
}


function get_user_input(visual, ts) {
   
    if(visual === 'counts_table'){
      create_counts_table();      
    }else if(visual === 'metadata_table'){
      create_metadata_table();
    }else if(visual === 'piecharts'){
      create_piecharts(ts)
    }else if(visual === 'barcharts'){
      create_barcharts(ts)
    }else if(visual === 'dheatmap'){
      create_dheatmap(ts)
    }else if(visual === 'dendrogram'){
      create_dendrogram(ts,'svg')
    }else if(visual === 'dendrogram_pdf'){
      create_dendrogram(ts,'pdf')
    }else if(visual === 'pcoa'){
      create_pcoa(ts)
    }else if(visual === 'fheatmap'){
      create_fheatmap(ts)
    }else if(visual === 'geospatial'){
      create_geospatial(ts)
    }else{

    }
}

//
// TAX TABLE
//
function create_counts_table() {
      
      tax_table_created = true;
      var info_line = create_header('ftable', pi_local);
      document.getElementById('counts_table_title').innerHTML = info_line;
      document.getElementById('pre_counts_table_div').style.display = 'block';
      var tax_counts_div = document.getElementById('tax_table_div');
      var html = '';
         
      html += "</table>  ";
      html += "</span>";

      html += "<table border='1' class='single_border small_font counts_table' >";
      html += "<tr><td></td>";
      for (var n in mtx_local.columns) {
        html += "<td class=''>"+mtx_local.columns[n].name +"</td>";
      }
      html += "</tr>";
      
      for (var i in mtx_local.rows){
        html += "<tr class='chart_row'>";
        html += "<td class='left_justify'>"+mtx_local.rows[i].name +"</td>";
        for (var d in mtx_local.data[i]) {
          var cnt = mtx_local.data[i][d];
          var pct =  (cnt * 100 / mtx_local.column_totals[d]).toFixed(2);
          var id  = 'frequencies-|-'+mtx_local.rows[i].name+'-|-'+mtx_local.columns[d].name+'-|-'+cnt.toString()+'-|-'+pct.toString();
          html += "<td id='"+id+"' class='tooltip right_justify'>"+cnt+'</td>';
          
        }
        html += "</tr>";
      }
      // TOTALS
      html += "<tr>";
      html += "<td class='right_justify'><strong>Sums:</strong></td>";
      for (var m in mtx_local.column_totals){
		  if(pi_local.normalization == 'frequency'){
			  var total = mtx_local.column_totals[m].toFixed(6);
		  }else{
			  var total = mtx_local.column_totals[m];
		  }
		html += "<td class='right_justify'>" + total + "</td>";
      }
      html += "</tr>";
      html += "</table>";

      //document.getElementById('counts_tooltip_div').innerHTML = tooltip_tbl;
      tax_counts_div.innerHTML = html;


     
};

//
//  CREATE METADATA TABLE
//
function create_metadata_table() {
     
      metadata_table_created = true;
      var info_line = create_header('mtable', pi_local);
      var metadata_div = document.getElementById('metadata_local_table_div');
      document.getElementById('pre_metadata_table_div').style.display = 'block';
      var html = '';
      html += "<table border='1' id='metadata_table' class='single_border small_font md_table' >";
      html += "<thead><tr><th>Dataset (sortable)</th><th>Name (sortable)</th><th>Value (sortable)</th></tr></thead><tbody>";
      
      for (var ds in md_local) {

          for (var k in md_local[ds]) {
            html += "<tr>";
            html += "<td>"+ds+"</td>";
            md_item = k;
            md_val = md_local[ds][k];
            html += "<td>"+md_item+"</td><td>"+md_val+"</td>";
            html += "</tr>";
          }        
      }
      html += "</tbody></table>";

      //alert(md_local[0].env_matter)
      metadata_div.innerHTML = html;
};

//
//  CREATE Dendrogram
//

function create_dendrogram(ts, image_type) {
      //alert('im DEND')
      
      var info_line = create_header('dend', pi_local);

      if(image_type == 'pdf'){
        dendrogram_pdf_created = true;
        var dend_div = document.getElementById('dendrogram_pdf_div');
        document.getElementById('pre_dendrogram_pdf_div').style.display = 'block';
        document.getElementById('dendrogram_pdf_title').innerHTML = info_line;
      }else{  // svg
        dendrogram_created = true;
        var dend_div = document.getElementById('dendrogram_div');
        document.getElementById('pre_dendrogram_div').style.display = 'block';
        document.getElementById('dendrogram_title').innerHTML = info_line;
      }
      
      
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      
      
      
      
      var html = ''
      var args =  "metric="+pi_local.selected_distance;
      args += "&ts="+ts;
      args += "&image_type="+image_type;
      
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", '/visuals/dendrogram', true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState == 4 ) {
           var htmlstring = xmlhttp.responseText;
           html = "<div id='' >"+htmlstring+"</div>"
           dend_div.innerHTML = html;
        }
      };
      xmlhttp.send(args);
 
};


//
//  CREATE PCoA
//
function create_pcoa(ts) {
      //alert('JS PCoA')
      pcoa_created = true;
      var pcoa_div = document.getElementById('pcoa_div');
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      var info_line = create_header('pcoa', pi_local);
      document.getElementById('pcoa_title').innerHTML = info_line;
      

      var html = ''
      var args =  "metric="+pi_local.selected_distance;
      args += "&ts="+ts;
      document.getElementById('pre_pcoa_div').style.display = 'block';
       // get distance matrix via AJAX
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", '/visuals/pcoa', true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState == 4 ) {
           var htmlstring = xmlhttp.responseText;
           pcoa_div.innerHTML = htmlstring;
        }
      };
      xmlhttp.send(args);
      
};
//
//  CREATE DIST HEATMAP
//
function create_dheatmap(ts) {
      //alert('im HM')
      dheatmap_created = true;
      var dhm_div = document.getElementById('dheatmap_div');
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      var info_line = create_header('dhm', pi_local);
      document.getElementById('dheatmap_title').innerHTML = info_line;
      
      var html = ''
      var args =  "metric="+pi_local.selected_distance;
      args += "&ts="+ts;
      document.getElementById('pre_dheatmap_div').style.display = 'block';
       // get distance matrix via AJAX
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", '/visuals/heatmap', true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
           var htmlstring = xmlhttp.responseText;           
           dhm_div.innerHTML = htmlstring;
        }
      };
      xmlhttp.send(args);      
};
//
//  CREATE FREQUENCY HEATMAP
//
function create_fheatmap(ts) {
      //alert('im HM')
      fheatmap_created = true;
      var fhm_div = document.getElementById('fheatmap_div');
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      var info_line = create_header('fhm', pi_local);
      document.getElementById('fheatmap_title').innerHTML = info_line;
      
      var html = ''
      var args =  "metric="+pi_local.selected_distance;
      args += "&ts="+ts;
      document.getElementById('pre_fheatmap_div').style.display = 'block';
      var xmlhttp = new XMLHttpRequest();  
      xmlhttp.open("POST", '/visuals/frequency_heatmap', true);
      xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
           var htmlstring = xmlhttp.responseText;           
           fhm_div.innerHTML = htmlstring;
        }
      };
      xmlhttp.send(args);   
      
};
//
//  CREATE GEOSPATIAL
//
function create_geospatial(ts) {
      //alert('in GEO')
      geospatial_created = true;
      var geo_div = document.getElementById('map-canvas');
      //var dist = cnsts.DISTANCECHOICES.choices.id[]
      
      var info_line = create_header('geo', pi_local);
      
      document.getElementById('geospatial_title').innerHTML = info_line;
       
      document.getElementById('pre_geospatial_div').style.display = 'block';
      
      var markers = [];
      var lat_lon_collector = {};
      var latlon;
      
      for (var ds in md_local) {
          var lat = ''
          var lon = ''
          for (var k in md_local[ds]) {
            md_item = k;
            if(md_item == 'latitude') {
              lat = Number(md_local[ds][k]);
            }
            if(md_item == 'longitude'){              
              lon = Number(md_local[ds][k]);
            }           
            
          } 
          
          if(typeof lat == 'number' && typeof lon == 'number'){
            latlon = lat.toString() +';'+ lon.toString();
            if (latlon in lat_lon_collector) {
              newds = lat_lon_collector[latlon] + "<br>" + ds
              lat_lon_collector[latlon] = newds;
            }else{
              lat_lon_collector[latlon] = ds;
            }            
          }
      }
      var z = 1;

      for(latlon in lat_lon_collector){
        //alert(latlon)
        ds = lat_lon_collector[latlon];
        var latlons =  latlon.split(';');
        markers.push([ds,latlons[0],latlons[1],z]);
        z+=1; 

      }

      if(markers.length == 0){
          geospatial_div.innerHTML='No Lat/Lon Data Found/Selected';
      }else{
        var center = new google.maps.LatLng(markers[0][2],markers[0][1]); // wants lon, lat order

        var mapCanvas = document.getElementById('map-canvas');
          var mapOptions = {
            center:center,
            zoom: 5,
            //zoom: 2,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          }
        var map = new google.maps.Map(mapCanvas, mapOptions);
        var infowindow =  new google.maps.InfoWindow({
          content: ''
        });

        setMarkers(map, markers, infowindow);
      }  
};

function bindInfoWindow(marker, map, infowindow, html) { 
  google.maps.event.addListener(marker, 'click', function() { 
    infowindow.setContent(html); 
    infowindow.open(map, marker); 
  }); 
} 
function setMarkers(map, locations,infowindow) {
  for (var i = 0; i < locations.length; i++) {
    // create a marker
    var ds = locations[i];
    var myLatLng = new google.maps.LatLng(ds[2], ds[1]); // wants lon, lat order
    var marker = new google.maps.Marker({
      title: ds[0].title,
      position: myLatLng,
      map: map
    });
    
    // add an event listener for this marker
    bindInfoWindow(marker, map, infowindow, "<p>" + ds[0] + "</p>"); 

  }

}
//
//  CREATE PIECHARTS
//
function create_piecharts(ts) {
     
    piecharts_created = true;
    
    var info_line = create_header('pies', pi_local);
    document.getElementById('piecharts_title').innerHTML = info_line;
    document.getElementById('pre_piecharts_table_div').style.display = 'block';
    //d3.select('svg').remove();
    var counts_per_ds = [];
    var tmp={};
    for(var i in mtx_local.columns){
      tmp[mtx_local.columns[i].name]=[]; // datasets
    }
    for(var x in mtx_local.data){
      for(var i in mtx_local.columns){
        tmp[mtx_local.columns[i].name].push(mtx_local.data[x][i]);
      }
    }
    var myjson_obj={};
    myjson_obj.names=[];
    myjson_obj.values=[];
    for(var x in tmp) {
        counts_per_ds.push(tmp[x]);
        myjson_obj.names.push(x);
        myjson_obj.values.push(tmp[x]);
    }
    //alert(myjson_obj.names);
    var unit_list = [];
    for(o in mtx_local.rows){
        unit_list.push(mtx_local.rows[o].name);
    }
    
    
    var colors = get_colors(unit_list);
    var pies_per_row = 4;
    var m = 20; // margin
    var r = 320/pies_per_row; // five pies per row
    var image_w = 2*(r+m)*pies_per_row;
    var image_h = Math.ceil(counts_per_ds.length / 4 ) * ( 2 * ( r + m ) )+ 30;
    var arc = d3.svg.arc()
        .innerRadius(r / 2)
        .outerRadius(r);
    //var counts_per_ds = [[100,20,5],[20,20,20]];
    //for(i in counts_per_ds){
    var svgContainer = d3.select("#piecharts_div").append("svg")
        .attr("width",image_w)
        .attr("height",image_h);
    
    var pies = svgContainer.selectAll("svg")
        .data(myjson_obj.values)
        .enter().append("g")
        .attr("transform", function(d, i){
            
            var modulo_i = i+1;
            var d = r+m;
            var h_spacer = d*2*(i % pies_per_row);
            var v_spacer = d*2*Math.floor(i / pies_per_row);
            return "translate(" + (d + h_spacer) + "," + (d + v_spacer) + ")";
        })
        .append("a")
        .attr("xlink:xlink:href", function(d,i) { return 'piechart_single?ds='+myjson_obj.names[i]+'&ts='+ts;} );

    pies.selectAll("path")
        .data(d3.layout.pie())
        .enter().append("path")
        .attr("d", d3.svg.arc()
        .innerRadius(0)
        .outerRadius(r))
        .attr("id",function(d,i) {
            var cnt = d.value;
            var total = 0;
            for(k in this.parentNode.__data__){
              total += this.parentNode.__data__[k];
            }           
            
            var ds = ''; // PLACEHOLDER for TT
            var pct = (cnt * 100 / total).toFixed(2);
            var id = 'piecharts-|-'+unit_list[i]+'-|-'+cnt.toString()+'-|-'+pct;
            //alert(unit_list[i]+'-|-'+cnt.toString()+'-|-'+total+'-|-'+pct)
            return id; // ip of each rectangle should be datasetname-|-unitname-|-count
           
        })
        .attr("class","tooltip")
        .style("fill", function(d, i) {
            return colors[i];
        });

    d3.selectAll("g")
      .data(myjson_obj.names)
      .append("text")
      .attr("dx", -(r+m))
      .attr("dy", r+m)
      .attr("text-anchor", "left")
      .attr("font-size","9px")
      .text(function(d, i) {
          return d;
      });
   

};



//
//  CREATE BARCHARTS
//
function create_barcharts(ts) {

        
        barcharts_created = true;
        var info_line = create_header('bars', pi_local);
        
        document.getElementById('barcharts_title').innerHTML = info_line;
        document.getElementById('pre_barcharts_table_div').style.display = 'block';


        data = [];
        for (var p in mtx_local.columns){
          tmp={};
          tmp.DatasetName = mtx_local.columns[p].name;
          for (var t in mtx_local.rows){
            tmp[mtx_local.rows[t].name] = mtx_local.data[t][p];
          }
          data.push(tmp);
        }

      
        var unit_list = [];
        // TODO: "'o' is already defined."
        for (var o in mtx_local.rows){
          unit_list.push(mtx_local.rows[o].name);
        }
        

        var ds_count = mtx_local.shape[1];      
        var bar_height = 15;
        var props = get_image_properties(bar_height, ds_count); 
        //console.log(props)
        var color = d3.scale.ordinal()                  
          .range( get_colors(unit_list) );

        color.domain(d3.keys(data[0]).filter(function(key) { return key !== "DatasetName"; }));

        

        data.forEach(function(d) {
          var x0 = 0;
          d.unitObj = color.domain().map(function(name) { 
            return { name: name, x0: x0, x1: x0 += +d[name] }; 
          });
          //console.log(d.unitObj);
          d.total = d.unitObj[d.unitObj.length - 1].x1;
          //console.log(d.total);
        });


        data.forEach(function(d) {
          // normalize to 100%
          tot = d.total;
          d.unitObj.forEach(function(o) {
              //console.log(o);
              o.x0 = (o.x0*100)/tot;
              o.x1 = (o.x1*100)/tot;
          });
        });
      
        
        create_svg_object(props, color, data, ts);
        
};

//////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
function get_image_properties(bar_height, ds_count) {
  var props = {};
  
  //props.margin = {top: 20, right: 20, bottom: 300, left: 50};
  props.margin = {top: 20, right: 100, bottom: 20, left: 300};
  
  var plot_width = 650;
  var gap = 2;  // gap on each side of bar
  props.width = plot_width + props.margin.left + props.margin.right;
  props.height = (ds_count * (bar_height + 2 * gap)) + 125;
  
  props.x = d3.scale.linear() .rangeRound([0, plot_width]);
    
  props.y = d3.scale.ordinal()
      .rangeBands([0, (bar_height + 2 * gap) * ds_count]);
    
  props.xAxis = d3.svg.axis()
          .scale(props.x)
          .orient("top");
  
  props.yAxis = d3.svg.axis()
          .scale(props.y)
          .orient("left");
          
              
  return props;
}
//
//
//
function create_svg_object(props, color, data, ts) {
       //d3.select('svg').remove();
      
      var svg = d3.select("#barcharts_div").append("svg")
                  .attr("width",  props.width)
                  .attr("height", props.height)
                .append("g")
                  .attr("transform", "translate(" + props.margin.left + "," + props.margin.top + ")");
      
      
      // axis legends -- would like to rotate dataset names
      props.y.domain(data.map(function(d) { return d.DatasetName; }));
      props.x.domain([0, 100]);

      svg.append("g")
          .attr("class", "y axis")
          .call(props.yAxis)
          .selectAll("text")  
             .style("text-anchor", "end")
             .attr("dx", "-.5em")
             .attr("dy", "1.4em"); 
             
             
      svg.append("g")
          .attr("class", "x axis")
          .call(props.xAxis)
        .append("text")
          .attr("x", 650)
          .attr("dy", ".8em")
          .style("text-anchor", "end")
          .text("Percent");
     
     
      

      // var datasetBar = svg.selectAll("a")
      //     .data(data)
      //   .enter().append("a")
      //   .attr("xlink:href",  'http://www.google.com' )
      //   .append("g")
      //     .attr("class", "g")
      //     .attr("transform", function(d) { return  "translate(0, " + props.y(d.DatasetName) + ")"; })
       var datasetBar = svg.selectAll(".bar")
          .data(data)
        .enter() .append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return  "translate(0, " + props.y(d.DatasetName) + ")"; })  
          .append("a")
        .attr("xlink:xlink:href",  function(d) { return 'piechart_single?ds='+d.DatasetName+'&ts='+ts;} );

      datasetBar.selectAll("rect")
     //     .append("a")
     //   .attr("xlink:href",  'http://www.google.com')
          .data(function(d) { return d.unitObj; })
        .enter()
        .append("rect")
          .attr("x", function(d) { return props.x(d.x0); })
          .attr("y", 15)  // adjust where first bar starts on x-axis
          .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
          .attr("height",  18)
          .attr("id",function(d) { 
            var cnt =  this.parentNode.__data__[d.name];
            var total = this.parentNode.__data__['total'];
            //console.log(this._parentNode.__data__['total']);
            var ds = ''; // PLACEHOLDER for TT
            var pct = (cnt * 100 / total).toFixed(2);
            var id = 'barcharts-|-' + d.name + '-|-'+ cnt.toString() + '-|-' + pct; 
            return id;    // ip of each rectangle should be datasetname-|-unitname-|-count
            //return this._parentNode.__data__.DatasetName + '-|-' + d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
          }) 

          .attr("class","tooltip")
          .style("fill",   function(d) { return color(d.name); });


       //rect.append("svg:a").attr("xlink:href",  'http://www.google.com')
}


function create_header(viz, pi) {
  
  var txt;
  //viz_possibles = ['bars','pies','geo','dhm','fhm','dend-svg','dend-pdf','pcoa','ftable','mtable'];
  
    if(viz == 'geo'){
      txt = 'Geospatial -- ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'bars'){
      txt = 'Barcharts -- ';
    }else if(viz == 'pies'){
      txt = 'Barcharts -- ';
    }else if(viz == 'dhm'){
      txt = 'Distance Heatmap -- ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'fhm'){
      txt = 'Frequency Heatmap -- ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'dend'){
      txt = 'Dendrogram -- ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'pcoa'){
      txt = 'PCoA -- ';
      txt += ' Metric: ' + pi.selected_distance+'; ';  
    }else if(viz == 'ftable'){
      txt = 'Frequency Table -- ';
    }else if(viz == 'mtable'){
      txt = 'Metadata Table -- ';
    }else{
      txt = 'ERROR in fxn create_headers '+viz;
    }
  txt += ' Normalization: ' + pi.normalization+'; ';
  txt += ' Counts Min/Max: ' + pi.min_range+'% -- '+pi.max_range+'%';
     
  return txt;
}
function get_colors(unit_names){
  var colors = [];
  for(var n in unit_names){
    //alert(unit_names[n]);
    col = string_to_color_code(unit_names[n]);
    //console.log(col);
    colors.push(col);
  }
  return colors;
}
function string_to_color_code(str){
    var hash = 0;
    for(var i=0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 3) - hash);
    }
    var color = Math.abs(hash).toString(16).substring(0, 6);
    return "#" + '000000'.substring(0, 6 - color.length) + color;
}


