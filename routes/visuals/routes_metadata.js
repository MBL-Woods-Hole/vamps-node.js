var path = require('path');
var fs = require('fs');
var COMMON  = require('./routes_common');


// module.exports = {


// 		write_metadata_file: function(chosen_id_name_hash, post_items) {
// 			//console.log('in metadata')
// 			var metadata_names = post_items.metadata;
// 			//var txt = "project_dataset\tproject\tdataset\n";
// 			var txt = "project_dataset\tproject\tdataset\ttest_color_grouping\n";
// 			//var meta_file = '../../tmp/'+post_items.ts+'_metadata.txt';
// 			var metadata = [];

// 			for(i in chosen_id_name_hash.names) {
// 				var ds = chosen_id_name_hash.names[i];
// 				var tmp = ds.split('--');
// 				if(i % 2 === 0){
// 					var c = test_metadata[0]
// 				}else{
// 					var c = test_metadata[1]
// 				}
// 				//txt += ds + "\t" + tmp[0] + "\t" + tmp[1] +"\t"+c+ "\n";  // just put project and dataset in here for now				
// 				metadata.push({'test_color_group':c,'project_dataset':ds,'project':tmp[0],'dataset':tmp[1]});

// 			}
// 			//console.log('Writing metadata file');
 			
//  			//COMMON.write_file( meta_file, txt );
//  			return metadata
// 		}

// }

module.exports = {


		write_metadata_file: function(chosen_id_name_hash, post_items) {
			//console.log('in metadata')
			var metadata_names = post_items.metadata;
			
			var metadata = [];
			var metadata2 = {};
			for (var i in chosen_id_name_hash.names) {
				var line = {};
				var pjds = chosen_id_name_hash.names[i];
				metadata2[pjds] = {};
				var tmp = pjds.split('--');
				var did = chosen_id_name_hash.ids[i];
				
				for (var n in metadata_names) {				
					var name = metadata_names[n];

					if(did in MetadataValues) {
						line[name] = MetadataValues[did][name];
						metadata2[pjds][name] = MetadataValues[did][name];
					}						
				}
				metadata2[pjds].project = tmp[0];
				metadata2[pjds].dataset = tmp[1];
				line.project_dataset = pjds;
				line.project = tmp[0];
				line.dataset = tmp[1];
				metadata.push(line);
				//txt += ds + "\t" + tmp[0] + "\t" + tmp[1] + "\n";  // just put project and dataset in here for now				
				//metadata.push({'project_dataset':ds,'project':tmp[0],'dataset':tmp[1]});
				
			}
			return metadata2;
		},

		create_metadata_table: function(chosen_id_name_hash, visual_post_items) {
				var html = "<table border='1' id='metadata_table' class='single_border center_table'>";
				html += "<thead><tr><th>Dataset (sortable)</th><th>Name (sortable)</th><th>Value (sortable)</th></tr></thead><tbody>";
				var found_metadata = false;
				for (var i in chosen_id_name_hash.ids) {
						var did = chosen_id_name_hash.ids[i];
						var ds = chosen_id_name_hash.names[i];

						for(var md_name in MetadataValues[did]) {	
							found_metadata = true;				

							var md_value = MetadataValues[did][md_name];
							if(visual_post_items.metadata.indexOf(md_name) !== -1) {  // only show selected metadata names
									html += "<tr><td>"+ds+"</td><td>"+md_name+"</td><td>"+md_value+"</td></tr>";
									
							}
						}
				}
				html += "</tbody></table>";
				
				
				if( ! found_metadata){
					html = "<h2>No Metadata Found</h2>";
				}if( visual_post_items.metadata.length === 0){
					html = "<h2>No Metadata Selected</h2>";
				}
				
				return html;
		}

		
}

