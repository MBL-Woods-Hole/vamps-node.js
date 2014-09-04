// counts_table.js
var path = require('path');
var fs = require('fs');

var COMMON  = require('./routes_common');

module.exports = {

	//
	// CREATE COUNTS TABLE HTML
	//
	create_counts_table_html: function( ts, count_matrix, obj ) {
	  // Intend to create (write) counts_table page here.
	  // The page should have a timestamp and/or username appeneded to the file name
	  // so that it is unique to the user.
	  // The page should be purged when? -- after a certain length of time
	  // or when the user leaves the page.
	  
	  //var selection_html;
	  //var choices_html
	  var out_file = '../../tmp/'+ts+'_counts_table.html';
	  
		var html = create_ct_html(count_matrix)
	  
	  //console.log(column_totals)
	  COMMON.write_file(out_file,html);
	
	}

}

//
//  CREATE HTML
//
function create_ct_html(count_matrix) {

	var html = '';
	html += "<div class='' id='counts_table_div' >";
	  var column_totals = {};
	  html += "<table border='1' class='counts_table' >";
	  html += "<tr><td></td>";
	  for(n in count_matrix.dataset_names) {
	    html += "<td>"+count_matrix.dataset_names[n]+"</td>";
	  }
	  html += "</tr>";  
	  var row_count = 0;
	  for(name in count_matrix.unit_names) {
	    
	    html += "<tr>";
	    html += "<td>"+name+"</td>";
	    var col_count = 0;
	    for(c in count_matrix.unit_names[name]) {
	      if(column_totals[col_count] === undefined){
	        column_totals[col_count] =  count_matrix.unit_names[name][c];
	      }else{
	        column_totals[col_count] +=  count_matrix.unit_names[name][c];
	      }
	      
	      html += "<td>"+count_matrix.unit_names[name][c]+"</td>";
	      col_count += 1;
	    }
	    html += "</tr>";
	    row_count += 1;
	  }
	  html += "<tr><td>TOTAL COUNTS:</td>";
	  for(n in column_totals) {
	    html += "<td>"+column_totals[n]+"</td>";
	  }
	  html += "</tr>";
	  html += "</table>";
	  html += "</div>"
	  return html;

}