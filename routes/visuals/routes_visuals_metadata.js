const path = require('path');
const fs = require('fs-extra');
const COMMON  = require(app_root + '/routes/visuals/routes_common');
const CFG  = require(app_root + '/config/config');
const helpers = require(app_root + '/routes/helpers/helpers');
const C		  = require(app_root + '/public/constants');


module.exports = {
		write_metadata_file: (post_items) => {
			console.log('in metadata: write_metadata_file')
			console.log(post_items)
			var metadata_names = post_items.metadata;
			console.log(metadata_names)
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
					var mdname = metadata_names[n];
					var data = helpers.required_metadata_ids_from_names(METADATA[did], mdname)
								

					if(did in METADATA) {
						ds_row[mdname] = data.value
						metadata2[pjds][mdname] = data.value
						
						if(data.value == '' || data.value == undefined){
							txt2 += "\tundefined";
						}else{
							txt2 += "\t" + data.value
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
		write_mapping_file: (post_items) => {
			console.log('in metadata: write_mapping_file');
			var metadata_names = post_items.metadata;
			
			var metadata = [];
			var metadata2 = {};
			var file_name = post_items.ts+'_metadata.txt';
			var metadata_filename = path.join(CFG.TMP_FILES,file_name);
			var txt = "#SampleID";
			for (var n in metadata_names) {				
					var name = metadata_names[n];
					txt += 		"\t" + name;	
			}
			txt += 		"\tProject\tDescription\n";
			var txt2 = '';
			for (var i in post_items.chosen_datasets) {
			    var did = post_items.chosen_datasets[i].did
				var ds_row = {};
				var pjds = post_items.chosen_datasets[i].name;
				metadata2[pjds] = {};
				var tmp = pjds.split('--');
				
				txt2 = pjds;
				
				for (var mdname_idx in metadata_names) {
					var mdname = metadata_names[mdname_idx];
					//console.log(METADATA[did])
					//console.log(mdname)
					if (did in C.AllMetadata) {
						let data = helpers.required_metadata_ids_from_names(C.AllMetadata[did], mdname);

						ds_row[mdname] = data.value;
						metadata2[pjds][mdname] = data.value;
						if (metadata2[pjds][mdname] == ''){
							txt2 += "\tundefined";
						} else {
							txt2 += "\t" + data.value;
						}
					} else {
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
		create_metadata_table: (chosen_id_name_hash, visual_post_items) => {
				console.log('in metadata: create_metadata_table')
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

