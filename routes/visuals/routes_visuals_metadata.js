var path = require('path');
var fs = require('fs');
var COMMON  = require('./routes_common');




module.exports = {


		write_metadata_file: function(chosen_id_name_hash, post_items) {
			//console.log('in metadata')
			var metadata_names = post_items.metadata;
			
			var metadata = [];
			var metadata2 = {};
			var file_name = post_items.ts+'_metadata.txt';
			var metadata_filename = path.join(__dirname, '../../tmp/'+file_name);
			var txt = 'DATASET';
			for (var n in metadata_names) {				
					var name = metadata_names[n];
					txt += 		"\t" + name;	
			}
			txt += 		"\tproject_dataset\n";
			var txt2 = '';
			for (var i in chosen_id_name_hash.names) {
				var ds_row = {};
				var pjds = chosen_id_name_hash.names[i];
				metadata2[pjds] = {};
				var tmp = pjds.split('--');
				var did = chosen_id_name_hash.ids[i];
				txt2 = pjds;
				
				for (var n in metadata_names) {				
					var name = metadata_names[n];

					if(did in METADATA) {
						ds_row[name] = METADATA[did][name];
						metadata2[pjds][name] = METADATA[did][name];
						
						if(metadata2[pjds][name] == '' || metadata2[pjds][name] == undefined){
							txt2 += "\tundefined";
						}else{
							txt2 += "\t" + metadata2[pjds][name];
						}
					}else{
						txt2 += "\tno_value";
					}
				}
				
				
				if(txt2.length > pjds.length+2){  // the +2 is to account for tabs in the txt2
					txt += txt2 + "\t"+pjds+"\n";
				}
				metadata2[pjds].project = tmp[0];
				metadata2[pjds].dataset = tmp[1];
				
				ds_row.project_dataset = pjds;
				ds_row.project = tmp[0];
				ds_row.dataset = tmp[1];

				metadata.push(ds_row);
				
			}
			COMMON.write_file(metadata_filename, txt);
			return metadata2;
		},
		//
		//
		//
		write_mapping_file: function(chosen_id_name_hash, post_items) {
			//console.log('in metadata')
			var metadata_names = post_items.metadata;
			
			var metadata = [];
			var metadata2 = {};
			var file_name = post_items.ts+'_metadata.txt';
			var metadata_filename = path.join(__dirname, '../../tmp/'+file_name);
			var txt = "#SampleID\tBarcodeSequence\tLinkerPrimerSequence";
			for (var n in metadata_names) {				
					var name = metadata_names[n];
					txt += 		"\t" + name;	
			}
			txt += 		"\tProject\tDescription\n";
			var txt2 = '';
			for (var i in chosen_id_name_hash.names) {
				var ds_row = {};
				var pjds = chosen_id_name_hash.names[i];
				metadata2[pjds] = {};
				var tmp = pjds.split('--');
				var did = chosen_id_name_hash.ids[i];
				txt2 = pjds + "\t\t";
				
				for (var n in metadata_names) {				
					var name = metadata_names[n];
                    
					if(did in METADATA) {
						ds_row[name] = METADATA[did][name];
						metadata2[pjds][name] = METADATA[did][name];
						if(metadata2[pjds][name] == ''){
							txt2 += "\tundefined";
						}else{
							txt2 += "\t" + metadata2[pjds][name];
						}
					}else{
						txt2 += "\tno_value";
					}
				}
				
				//if(txt2.length > pjds.length+2){  // the +2 is to account for tabs in the txt2
					txt += txt2 + "\t"+tmp[0]+ "\t"+pjds+"\n";
				//}
				metadata2[pjds].project = tmp[0];
				metadata2[pjds].dataset = tmp[1];
				
				ds_row.project_dataset = pjds;
				ds_row.project = tmp[0];
				ds_row.dataset = tmp[1];

				metadata.push(ds_row);
				
			}
			COMMON.write_file(metadata_filename, txt);
			return metadata2;
		},
		//
		//
		//
		create_metadata_table: function(chosen_id_name_hash, visual_post_items) {
				var html = "<table border='1' id='metadata_table' class='single_border center_table'>";
				html += "<thead><tr><th>Dataset (sortable)</th><th>Name (sortable)</th><th>Value (sortable)</th></tr></thead><tbody>";
				var found_metadata = false;
				for (var i in chosen_id_name_hash.ids) {
						var did = chosen_id_name_hash.ids[i];
						var ds = chosen_id_name_hash.names[i];

						for(var md_name in METADATA[did]) {	
							found_metadata = true;				

							var md_value = METADATA[did][md_name];
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

