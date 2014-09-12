// bar_charts.js
var fpath = require('path');
var fs = require('fs');
var path = require('path');
var COMMON  = require('./routes_common');
var d3 = require("d3");
var xmldom = require('xmldom')



module.exports = {

		//
		//  CREATE BARCHARTS HTML
		//
		create_barcharts_html: function( ts ) {
			//console.log(count_matrix)
			//path.join(__dirname, '/tmp/public')
			var infile = path.join(__dirname, '../../tmp/'+ts+'_count_matrix.biom');
			console.log('in create_barcharts_html: '+infile)
			//var infile = 'http://localhost:3000/tmp/'+ts+'_count_matrix.biom';
			fs.readFile(infile, 'utf8', function (err, json) {
  			mtx = JSON.parse(json);
 				var ds_count = mtx.shape[1];			
				var bar_height = 15;
				var props = get_image_properties(bar_height, ds_count);	
  			var unit_list = [];
  			var ds_list = [];
  			for(o in mtx.rows){
  				unit_list.push(mtx.rows[o].id)
  			}
  			for(o in mtx.columns){
  				ds_list.push(mtx.columns[o].id)
  			}
  			console.log(get_colors(unit_list))
  			var color = d3.scale.ordinal()									
			    .range( get_colors(unit_list) );
console.log(unit_list);
			  color.domain(d3.keys(ds_list).filter(function(key) { return key; })); 

			  mtx.data.forEach(function(d) {
			    console.log(d);
			    
			  });

			  //var svgGraph = d3.select('svg').attr('xmlns', 'http://www.w3.org/2000/svg');
				//console.log(svgGraph[0][0]);
				//var svgXML = (new xmldom.XMLSerializer()).serializeToString( svgGraph[0][0] );
				//return svgXML;
			})
			
			

	  } // end fxn


	 
} // end of module.exports
//
//
//
function create_svg_object(props, color, data) {

		  var svg = d3.select("body").append("svg")
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
				     .attr("dy", "1.4em") 
				     
				     
		  svg.append("g")
		      .attr("class", "x axis")
		      .call(props.xAxis)
		   	.append("text")
		      .attr("x", 500)
		      .attr("dy", ".8em")
		      .style("text-anchor", "end")
		      .text("Percent");
		 

		  var datasetName = svg.selectAll(".bar")
		      .data(data)
		    .enter().append("g")
		      .attr("class", "g")
		      .attr("transform", function(d) { return  "translate(0, " + props.y(d.DatasetName) + ")"; });

			//console.log('11')
		  
		  datasetName.selectAll("rect")
		      .data(function(d) { return d.unitObj; })
		    .enter().append("rect")
		      .attr("x", function(d) { return props.x(d.x0); })
		      .attr("y", 15)  // adjust where first bar starts on x-axis
		      .attr("width", function(d) { return props.x(d.x1) - props.x(d.x0); })
		      .attr("height",  18)
		   //    .attr("id",function(d) { 
		   //    	var cnt =  this._parentNode.__data__[d.name];
		   //    	var total = this._parentNode.__data__['total'];
		   //    	//console.log(this._parentNode.__data__['total']);
		   //    	var pct = (cnt * 100 / total).toFixed(2)
		   //     	return this._parentNode.__data__.DatasetName + '-|-' + d.name + '-|-' + cnt.toString() + '-|-' + pct;    // ip of each rectangle should be datasetname-|-unitname-|-count
					// }) 
		      .attr("class","tooltip")
		      .style("fill",   function(d) { return color(d.name); });
		   
}

//
//
//
function get_image_properties(bar_height, ds_count) {
	var props = {};
	
	//props.margin = {top: 20, right: 20, bottom: 300, left: 50};
	props.margin = {top: 20, right: 100, bottom: 20, left: 300};
	//var width  = (ds_count * (bar_width + 5)) + 50 - margin.left - margin.right;
	//props.width  = (ds_count * (bar_width)) + 50;
	//props.height = 700 - props.margin.top - props.margin.bottom;
	var plot_width = 500;
	var gap = 2;  // gap on each side of bar
	props.width = plot_width + props.margin.left + props.margin.right
	props.height = (ds_count * (bar_height + 2 * gap)) + 125;
	//props.x = d3.scale.ordinal().rangeRoundBands([0, props.width], .1);
	//props.y = d3.scale.linear() .rangeRound([props.height, 0]);
	//console.log('1')
	props.x = d3.scale.linear() .rangeRound([0, plot_width]);
	//console.log('2')
	
	props.y = d3.scale.ordinal()
			.rangeBands([0, (bar_height + 2 * gap) * ds_count]);;
			//.rangeRoundBands([0, props.height], .1);
	//console.log('3')
	props.xAxis = d3.svg.axis()
			    .scale(props.x)
			    .orient("top");
	//console.log('4')
	props.yAxis = d3.svg.axis()
			    .scale(props.y)
			    .orient("left");
			    
			        
	return props;
}
//
//
//
function get_colors(unit_names){
	var colors = []
	for(var n in unit_names){
		colors.push(COMMON.string_to_color_code(n));
	}
	return colors;
}
//
//
//
function convert_matrix(mtx) {
		var data = [];
		for(n in mtx.dataset_names) {
			data.push({'DatasetName': mtx.dataset_names[n]});	
		}
		for(u in mtx.unit_names) {
			for(n in mtx.dataset_names) {
				//dname = mtx.dataset_names[n];
				data[n][u] = mtx.unit_names[u][n];
			}
		}
		return data;
}



