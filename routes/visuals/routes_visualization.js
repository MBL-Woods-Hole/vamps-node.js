var express = require('express');
var router = express.Router();

var util = require('util');
var url  = require('url');
var http = require('http');
var path = require('path');
var fs   = require('fs');
var async = require('async');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
var zlib = require('zlib');
var Readable = require('stream').Readable;

var helpers = require('../helpers/helpers');
var QUERY = require('../queries');


var COMMON  = require('./routes_common');
var META    = require('./routes_metadata');
var PCOA    = require('./routes_pcoa');
var MTX     = require('./routes_counts_matrix');
var HMAP    = require('./routes_distance_heatmap');
var DEND    = require('./routes_dendrogram');
var BCHARTS = require('./routes_bar_charts');
var PCHARTS = require('./routes_pie_charts');
//var CTABLE  = require('./routes_counts_table');
var PythonShell = require('python-shell');
var app = express();
var d3 = require("d3");
var xmldom = require('xmldom');
// // init_node var node_class = 
// var CustomTaxa  = require('./custom_taxa_class');

/*
 * GET visualization page.
 */
router.post('/view_selection', helpers.isLoggedIn, function(req, res) {
  // This page (view_selection) comes after the datasets and units have been selected
  //    in the previous two pages.
  // It should be protected with isLoggedIn like /unit_selection below.
  // The function call will look like this when isLoggedIn is in place:
  //            router.post('/view_selection', isLoggedIn, function(req, res) {
  // This page is where the user will choose to view his/her selected visuals.
  // The left side will show a synopsis of what choices the user has made:
  //    datasets, normalization, units and any specifics such as tax rank, domain, NAs ....
  // The middle section will have a list of buttons allowing download of files
  // And the right side will have links to the previously selected visuals.
  // Before this page is rendered the visuals should have been created using the functions called below.
  // The visual pages will be created in a public directory and each page will have a random number or timestamp
  //    attached so the page is private and can be deleted later.
  // TESTING:
  //    There should be one or more datasets shown in list
  //    There should be one or more visual choices shown.
  //
  //var body = JSON.parse(req.body);
  console.log('req.body: view_selection-->>');
  console.log(req.body);
  console.log('req.body: view_selection');
  //console.log(TaxaCounts['27'])
  //console.log('1');
  
  // GLOBAL Variable
  visual_post_items = COMMON.save_post_items(req);

  var data_source_testing = 'json';   // options: json, db, hdf5
  helpers.start = process.hrtime();
  helpers.elapsed_time("START: in view_selection using data_source_testing= "+data_source_testing+" -->>>>>>");
  //
  //
  //
  if(data_source_testing == 'json') {
    // GLOBAL
    var timestamp = +new Date();  // millisecs since the epoch!
    var user = req.user || 'no-user';
    timestamp = user + '_' + timestamp;
    visual_post_items.ts = timestamp;
    distance_matrix = {};
    biom_matrix = MTX.get_biom_matrix(chosen_id_name_hash, visual_post_items);
    visual_post_items.max_ds_count = biom_matrix.max_dataset_count;
    
    
    // GLOBAL
    console.log('metadata');
    metadata = META.write_metadata_file(chosen_id_name_hash, visual_post_items);
    //metadata = JSON.parse(metadata);
    console.log(metadata);
    console.log('metadata');
    //console.log('MAP:::');
    //console.log(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank)
    //console.log(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["724_class"]["taxon"])

    //
    //uid_matrix = MTX.fill_in_counts_matrix( selection_obj, unit_field );  // just ids, but filled in zeros
    // {unit_id:[cnt1,cnt2...] // counts are in ds order
    console.log('visual_post_items:>>');
    console.log(visual_post_items); 
    console.log('<<visual_post_items:');
    //console.log(biom_matrix);        
     
    //req.flash('info', 'Datasets are updated!')
    res.render('visuals/view_selection', { 
                                  title     :           'VAMPS: Visuals Select',
                                  chosen_id_name_hash : JSON.stringify(chosen_id_name_hash),
                                  matrix    :           JSON.stringify(biom_matrix),
                                  metadata  :           JSON.stringify(metadata),
                                  constants :           JSON.stringify(req.C),
                                  post_items:           JSON.stringify(visual_post_items),   
                                  user      :           req.user,
                                  messages  : {}
                   });
    helpers.elapsed_time(">>>>>>>> 2 After Page Render using data_source_testing= "+data_source_testing+" <<<<<<"); 
  
  }else if(data_source_testing == 'db') {
    var uitems = visual_post_items.unit_choice.split('_');
    unit_name_query = QUERY.get_taxonomy_query( req.db, uitems, chosen_id_name_hash, visual_post_items );
    req.db.query(unit_name_query, function(err, rows, fields){
        if (err) {
          throw err;
        } else {   
          

          // GLOBAL
          distance_matrix = {};
          biom_matrix = MTX.get_biom_matrix(chosen_id_name_hash, visual_post_items, rows);
          visual_post_items.max_ds_count = biom_matrix.max_dataset_count;
          metadata = META.write_metadata_file(chosen_id_name_hash, visual_post_items, rows);
          
          res.render('visuals/view_selection', { 
                                  title     :           'VAMPS: Visuals Select',
                                  chosen_id_name_hash : JSON.stringify(chosen_id_name_hash),
                                  matrix    :           JSON.stringify(biom_matrix),
                                  metadata  :           JSON.stringify(metadata),
                                  constants :           JSON.stringify(req.C),
                                  post_items:           JSON.stringify(visual_post_items),          
                                  user      :           req.user,
                                  messages  : {}
                       });
          
        }
        helpers.elapsed_time(">>>>>>>> 2 After Page Render using data_source_testing= "+data_source_testing+" <<<<<<"); 
    });
    

  }else if(data_source_testing == 'hdf5') {
    // TODO TODO
  }
  
 
});


// use the isLoggedIn function to limit exposure of each page to
// logged in users only
router.post('/unit_selection', helpers.isLoggedIn, function(req, res) {
//router.post('/unit_selection',  function(req, res) {
  
  // TESTING:
  //    There should be one or more datasets shown in list
  //    The Submit button should return with an alert error if no display checkboxes are checked
  //    There should be a 'default' Units Selection present (This point is debatable -- the other option
  //        would be leave blank and force the user to select). I chose Silva108--Simple Taxonomy as default.
  //    The 'Display Output' section should list the items from public/constants.js
  //    The 'Normailzation' section should list the items from public/constants.js with the NotNormalized option
  //        checked by default.
  //console.log('START BODY>> in route/visualization.js /unit_selection');
  //console.log(JSON.stringify(req.body));
  //console.log('<<END BODY');
  console.log('req.body: unit_selection-->>');
  console.log(req.body);
  console.log('req.body: unit_selection');
  if(req.body.search == '1'){
    dataset_ids = JSON.parse(req.body.dataset_ids);
  }else{
    dataset_ids = req.body.dataset_ids;
  }
  var available_units = req.C.AVAILABLE_UNITS; // ['med_node_id','otu_id','taxonomy_gg_id']

  // GLOBAL Variable
  chosen_id_name_hash           = COMMON.create_chosen_id_name_hash(dataset_ids);
  
  var custom_metadata_selection = COMMON.get_custom_meta_selection(chosen_id_name_hash.ids)
  //console.log('chosen_id_name_hash')
  //console.log(chosen_id_name_hash)
  // // benchmarking
  // var start = process.hrtime();
  // 
  // // benchmarking
  // var elapsed_time = function(note){
  //     var precision = 3; // 3 decimal places
  //     var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
  //     console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
  //     //start = process.hrtime(); // reset the timer
  // };

  // benchmarking
  helpers.start = process.hrtime();
  helpers.elapsed_time("START: select from sequence_pdr_info and sequence_uniq_info-->>>>>>");
  
  
     
  console.log('chosen_id_name_hash-->');
  console.log(chosen_id_name_hash);
  console.log('<--chosen_id_name_hash');
    

  res.render('visuals/unit_selection', {   
                    title: 'VAMPS: Units Selection',
                    chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
                    constants    : JSON.stringify(req.C),
                    md_cust      : JSON.stringify(custom_metadata_selection),  // should contain all the cust items that selected datasets have
                    user         : req.user
  });  // end render
    // benchmarking
  helpers.elapsed_time(">>>>>>>> 4 After Page Render <<<<<<");   
   

}); // end fxn

/*
 * GET visualization page.
 */
router.get('/index_visuals', helpers.isLoggedIn, function(req, res) {
  // This page is arrived at using GET from the Main Menu
  // It will be protected usind the helpers.isLoggedIn function
  // TESTING:
  //      Should show the closed project list on initialize
  //      The javascript functions (load_project_select, set_check_project, open_datasets, toggle_selected_datasets)
  //        should work to open the project (show and check the datasets) when either the plus image is clicked or the
  //        checkbox is selected. Clicking the minus image should deselect the datasets and close the dataset list.
  //        While the project is open clicking on the project checkbox should toggle all the datasets under it.
  //      Clicking the submit button when no datasets have been selected should result in an alert box and a
  //      return to the page.
  //console.log(ALL_DATASETS);
  //console.log(req.user)
  res.render('visuals/index_visuals', { 
                                title   : 'VAMPS: Select Datasets',
                                rows    : JSON.stringify(ALL_DATASETS),
                                permissions: JSON.stringify(PROJECT_PERMISSION_BY_PID),
                                constants    : JSON.stringify(req.C),
                                user: req.user
                            });
});
//
//
//
router.post('/search_datasets', helpers.isLoggedIn, function(req, res) {
  console.log('req.body-->>');
  console.log(req.body);
  console.log('<<--req.body');

  var search_function = req.body.search_function;
  var searches = {};
  var allowed = [ 'search1', 'search2', 'search3' ];
  if(search_function === 'search_metadata_all_datasets'){
    for(name in req.body){  
      items = name.split('_');
      var search = items[0];
      if(allowed.indexOf(search) != -1){
        if( !(search  in searches)){
          searches[search] = {};
        }
        searches[search][items[1]] = req.body[name];
      }
    }
  }
  var join_type = req.body.join_type;
  console.log(searches)

  // search datasets
  //console.log(MetadataValues);
  // This assumes that ALL datasets are in MetadataValues. 
  //var datasets = [];
   // use for posting to unit_selection
  //
  //
  
  //
  var ds1, ds2, ds3 = [];
  var result = get_search_datasets(req.user, searches.search1, MetadataValues);
  ds1 = result.datasets
  searches.search1.datasets = result.datasets;
  searches.search1.dataset_count = searches.search1.datasets.length;
  searches.search1.ds_plus = get_dataset_search_info(result.datasets, searches.search1);
  
  
  if('search2' in searches){
    //if(join_type == 'intersect'){
    //  var md_hash = result.mdv
    //}else{  // summation
      var md_hash =  MetadataValues;
    //}
    var result = get_search_datasets(req.user, searches.search2, md_hash);
    ds2 = result.datasets;
    searches.search2.datasets = result.datasets;
    searches.search2.dataset_count = searches.search2.datasets.length;
    //console.log('result.mdv2')
    //console.log(result.mdv)
    searches.search2.ds_plus = get_dataset_search_info(result.datasets, searches.search2);

  }
  
  if('search3' in searches){
    //if(join_type == 'intersect'){
    //  var md_hash = result.mdv
    //}else{
      var md_hash =  MetadataValues;
    //}
    var result = get_search_datasets(req.user, searches.search3, md_hash);
    ds3 = result.datasets;
    searches.search3.datasets = result.datasets;
    searches.search3.dataset_count = searches.search3.datasets.length;
    //console.log('result.mdv3')
    //console.log(result.mdv)
    searches.search3.ds_plus = get_dataset_search_info(result.datasets, searches.search3);
  }
  //
  // Calculate (sum or intersect) final datasets
  //
  var filtered = {};
  if(join_type == 'combination'){
    filtered.datasets = ds1.concat(ds2, ds3);
    filtered.datasets = filtered.datasets.filter(onlyUnique);
  }else{   // intersection
    filtered.datasets = ds1;
    if('search2' in searches) { 
      filtered.datasets = ds1.filter(function(n) {
          return ds2.indexOf(n) != -1
      });
    }
    if('search3' in searches) { 
      filtered.datasets = filtered.datasets.filter(function(n) {
          return ds3.indexOf(n) != -1
      });
    }
  }
  filtered.ds_plus = get_dataset_search_info(filtered.datasets, {});
  //
  //
  //searches.search1.dataset_count = ds.dataset_ids.length;
  
  
  console.log('searches')
  console.log(searches)
  
  console.log('final');
  console.log(filtered.datasets);
  //searches.dataset_count = result.datasets.length;
  
//  { dataset_ids:
//   [ '142--BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_1Step',
//     '146--BPC_1V2STP_Bv4v5--SLM_NIH_19SS_rep1_2Step' ],
//   }
  
  //if(ds.dataset_ids.length != 0){
  // if(('data' in searches.search1 && searches.search1['data'].length > 0) || 
  //    ('single-comparison-value' in searches.search1 && searches.search1['single-comparison-value'] != '')  || 
  //    (('min-comparison-value'   in searches.search1 && searches.search1['min-comparison-value']    != '') &&
  //     ('max-comparison-value'   in searches.search1 && searches.search1['max-comparison-value']    != ''))
  //     ){
  //if(!('single-comparison-value' in searches.search1)){
          res.render('visuals/search_datasets', {   
                    title    : 'VAMPS: Search Datasets',
                    filtered : JSON.stringify(filtered),
                    searches : JSON.stringify(searches),
                    join_type: join_type,
                    //dids     : JSON.stringify(result.datasets),
                    user     : req.user
          });  // 
  //}else{
  //  console.log('no data selected or entered')
  //}

});
//
//
//
router.get('/reorder_datasets', helpers.isLoggedIn, function(req, res) {
  
  res.render('visuals/reorder_datasets', { 
                                title   : 'VAMPS: Reorder Datasets',
                                chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
                                constants    : JSON.stringify(req.C),
                                user: req.user
                            });
  //console.log(chosen_id_name_hash)
});





router.post('/heatmap', function(req, res) {
    //console.log('found routes_test_heatmap')
    //console.log('req.body hm');
    //console.log(req.body);
    //console.log('req.body hm');
    var ts = req.body.ts
    var metric = req.body.metric;
    var biom_file_name = ts+'_count_matrix.biom';
    var biom_file = path.join(__dirname, '../../tmp/'+biom_file_name);
    
    //console.log('mtx1')
  
  //mtx = COMMON.run_pyscript_cmd(req,res, ts, biom_file, 'heatmap', metric);
    var exec = require('child_process').exec;
    //var PythonShell = require('python-shell');
    var html = '';
    var title = 'VAMPS';
    
    var distmtx_file_name = ts+'_distance.csv'
    var distmtx_file = path.join(__dirname, '../../tmp/'+distmtx_file_name);
    var site_base = path.join(__dirname, '../../');
    var options = {
      scriptPath : 'public/scripts',
      args :       [ '-in', biom_file, '-metric', metric, '--function', 'dheatmap', '--site_base', site_base, '--prefix', ts], 
    };
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '))
    PythonShell.run('distance.py', options, function (err, mtx) {
      if (err) throw err;
      distance_matrix = JSON.parse(mtx);
      console.log('dmtx')
      console.log(distance_matrix)
      var m = JSON.stringify(mtx)
      res.render('visuals/partials/load_distance',{
                                        dm        : distance_matrix,
                                        constants : JSON.stringify(req.C),
                                      })
      
    });

});

//
//   F R E Q U E N C Y  H E A T M A P
//
router.post('/frequency_heatmap', function(req, res) {
  
  console.log('in Freq HP')
  var ts = req.body.ts
  var metric = req.body.metric;
  var biom_file_name = ts+'_count_matrix.biom';
  var biom_file = path.join(__dirname, '../../tmp/'+biom_file_name);
    
  var exec = require('child_process').exec;
  //var PythonShell = require('python-shell');
  var html = '';
  var title = 'VAMPS';
    
  var distmtx_file_name = ts+'_distance.csv'
  var distmtx_file = path.join(__dirname, '../../tmp/'+distmtx_file_name);
  var site_base = path.join(__dirname, '../../');
  
  var fheatmap_script_file = path.resolve(__dirname, '../../public/scripts/fheatmap.R');

  shell_command = [req.C.RSCRIPT_CMD, fheatmap_script_file, biom_file, visual_post_items.selected_distance, visual_post_items.tax_depth, ts ].join(' ');
     
  COMMON.run_script_cmd(req, res, ts, shell_command, 'fheatmap');
      

});
router.post('/dendrogram', function(req, res) {
    console.log('found routes_dendrogram')
    
    //console.log('req.body dnd');
    //console.log(req.body);
    //console.log('req.body dnd');
    var ts = req.body.ts
    var metric = req.body.metric;
    var image_type = req.body.image_type;
    var biom_file_name = ts+'_count_matrix.biom';
    var biom_file = path.join(__dirname, '../../tmp/'+biom_file_name);
    
   
    var exec = require('child_process').exec;
    //var PythonShell = require('python-shell');
    var html = '';
    var title = 'VAMPS';
    
    var distmtx_file_name = ts+'_distance.csv'
    var distmtx_file = path.join(__dirname, '../../tmp/'+distmtx_file_name);
    var site_base = path.join(__dirname, '../../');
    
    var options = {
      scriptPath : 'public/scripts',
      args :       [ '-in', biom_file, '-metric', metric, '--function', 'dendrogram-'+image_type, '--site_base', site_base, '--prefix', ts ], 
    };
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '))
    
    PythonShell.run('distance.py', options, function (err, output) {
      if (err) throw err;
      
      //var m = JSON.stringify(mtx)
      if(image_type == 'svg'){
        console.log(JSON.parse(output))
        var d3 = require("d3");
        var xmldom = require('xmldom');
        var Newick    = require('../../public/javascripts/newick');
        var Phylogram = require('../../public/javascripts/d3.phylogram');
        newick = JSON.parse(output);
        //console.log('Newick ',newick)
        var json  = Newick.parse(newick);
        console.log(JSON.stringify(json,null,4))
        var newickNodes = [];
        function buildNewickNodes(node, callback) {
          newickNodes.push(node);
          if (node.branchset) {
            for (var i=0; i < node.branchset.length; i++) {
              buildNewickNodes(node.branchset[i]);
            }
          }
        }
        buildNewickNodes(json);

        var tree_data = d3.phylogram.build('body', json, {
          width: 300,
          height: visual_post_items.no_of_datasets*100
        });

        var svgXML = (new xmldom.XMLSerializer()).serializeToString( tree_data.vis[0][0] );
        var html = "<svg height='"+(visual_post_items.no_of_datasets*100)+"' width='900'>"+svgXML+"</svg>";
         
        d3.select('svg').remove(); 
        
        //console.log(html);
        
      }else{

         var image = '/tmp_images/'+ts+'_dendrogram.pdf'
            var html = "<div id='pdf'>";
            html += "<object data='"+image+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='1000' height='900' />";
            html += " <p>ERROR in loading pdf file</p>";
            html += "</object></div>"
      }
      res.send(html);
      

    });

});
//
// P I E C H A R T  -- S I N G L E
//
router.get('/user_data/piechart_single', function(req, res) {
    var myurl = url.parse(req.url, true);
    //console.log(myurl)
    var ts = myurl.query.ts;
    var ds_name = myurl.query.ds;
    var html  = COMMON.start_visuals_html('piechart');
    
    html += PCHARTS.create_single_piechart_html ( ts, ds_name, res );

    res.render('visuals/user_data/piechart_single', {
          title: 'VAMPS Single PieChart:',
          subtitle: ds_name,
          timestamp: ts || 'default_timestamp',
          dataset: ds_name,
          html: html,
          user: req.user
        });

});





 // P C O A

router.post('/pcoa', function(req, res) {
    console.log('in PCoA')
    console.log(metadata)
    var ts = req.body.ts
    var metric = req.body.metric;
    var biom_file_name = ts+'_count_matrix.biom';
    var biom_file = path.join(__dirname, '../../tmp/'+biom_file_name);
    var site_base = path.join(__dirname, '../../');
    var exec = require('child_process').exec;
    var options = {
      scriptPath : 'public/scripts',
      args :       [ '-in', biom_file, '-metric', metric, '--function', 'pcoa', '--site_base', site_base, '--prefix', ts], 
    };
    console.log(options.scriptPath+'/distance.py '+options.args.join(' '))
    PythonShell.run('distance.py', options, function (err, pcoa_data) {
      if (err) throw err;
      //console.log(pcoa_data)
      //pcoa_data = JSON.parse(pcoa_data)
      //console.log(pcoa_data); 

      var image = '/tmp_images/'+ts+'_pcoa.pdf'
      var html = "<div id='pdf'>";
      html += "<object data='"+image+"?zoom=100&scrollbar=0&toolbar=0&navpanes=0' type='application/pdf' width='1000' height='900' />";
      html += " <p>ERROR in loading pdf file</p>";
      html += "</object></div>"
      console.log(html)
      res.send(html);


      
    });    

});


//
//  G E O S P A T I A L
//
router.get('/user_data/geospatial', function(req, res) {
  var myurl = url.parse(req.url, true);
  
  var ts    = myurl.query.ts;
  var html  = COMMON.start_visuals_html('geospatial');
  
  res.render('visuals/user_data/geospatial', {
            title: 'VAMPS Geospatial Data',
            timestamp: ts || 'default_timestamp',
            html : html+"<h2>Not Coded Yet</h2>",
            user: req.user
      });
 

});
router.get('/user_data/test_page', function(req, res) {
  
  res.render('visuals/user_data/test_page', {
            title: 'VAMPS TEST',
            
      });
 

});
/*
*   PARTIALS
*      These six partials all belong to the unit_selection page
*      and are shown via ajax depending on user selection in combo box
*       on that page.  AAV
*/
router.get('/partials/tax_silva108_simple',  function(req, res) {
    res.render('visuals/partials/tax_silva108_simple', {
        doms: req.C.DOMAINS
    });
});
//
//
//

// benchmarking
// var start = process.hrtime();
// 
// var elapsed_time = function(note){
//     var precision = 3; // 3 decimal places
//     var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
//     console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
//     start = process.hrtime(); // reset the timer
// };
router.get('/partials/load_metadata',  function(req, res) {
  var myurl = url.parse(req.url, true);
  var load = myurl.query.load  || 'all'   // either 'all' or 'selected'
  res.render('visuals/partials/load_metadata', 
    { title   : 'metadata_table',
      load    : load
    });
});
router.get('/partials/tax_silva108_custom',  function(req, res) {
  res.render('visuals/partials/tax_silva108_custom', 
    { title   : 'Silva(v108) Custom Taxonomy Selection'});
});

router.get('/partials/tax_gg_custom',  function(req, res) {
    res.render('visuals/partials/tax_gg_custom',{});
});
router.get('/partials/tax_gg_simple',  function(req, res) {
    res.render('visuals/partials/tax_gg_simple',{});
});
router.get('/partials/otus',  function(req, res) {
    res.render('visuals/partials/otus',{});
});
router.get('/partials/med_nodes',  function(req, res) {
    res.render('visuals/partials/med_nodes',{});
});



module.exports = router;

/**
* F U N C T I O N S
*/

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
//
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
//
function get_search_datasets(user, search, metadata){
  //var datasets_plus = [];
  var datasets = [];  // use for posting to unit_selection
  var tmp_metadata = {};
  for(did in metadata){
    
    // search only if did allowed by permissions
    var pid = PROJECT_ID_BY_DID[did];
    if(user.security_level === 1 || PROJECT_PERMISSION_BY_PID[pid]  === 0 || PROJECT_PERMISSION_BY_PID[pid] === user.user_id ){
      console.log('IN METADATA')
      for(mdname in metadata[did]){
        if(mdname === search['metadata-item']){
          
          mdvalue = metadata[did][mdname];
            
          if(('comparison' in search) && (search['comparison'] === '1-equal_to')){
            search_value = Number(search['single-comparison-value']);
            if( Number(mdvalue) ===  search_value ){
              console.log('1-equal-to: val '+mdname+' - '+mdvalue)
              datasets.push(did);
              //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
              //ds.dataset_ids.push(ds_req);
              if(did in tmp_metadata){
                tmp_metadata[did] = metadata[did];
              }else{
                tmp_metadata[did]={};
                tmp_metadata[did] = metadata[did];
              }
            }
          }else if('comparison' in search && search['comparison'] === '2-less_than'){
            search_value = Number(search['single-comparison-value']);
            if(Number(mdvalue) <= search_value){
              console.log('2-less_than: val '+mdname+' - '+mdvalue)
              datasets.push(did);
              //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
              //ds.dataset_ids.push(ds_req);
              if(did in tmp_metadata){
                tmp_metadata[did] = metadata[did];
              }else{
                tmp_metadata[did]={};
                tmp_metadata[did] = metadata[did];
              }
            }
          }else if('comparison' in search && search['comparison'] === '3-greater_than'){
            search_value = Number(search['single-comparison-value']);
            if(Number(mdvalue) >= search_value){
              console.log('3-greater_than: val '+mdname+' - '+mdvalue);
              datasets.push(did);
              //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
              //ds.dataset_ids.push(ds_req);
              if(did in tmp_metadata){
                tmp_metadata[did] = metadata[did];
              }else{
                tmp_metadata[did]={};
                tmp_metadata[did] = metadata[did];
              }
            }
          }else if('comparison' in search && search['comparison'] === '4-not_equal_to'){
            search_value = Number(search['single-comparison-value']);
            if(Number(mdvalue) !== search_value){
              console.log('4-not_equal_to: val '+mdname+' - '+mdvalue);
              datasets.push(did);
              //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
              //ds.dataset_ids.push(ds_req);
              if(did in tmp_metadata){
                tmp_metadata[did] = metadata[did];
              }else{
                tmp_metadata[did]={};
                tmp_metadata[did] = metadata[did];
              }
            }
          }else if('comparison' in search && search['comparison'] === '5-between_range'){
            min_search_value = Number(search['min-comparison-value']);
            max_search_value = Number(search['max-comparison-value']);
            if(Number(mdvalue) > min_search_value && Number(mdvalue) < max_search_value){
              console.log('6-outside_range - mdval: '+mdname+' -- '+mdvalue+' search: '+min_search_value + ' - '+max_search_value );
              datasets.push(did);
              //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
              //ds.dataset_ids.push(ds_req);
              if(did in tmp_metadata){
                tmp_metadata[did] = metadata[did];
              }else{
                tmp_metadata[did]={};
                tmp_metadata[did] = metadata[did];
              }
            }

          }else if('comparison' in search && search['comparison'] === '6-outside_range'){
            min_search_value = Number(search['min-comparison-value']);
            max_search_value = Number(search['max-comparison-value']);
            if(Number(mdvalue) < min_search_value || Number(mdvalue) > max_search_value){
              console.log('6-outside_range - mdval: '+mdname+' -- '+mdvalue+' search: '+min_search_value + ' - '+max_search_value );
              datasets.push(did);
              //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
              //ds.dataset_ids.push(ds_req);
              if(did in tmp_metadata){
                tmp_metadata[did] = metadata[did];
              }else{
                tmp_metadata[did]={};
                tmp_metadata[did] = metadata[did];
              }
            }

          }else if('data' in search){
            list = search['data']
            if(list.indexOf(mdvalue) != -1){
              console.log('DATA: val '+did+' - '+mdname+' - '+mdvalue);
              datasets.push(did);
              //datasets_plus.push({did:did,dname:dname,pid:pid,pname:pname});
              //ds.dataset_ids.push(ds_req);
              if(did in tmp_metadata){
                tmp_metadata[did] = metadata[did];
              }else{
                tmp_metadata[did]={};
                tmp_metadata[did] = metadata[did];
              }
            }
          }
        }
      }
    }
  }
  return {datasets:datasets, mdv:tmp_metadata};
}
function get_dataset_search_info(ds, search){
    var ds_plus = [];
    for(var i in ds){
      var did = ds[i];
      var dname = DATASET_NAME_BY_DID[did];
      var pid = PROJECT_ID_BY_DID[did];
      var pname = PROJECT_INFORMATION_BY_PID[pid].project
      //var ds_req = did+'--'+pname+'--'+dname;
      if(search == {}){
        ds_plus.push({ did:did, dname:dname, pid:pid, pname:pname });
      }else{
        ds_plus.push({ did:did, dname:dname, pid:pid, pname:pname, value:MetadataValues[did][search["metadata-item"]] });
      }
    }
    return ds_plus;
}

//
//
//


