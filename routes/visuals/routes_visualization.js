const express = require('express');
const router = express.Router();

// const util = require('util');
const url  = require('url');
// const http = require('http');
const path = require('path');
const fs   = require('fs-extra');
const multer    = require('multer');
const CFG  = require(app_root + '/config/config');
const upload = multer({ dest: CFG.TMP, limits: { fileSize: CFG.UPLOAD_FILE_SIZE.bytes }  });
const helpers = require(app_root + '/routes/helpers/helpers');
const QUERY = require(app_root + '/routes/queries');

const COMMON  = require(app_root +'/routes/visuals/routes_common');
const C		  = require(app_root + '/public/constants');
const META    = require(app_root + '/routes/visuals/routes_visuals_metadata');
const IMAGES  = require(app_root + '/routes/routes_images');
const biom_matrix_controller = require(app_root + '/controllers/biomMatrixController');
const visualization_controller = require(app_root + '/controllers/visualizationController');
const file_controller = require(app_root + '/controllers/fileController');
const spawn = require('child_process').spawn;
// const app = express();
// const js2xmlparser = require("js2xmlparser");
// const xml_convert = require('xml-js');

const viz_files_obj = new file_controller.visualizationFiles();
const file_path_obj = new file_controller.FilePath();

function start_visual_post_items(req) {
  const visualization_obj = new visualization_controller.viewSelectionFactory(req);
  // let dataset_ids = visualization_obj.dataset_ids;
  let visual_post_items = visualization_obj.visual_post_items;

  // get dataset_ids the add names for biom file output:
  // chosen_id_order was set in unit_select and added to session variable
  //console.log('visual_post_items.chosen_datasets1');
  //console.log(visual_post_items.chosen_datasets);
  visual_post_items.chosen_datasets = req.session.project_dataset_vars.current_project_dataset_obj_w_keys;
//console.log('visual_post_items.chosen_datasets2');
//console.log(visual_post_items.chosen_datasets);
  console.log('VS--visual_post_items and id-hash:>>');
  let msg = 'visual_post_items: ' + JSON.stringify(visual_post_items) + '\n\nreq.session: ' + JSON.stringify(req.session);
  helpers.print_log_if_not_vamps(msg);
  console.log('<<VS--visual_post_items');

  return visual_post_items;
}

//
//  V I E W  S E L E C T I O N
//
// test: get graphics ("show available graphics")
router.post('/view_selection', [helpers.isLoggedIn, upload.single('upload_files', 12)], (req, res) => {
  console.log('in POST view_selection');
  /*
     var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
  console.log('query', req.query)
  console.log('file',req.file)
  console.log('body',req.body);
  console.log('upload',upload.single('upload_files', 12))
  This page (view_selection) comes after the datasets and units have been selected
     in the previous two pages.
  It should be protected with isLoggedIn like /unit_selection visualizationCommonVariablesbelow.
  The function call will look like this when isLoggedIn is in place:
             router.post('/view_selection', isLoggedIn, (req, res) => {
  This page is where the user will choose to view his/her selected visuals.
  The left side will show a synopsis of what choices the user has made:
     datasets, normalization, units and any specifics such as tax rank, domain, NAs ....
  The middle section will have a list of buttons allowing download of files
  And the right side will have links to the previously selected visuals.
  Before this page is rendered the visuals should have been created using the functions called below.
  The visual pages will be created in a public directory and each page will have a random number or timestamp
     attached so the page is private and can be deleted later.
  TESTING:
     There should be one or more datasets shown in list
     There should be one or more visual choices shown.

  var body = JSON.parse(req.body);
  if(typeof visual_post_items == undefined){
  */
  // initialize the session
  req.session.otus = false;
  req.session.biom_matrix = {}
  console.log(req.user.username+' req.body: view_selection body-->>');
  helpers.print_log_if_not_vamps('req.body = ' + JSON.stringify(req.body));
  console.log('<<--req.body: view_selection');
  console.log('req.session ==>>');
  helpers.print_log_if_not_vamps(req.session)
  console.log('<<--req.body: req.session -- don"t pollute the session');

  helpers.start = process.hrtime();
  let image_to_open = {};

  let visual_post_items = start_visual_post_items(req);
  
  console.log('visual_post_itemsXX');
  console.log(visual_post_items);
  visual_post_items.ts = viz_files_obj.get_user_timestamp(req);

  console.log('entering MTX.get_biom_matrix');
  // console.time("TIME: biom_matrix_new");
  const biom_matrix_obj = new biom_matrix_controller.BiomMatrix(req, visual_post_items);
  let biom_matrix = biom_matrix_obj.biom_matrix;
  // console.timeEnd("TIME: biom_matrix_new");

  visual_post_items.max_ds_count = biom_matrix.max_dataset_count;

  if (visual_post_items.metadata.includes('primer_suite')){
    visual_post_items.metadata.push('primers');
  }
  // sort vpi.metadata non-case sensitive
  visual_post_items.metadata.sort(function (a, b) {
    	return a.toLowerCase().localeCompare(b.toLowerCase());
  });
  let metadata = META.write_mapping_file(visual_post_items);

  console.log('image to open', image_to_open);

  let needed_constants = helpers.retrieve_needed_constants(C,'view_selection');
console.log('visual_post_items')
console.log(visual_post_items)
  res.render('visuals/view_selection', {
    title           : 'VAMPS: Visuals Select',
    referer         : 'unit_selection',
    matrix          : JSON.stringify(biom_matrix),
    metadata        : JSON.stringify(metadata),
    constants       : JSON.stringify(needed_constants),
    post_items      : JSON.stringify(visual_post_items),
    user            : req.user,
    hostname        : CFG.hostname,
    token           : CFG.MAPBOX_TOKEN,
    image_to_render : JSON.stringify(image_to_open),
  });
});

function get_dataset_ids(req) {
  let dataset_ids = [];
  if (req.body.api === '1'){
    console.log('API-API-API');
    dataset_ids = JSON.parse(req.body.ds_order);
  } else if (req.body.resorted === '1'){
    dataset_ids = req.body.ds_order;
  } else if (req.body.from_geo_search === '1'){
    dataset_ids = req.body.dids;
  } else {
    dataset_ids = JSON.parse(req.body.dataset_ids);
  }
  return dataset_ids;
}

function no_data(req, res, needed_constants) {
  console.log('redirecting back -- no data selected');
  req.flash('fail', 'Select Some Datasets');
  render_visuals_index(req, res, needed_constants);
}

//
// U N I T  S E L E C T I O N
//
// use the isLoggedIn function to limit exposure of each page to
// logged in users only
// test: select datasets
router.post('/unit_selection', helpers.isLoggedIn, (req, res) => {
  console.log("req.session.unit_choice: ");
  console.log(req.session.unit_choice);
  let current_unit_choice = "";
  if (typeof unit_choice === 'undefined'){
    current_unit_choice = 'tax_' + C.default_taxonomy.name + '_simple';
    console.log(current_unit_choice);
  }
  else {
    current_unit_choice = unit_choice;
  }

  console.log(req.user.username+' req.body: unit_selection-->>');
  helpers.print_log_if_not_vamps(JSON.stringify(req.body));
  console.log('req.body: unit_selection');

  let dataset_ids = get_dataset_ids(req);
  /*
  * I call this here and NOT in view_selection
  A user can jump here directly from geo_search
  However a user can jump directly to view_select from
  saved datasets which they could conceivably manipulate
  * */

  dataset_ids = helpers.screen_dids_for_permissions(req, dataset_ids);

  helpers.print_log_if_not_vamps('dataset_ids ' + JSON.stringify(dataset_ids));

  let needed_constants = helpers.retrieve_needed_constants(C,'unit_selection');
  if (dataset_ids === undefined || dataset_ids.length === 0) {
    no_data(req, res, needed_constants);
    return;
  }
  else {
    req.session.chosen_id_order = dataset_ids;
    req.session.project_dataset_vars = new visualization_controller.visualizationCommonVariables(req);

    // Thes get only the names of the available metadata:
    let custom_metadata_headers   = COMMON.get_metadata_selection(dataset_ids, 'custom');
    let required_metadata_headers = COMMON.get_metadata_selection(dataset_ids, 'required');

    let chosen_dataset_order = req.session.project_dataset_vars.current_project_dataset_obj_w_keys;
    chosen_dataset_order.map(ob => {
      viz_files_obj.test_if_json_file_exists(req, dataset_ids, ob.did);
    });

    // benchmarking
    helpers.start = process.hrtime();
    helpers.elapsed_time("START: select from sequence_pdr_info and sequence_uniq_info-->>>>>>");

    console.log('chosen_dataset_order-->');
    helpers.print_log_if_not_vamps(chosen_dataset_order);
    console.log('<--chosen_dataset_order');

    res.render('visuals/unit_selection', {
      title: 'VAMPS: Units Selection',
      referer: 'visuals_index',
      chosen_datasets: JSON.stringify(chosen_dataset_order),
      constants    : JSON.stringify(needed_constants),
      md_cust      : JSON.stringify(custom_metadata_headers),  // should contain all the cust headers that selected datasets have
      md_req       : JSON.stringify(required_metadata_headers),   //
      unit_choice  : current_unit_choice,
      user         : req.user,
      hostname     : CFG.hostname,
    });  // end render
  }
  // benchmarking
  helpers.elapsed_time(">>>>>>>> 4 After Page Render <<<<<<");

}); // end fxn

/*
 * GET visualization page.
 */

//TODO: test     for (const pj of obj) {
function get_data_to_open(req) {
  let local_data_to_open = {};
  if (req.body.data_to_open) {
    // open many projects
    let obj = JSON.parse(req.body.data_to_open);
    for (let pj in obj){
      let pid = C.PROJECT_INFORMATION_BY_PNAME[pj].pid;
      local_data_to_open[pid] = obj[pj];
    }
    //console.log('got data to open '+data_to_open)
  } else if (req.body.project){
    // open whole project
    local_data_to_open[req.body.project_id] = C.DATASET_IDS_BY_PID[req.body.project_id];
  }
  console.log('local_data_to_open');
  console.log(local_data_to_open);
  return local_data_to_open;
}

function render_visuals_index(res, req, needed_constants = C) {
  res.render('visuals/visuals_index', {
    title       : 'VAMPS: Select Datasets',
    subtitle    : 'Dataset Selection Page',
    proj_info   : JSON.stringify(C.PROJECT_INFORMATION_BY_PID),
    constants   : JSON.stringify(needed_constants),
    md_env_package : JSON.stringify(C.MD_ENV_PACKAGE),
    md_names    : C.AllMetadataNames,
    filtering   : 0,
    portal_to_show : '',
    data_to_open: JSON.stringify(req.session.DATA_TO_OPEN),
    user        : req.user,
    hostname    : CFG.hostname,
  });
}

// test: first page
router.get('/visuals_index', helpers.isLoggedIn, (req, res) => {
  console.log('in GET visuals_index');
  // This page is arrived at using GET from the Main Menu
  // It will be protected using the helpers.isLoggedIn function
  // TESTING:
  //      Should show the closed project list on initialize
  //      The javascript functions (load_project_select, set_check_project, open_datasets, toggle_selected_datasets)
  //        should work to open the project (show and check the datasets) when either the plus image is clicked or the
  //        checkbox is selected. Clicking the minus image should deselect the datasets and close the dataset list.
  //        While the project is open clicking on the project checkbox should toggle all the datasets under it.
  //      Clicking the submit button when no datasets have been selected should result in an alert box and a
  //      return to the page.
  //console.log(PROJECT_INFORMATION_BY_PID);
  console.log(req.user.username+' in GET req.body visuals_index');
  //console.log(req.body)

  //console.log(ALL_DATASETS);
  // GLOBAL
  req.session.SHOW_DATA = C.ALL_DATASETS;
  //req.session.TAXCOUNTS = {}; // empty out this global variable: fill it in unit_selection
  //METADATA  = {};
  // GLOBAL
  req.session.DATA_TO_OPEN = get_data_to_open(req);

  let needed_constants = helpers.retrieve_needed_constants(C,'visuals_index');
  render_visuals_index(res, req, needed_constants);
});

// test: show page
router.post('/visuals_index', helpers.isLoggedIn, (req, res) => {
  console.log('in POST visuals_index '+ req.user.username);
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
  //console.log(PROJECT_INFORMATION_BY_PID);
  //console.log(req.body)

  //console.log(ALL_DATASETS);
  // GLOBAL
  req.session.SHOW_DATA = C.ALL_DATASETS;
  //req.session.TAXCOUNTS = {}; // empty out this global variable: fill it in unit_selection
  //METADATA  = {};
  // GLOBAL
  req.session.DATA_TO_OPEN = get_data_to_open(req);

  render_visuals_index(res, req, C);
});

//
//
// test: reorder_datasets
router.post('/reorder_datasets', helpers.isLoggedIn, (req, res) => {
  console.log('in reorder_datasets')
  let selected_dataset_order = {};
  selected_dataset_order.names = req.session.project_dataset_vars.project_dataset_names;
  selected_dataset_order.ids = req.session.chosen_id_order;
  helpers.print_log_if_not_vamps(req.session)
  const user_timestamp = viz_files_obj.get_user_timestamp(req);
  res.render('visuals/reorder_datasets', {
    title: 'VAMPS: Reorder Datasets',
    selected_datasets: JSON.stringify(selected_dataset_order),
    constants: JSON.stringify(C),
    referer: req.body.referer,
    ts: user_timestamp,
    user: req.user, hostname: CFG.hostname,
  });

});
//
//
// test: view_saved_datasets from selection
router.post('/view_saved_datasets', helpers.isLoggedIn, (req, res) => {
  // this fxn is required for viewing list of saved datasets
  // when 'toggle open button is activated'
  // let fxn = req.body.fxn;
  // console.log('XX'+JSON.stringify(req.body));
  let file_path = file_path_obj.get_user_file_path(req);
  console.log("file_path from view_saved_datasets");
  console.log(file_path);

  read_file_when_ready(file_path);
  fs.readFile(file_path, 'utf8', function readFile(err,data) {
    if (err) {
      let msg = 'ERROR Message ' + err;
      helpers.render_error_page(req,res,msg);
    } else {
      console.log(data);
      res.send(data);
    }
  });
});

//
//
// test: dendrogram
router.post('/dendrogram',  helpers.isLoggedIn, (req,  res) => {
  console.log('found routes_dendrogram-x');
///// this vesion of dendrogram is or running d3 on CLIENT: Currently:WORKING
///// It passes the newick string back to view_selection.js
///// and tries to construct the svg there before showing it.
  console.log('req.body dnd');
  helpers.print_log_if_not_vamps(req.body);
  console.log('req.body dnd');
  let metric = req.body.metric;
  // let script = req.body.script; // python,  phylogram or phylonator
  const script = '/distance_and_ordination.py';
  let image_type = req.body.image_type; // png(python script) or svg
  //console.log('image_type '+image_type);
  // see: http://bl.ocks.org/timelyportfolio/59acc3853b02e47e0dfc

  let biom_file_path = viz_files_obj.get_file_tmp_path_by_ending(req, 'count_matrix.biom');
  let tmp_file_path = file_path_obj.get_tmp_file_path(req);

  let user_timestamp = viz_files_obj.get_user_timestamp(req);
  let options = {
    scriptPath: CFG.PATH_TO_VIZ_SCRIPTS,
    args: [ '-in',  biom_file_path,  '-metric', metric, '--function', 'dendrogram-' + image_type, '--basedir', tmp_file_path, '--prefix', user_timestamp ],
  };
  console.log(options.scriptPath + script + ' ' + options.args.join(' '));

  let dendrogram_process = spawn( options.scriptPath + script,
    options.args, {
      env: {'PATH': CFG.PATH,
        'LD_LIBRARY_PATH': CFG.LD_LIBRARY_PATH},
      detached: true,
      stdio: 'pipe' // stdin,  stdout,  stderr
    });

  let stdout = '';
  dendrogram_process.stdout.on('data',  function dendrogramProcessStdout(data) {
    stdout += data.toString();
  });

  dendrogram_process.on('close',  function dendrogramProcessOnClose(code) {
    console.log('dendrogram_process process exited with code ' + code);
    let lines = [];
    if (code === 0){ // SUCCESS
      if (image_type === 'd3'){
        // helpers.print_log_if_not_vamps('stdout: ' + stdout);

        lines = stdout.split('\n');
        const startsWith_newick = lines.find((line) => line.startsWith("NEWICK"));
        let newick = "";
        try {
          newick = startsWith_newick.split('=')[1];
          // helpers.print_log_if_not_vamps('NWK->' + newick);
        }
        catch(err) {
          newick = {"ERROR": err};
        }
        res.send(newick);
        // return;
      }
    }
    else{
      console.log('stdout: ' + stdout);
    }
  });
});

//
// P C O A
//

//test: "PCoA 2D Analyses (R/pdf)"
router.post('/pcoa', helpers.isLoggedIn, (req, res) => {

  console.log('in PCoA');
  // Nov 13 12:06:36 bpcweb7 ts from pcoa 2d:  ashipunova_1573664792697

  const user_timestamp = viz_files_obj.get_user_timestamp(req);
  let image_file = viz_files_obj.get_file_names(req)['pcoa.pdf'];
  let options = get_plot_specific_options("pcoa2", req, user_timestamp, image_file);
  console.log(options.scriptPath + options.script + ' ' + options.args.join(' '));

  let pcoa_process = spawn( options.scriptPath + options.script, options.args, {
    env: { 'PATH': CFG.PATH, 'LD_LIBRARY_PATH': CFG.LD_LIBRARY_PATH },
    detached: true,
    stdio: [ 'ignore', null, null ]
  });

  let html = "";
  pcoa_process.on('close', function pcoaProcessOnClose(code) {

    if (code === 0) {   // SUCCESS

      html = "<div id='pdf'>";
      html += "<embed src='/static_base/tmp/" + image_file + "' type='application/pdf' width='1000' height='600' />";
      html += "</div>";
      console.log(html);
      let data = {};
      data.html = html;
      data.filename = image_file;   // returns data and local file_name to be written to
      res.json(data);
    }
    else {
      console.log('ERROR');
      const data = {};
      data.html = "<dev class = 'base_color_red'>PCoA Script Failure -- Try a deeper rank, or more metadata or datasets</dev>";
      console.log(data.html);
      res.json(data);
    }
  });
});
//
//
//  EMPEROR....
// POST is for PC file link
// test: "PCoA 3D Analyses (Emperor)"
router.post('/pcoa3d', helpers.isLoggedIn, (req, res) => {
  console.log('POST in pcoa3d');

  let metric = req.session.selected_distance;
  const biom_file_path = viz_files_obj.get_file_tmp_path_by_ending(req, 'count_matrix.biom');
  const mapping_file_path = viz_files_obj.get_file_tmp_path_by_ending(req, 'metadata.txt');

  let options1 = {
    scriptPath : file_path_obj.get_viz_scripts_path(req),
    script: "distance_and_ordination.py",
    args: ['-in', biom_file_path,
      '-metric', metric,
      '--function', 'pcoa_3d',
      '--basedir', file_path_obj.get_tmp_file_path(req),
      '--prefix', viz_files_obj.get_user_timestamp(req),
      '-m', mapping_file_path
    ],
  };

  const script_full_path = path.join(options1.scriptPath, options1.script);
  let pcoa_process = spawn( script_full_path, options1.args, {
    env:{ 'PATH': CFG.PATH, 'LD_LIBRARY_PATH': CFG.LD_LIBRARY_PATH },
    detached: true,
    stdio:['pipe', 'pipe', 'pipe']
  });
  // pcoa_process.stdout.on('data', function pcoaProcessStdout(data) {
  //   //console.log('1stdout: ' + data);
  // });
  let stderr1 = '';
  pcoa_process.stderr.on('data', function pcoaProcessStderr(data) {
    console.log('1stderr-POST: ' + data);
    stderr1 += data;
  });
  pcoa_process.on('close', function pcoaProcessOnClose(code) {
    console.log('pcoa_process1 process exited with code ' + code);
    if (code === 0){ // SUCCESS

      const pc_file_name = viz_files_obj.get_file_names(req)['pc.txt'];
      const biom_file_name = viz_files_obj.get_file_names(req)['count_matrix.biom'];
      const mapping_file_name = viz_files_obj.get_file_names(req)['metadata.txt'];
      const dist_file_name = viz_files_obj.get_file_names(req)['distance.csv'];
      const dir_name = viz_files_obj.get_file_names(req)['pcoa3d'];
      const index_file_name = dir_name + '/index.html';
      let html = "** <a href='/static_base/tmp/" + index_file_name + "' target='_blank'>Open Emperor</a> **";
      html += "<br>Principal Components File: <a href='/static_base/tmp/" + pc_file_name + "' target='_blank'>" + pc_file_name + "</a>";
      html += "<br>Biom File: <a href='/static_base/tmp/" + biom_file_name + "' target='_blank'>" + biom_file_name + "</a>";
      html += "<br>Mapping (metadata) File: <a href='/static_base/tmp/" + mapping_file_name + "' target='_blank'>" + mapping_file_name + "</a>";
      html += "<br>Distance File: <a href='/static_base/tmp/" + dist_file_name + "' target='_blank'>" + dist_file_name + "</a>";

      let data = {};
      data.html = html;
      data.filename = index_file_name ;  // returns data and local file_name to be written to
      res.json(data);
    }
    else{
      console.log('ERROR in PCOA 3D: ', stderr1);
      const data = {};
      data.html = "<dev class = 'base_color_red'>Python Script ERROR in PCOA 3D </dev>";
      res.json(data);
    }
  });
  /////////////////////////////////////////////////
});

//
// DATA BROWSER
//
// test: "data browser Krona" viz.
function format_sumator(allData) {
  let array = [""];
  printList(allData);
  array.push("");
  // console.log(array);

  function printList(items) {
    if (helpers.is_object(items)) {
      getChildren(items);
    }
    else if (helpers.is_array(items)) {
      printArray(items);
    }
    else {
      array.push("<val>" + items + "</val>");
    }
  }

  function getChildren(parent) {
    const fields_w_val = ["rank", "seqcount", "val"];
    // const fields2skip = ["depth", "name", "parent", "children"];
    const fields2skip = ["name"];

    // for (let child in parent) {
    for (const child of Object.keys(parent)) {
      if (fields_w_val.includes(child)) {
        array.push(`<${child}>`);
        printList(parent[child]);
        array.push(`</${child}>`);
      }
      else if (!fields2skip.includes(child)) {
        array.push(`<node name='${child}'>`);
        printList(parent[child]);
        array.push("</node>");
      }
    }
  }

  function printArray(myArray){
    for (let i = 0; i < myArray.length; i++){
      //console.log(myArray[i]);
      array.push("<val>" + myArray[i] + "</val>");
    }
  }
  return array.join("");
}

router.get('/dbrowser', helpers.isLoggedIn, (req, res) => {
  console.log('in dbrowser');
  let matrix_file_path = viz_files_obj.get_file_tmp_path_by_ending(req, 'count_matrix.biom');
  read_file_when_ready(matrix_file_path);
  let biom_matrix = JSON.parse(fs.readFileSync(matrix_file_path, 'utf8'));
  let max_total_count = Math.max.apply(null, biom_matrix.column_totals);

  // sum counts
  // console.time("TIME: get_sumator new");
  const taxonomy_class = new biom_matrix_controller.Taxonomy({"chosen_dids": req.session.chosen_id_order, "visual_post_items": {}, "taxa_counts_module": {}});

  let sumator_new = taxonomy_class.get_sumator(biom_matrix);

  // console.timeEnd("TIME: get_sumator new");

  // console.time("TIME: format_sumator sumator new");

  let result_xml = format_sumator(sumator_new);
  // console.timeEnd("TIME: format_sumator sumator new");

  // console.log("result_xml: ");
  // console.log(result_xml);
  console.log("render visuals/dbrowser");

  res.render('visuals/dbrowser', {
    title: 'VAMPS:Taxonomy Browser (Krona)',
    user:                req.user,
    html:                result_xml,
    max_total_count:     max_total_count,
    matrix:              JSON.stringify(biom_matrix)
  });
});


function get_fill(req) {
  let fill = req.session.tax_depth.charAt(0).toUpperCase() + req.session.tax_depth.slice(1);
  if (fill === 'Klass') {
    fill = 'Class';
  }
  return fill;
}

// TODO: JSHint: This function's cyclomatic complexity is too high. (12) (W074)
function get_plot_specific_options(plot_type, req, user_timestamp, svgfile_name) {
  let phy, md1, md2, ordtype, maxdist;
  const dist_metric = req.body.metric;
  const fill = get_fill(req);
  md1 = req.body.md1 || "Project";
  md2 = req.body.md2 || "Description";
  const tmp_file_path = file_path_obj.get_tmp_file_path(req);

  let options = {
    scriptPath: file_path_obj.get_viz_scripts_path(req),
    args:       [ tmp_file_path, user_timestamp, svgfile_name, ],
  };

  switch(plot_type) {
    case 'bar':
      options.script = 'phyloseq_bar.R';
      phy = req.body.phy;
      options.args = options.args.concat([phy, fill]);
      break;
    case 'heatmap':
      options.script = 'phyloseq_heatmap.R';
      phy = req.body.phy;
      md1 = req.body.md1;
      ordtype = req.body.ordtype;
      options.args = options.args.concat([dist_metric, phy, md1, ordtype, fill]);
      break;
    case 'network':
      options.script = 'phyloseq_network.R';
      maxdist = req.body.maxdist || "0.3";
      options.args = options.args.concat([dist_metric, md1, md2, maxdist]);
      break;
    case 'ord':
      options.script = 'phyloseq_ord.R';
      ordtype = req.body.ordtype || "PCoA";
      options.args = options.args.concat([dist_metric, md1, md2, ordtype]);
      break;
    case 'tree':
      options.script = 'phyloseq_tree.R';
      md1 = req.body.md1 || "Description";
      options.args = options.args.concat([dist_metric, md1]);
      break;
    case 'pcoa2':
      options.script = 'pcoa2.R';
      //   args :       [ tmp_path, user_timestamp, metric, md1, md2, image_file],
      // different order for this script!
      options.args = [tmp_file_path, user_timestamp, dist_metric, md1, md2, svgfile_name];
      // options.args.concat([dist_metric, md1, md2]);
      break;
  }
  // if (plot_type === 'heatmap'){   // for some unknown reason heatmaps are different: use pdf not svg

  return options;

}

function show_data(res, contents, svgfile_name) {
  let data = {};
  data.html = contents;
  data.filename = svgfile_name; // returns data and local file_name to be written to
  res.json(data);
}

//
//
// test: choose phylum, "Phyloseq Bars (R/svg)"
router.post('/phyloseq', helpers.isLoggedIn, (req, res) => {
  console.log('in phyloseq post');

  const user_timestamp = viz_files_obj.get_user_timestamp(req);
  const svgfile_name = viz_files_obj.phyloseq_svgfile_name(req, user_timestamp);
  const tmp_file_path = file_path_obj.get_tmp_file_path(req);
  const svgfile_path = path.join(tmp_file_path, svgfile_name);

  let plot_type = req.body.plot_type;
  // console.time("TIME: plot_type = " + plot_type);

  let options = get_plot_specific_options(plot_type, req, user_timestamp, svgfile_name);

  console.log(path.join(options.scriptPath, options.script) + ' ' + options.args.join(' '));
  let phyloseq_process = spawn( path.join(options.scriptPath, options.script), options.args, {
    env: {'PATH': CFG.PATH},
    detached: true,
    //stdio: [ 'ignore', null, null ]
    stdio: 'pipe'  // stdin, stdout, stderr
  });
  let stdout = '';
  let lastline = '';
  phyloseq_process.stdout.on('data', function phyloseqProcessStdout(data) {
    lastline = data;
    stdout += data;
  });

  let stderr = '';
  phyloseq_process.stderr.on('data', function phyloseqProcessStderr(data) {
    stderr += data;
  });

  phyloseq_process.on('close', function phyloseqProcessOnClose(code) {
    console.log('phyloseq_process process exited with code ' + code);

    if (code === 0){   // SUCCESS

      read_file_when_ready(svgfile_path);
      fs.readFile(svgfile_path, 'utf8', (err, contents) => {

        if(err){ res.send('ERROR reading file')}
        show_data(res, contents, svgfile_name);
      });
    }
    else {
      console.log('ERROR-2');
      const data = {};
      data.html = "<dev class = 'base_color_red'>Phyloseq Error: Try selecting more data, deeper taxonomy or excluding 'NA's</dev>";
      console.log(data.html);
      res.json(data);
    }
  });
  // console.timeEnd("TIME: plot_type = " + plot_type);

});

//
//  G E O S P A T I A L (see view_selection.js)
//

//
// BAR-CHART -- SINGLE
//
// test: BAR-CHART -- SINGLE - (click on a bar)

function make_pi(selected_did_arr, req, pd_vars, metric = undefined) {
  let pi = {};
  pi.chosen_datasets = pd_vars.get_dataset_obj_by_did(selected_did_arr);
  pi.no_of_datasets = pi.chosen_datasets.length;
  pi.ts = viz_files_obj.get_user_timestamp(req);
  pi.unit_choice = req.session.unit_choice;
  pi.min_range = req.session.min_range;
  pi.max_range = req.session.max_range;
  pi.normalization = req.session.normalization;
  pi.tax_depth = req.session.tax_depth;
  pi.include_nas = req.session.include_nas;
  pi.domains = req.session.domains;
  if (metric) {
    pi.selected_distance = metric;
  }
  // Added here 20191127 AAV so that bar_single and bar_double would reflect min/max changes
  pi.update_data = 1;
  return pi;
}

function make_new_matrix(req, pi, selected_did, order, pd_vars) {
  let overwrite_the_matrix_file = false;  // DO NOT OVERWRITE The Matrix File
  // console.time("TIME: biom_matrix_new_from_bar_single");
  const biom_matrix_obj = new biom_matrix_controller.BiomMatrix(req, pi, overwrite_the_matrix_file);
  let new_matrix = biom_matrix_obj.biom_matrix;
  // console.timeEnd("TIME: biom_matrix_new_from_bar_single");
  //new_matrix.dataset = pd_vars.get_current_dataset_name_by_did(selected_did);
  new_matrix.pjds = pd_vars.get_current_pr_dataset_name_by_did(selected_did);
  new_matrix.did = selected_did;
  new_matrix.total = 0;
  new_matrix = helpers.sort_json_matrix(new_matrix, order);
  return new_matrix;
}

function mysqlSelectedSeqsPerDID_to_file(err, req, res, rows, selected_did){
  // console.time("TIME: mysqlSelectedSeqsPerDID_to_file");

  if (err)  {
    // TODO: test
    //      let html = "<dev class = 'base_color_red'>Python Script ERROR in PCOA 3D </dev>";
    //       res.json(data);
    console.log('Query error: ' + err);
    console.log(err.stack);
    res.send(err);
  }
  else {
    let new_rows = {};
    new_rows[selected_did] = [];
    new_rows = rows.reduce((ob, item) => {
      let did = item.dataset_id;
      // ob[did] is the same as new_rows[selected_did]
      ob[did].push({
        seq: item.seq.toString(),
        seq_count: item.seq_count,
        gast_distance: item.gast_distance,
        classifier: item.classifier,
        domain_id: item.domain_id,
        phylum_id: item.phylum_id,
        klass_id: item.klass_id,
        order_id: item.order_id,
        family_id: item.family_id,
        genus_id: item.genus_id,
        species_id: item.species_id,
        strain_id: item.strain_id
      });
      return ob;
    }, new_rows);

    // order by seq_count DESC
    new_rows[selected_did].sort(function sortByCount(a, b) {
      return b.seq_count - a.seq_count;
    });

    let file_path = viz_files_obj.get_sequences_json_file_path(req, selected_did);

    fs.writeFileSync(file_path, JSON.stringify(new_rows[selected_did]));
  }
  // console.timeEnd("TIME: mysqlSelectedSeqsPerDID_to_file");
}

// On the bar_single page with the single taxonomy bar and list of included taxonomies
// when you click on the button: Ordering: Taxa Names it should toggle both the list and and bar to order
// the taxonomic names a-z then to z-a and so forth.
//
// The button: Ordering: Counts is also a toggle but the ordering is by taxonomic counts and not alphabetical.

function get_new_order_by_button(order) {
  let new_order = {};
  switch (order.orderby) {
    case "alpha":
      new_order.count_value = '';
      if (order.value === 'a') {
        new_order.alpha_value = 'z';
      }
      else {
        new_order.alpha_value = 'a';
      }
      
      break;
    case "count":
      if (order.value === 'min') {
        new_order.count_value = 'max';
      } else {
        new_order.count_value = 'min';
      }
      new_order.alpha_value = '';
      break;
    default:
      break;
  }
  //works
  // { count_value: 'max', alpha_value: '' }
  // { count_value: 'min', alpha_value: '' }
  // { count_value: '',    alpha_value: 'a' }
  // { count_value: '',    alpha_value: 'z' }
  // returns to
  // router.get('/bar_single'  and
  // router.get('/bar_double'
  return new_order;
}

function write_seq_file_async(req, res, selected_did) {
  DBConn.query(QUERY.get_sequences_perDID([selected_did], req.session.unit_choice),
     (err, rows) => {
      mysqlSelectedSeqsPerDID_to_file(err, req, res, rows, selected_did);
    });
}

function LoadDataFinishRequestFunc({req, res, pi, timestamp_only, new_matrix, new_order, bar_type, dist = ""}) {
  console.log('LoadDataFinishRequest in bar_' + bar_type);
  let title = 'Taxonomic Data';
  if (pi.unit_choice === 'OTUs') {
    title = 'OTU Count Data';
  }
  let url = 'visuals/user_viz_data/bar_' + bar_type;
  res.render(url, {
    title: title,
    ts: timestamp_only,
    matrix: JSON.stringify(new_matrix),
    post_items: JSON.stringify(pi),
    bar_type: bar_type,
    order: JSON.stringify(new_order),
    dist: dist,
    user: req.user, hostname: CFG.hostname,
  });
}
//
// B A R - C H A R T  -- S I N G L E
//
router.get('/bar_single', helpers.isLoggedIn, (req, res) => {
  console.log('in routes_viz/bar_single');
  let myurl = url.parse(req.url, true);
  console.log('in piechart_single',myurl.query)
  if (req.session.otus) {
    console.log('found otus')
  }else{
    console.log('not otus')
  }
  let selected_did = myurl.query.did;
  let orderby = myurl.query.orderby || 'alpha'; // alpha, count
  let value = myurl.query.val || 'z'; // a,z, min, max
  let order = {orderby: orderby, value: value}; // orderby: alpha: a,z or count: min,max
  let pd_vars = new visualization_controller.visualizationCommonVariables(req);
  //console.log(pd_vars)
  let pi = make_pi([selected_did], req, pd_vars);
  let new_matrix = make_new_matrix(req, pi, selected_did, order, pd_vars);
  let new_order = get_new_order_by_button(order);
  if (pi.unit_choice !== 'OTUs') {
    write_seq_file_async(req, res, selected_did);
    const bar_type = 'single';
    const timestamp_only = viz_files_obj.get_timestamp_only(req);
    LoadDataFinishRequestFunc({req, res, pi, timestamp_only, new_matrix, new_order, bar_type});
  }
});
//
// B A R - C H A R T  -- D O U B L E
//
// test: click on cell of distance heatmap
router.get('/bar_double', helpers.isLoggedIn, (req, res) => {
  console.log('in routes_viz/bar_double');

  let myurl = url.parse(req.url, true);
  // console.log(myurl.query);
  const did1 = myurl.query.did1;
  const did2 = myurl.query.did2;
  const dist = myurl.query.dist;
  const metric = myurl.query.metric;
  const orderby = myurl.query.orderby || 'alpha'; // alpha, count
  const value = myurl.query.val || 'z'; // a,z, min, max
  const order = {orderby: orderby, value: value}; // orderby: alpha: a,z or count: min,max
  const pd_vars = new visualization_controller.visualizationCommonVariables(req);
  let pi = make_pi([did1, did2], req, pd_vars, metric);

  let overwrite_matrix_file = false;  // DO NOT OVERWRITE The Matrix File
  // console.time("TIME: biom_matrix_new_from_bar_double");
  const biom_matrix_obj = new biom_matrix_controller.BiomMatrix(req, pi, overwrite_matrix_file);
  let new_matrix = biom_matrix_obj.biom_matrix;
  // console.timeEnd("TIME: biom_matrix_new_from_bar_double");

  //DOUBLE
  //console.log(JSON.stringify(new_matrix))
  new_matrix = helpers.sort_json_matrix(new_matrix, order);

  let new_order = get_new_order_by_button(order);

  write_seq_file_async(req, res, did1);
  write_seq_file_async(req, res, did2);
  let bar_type = "double";
  const timestamp_only = viz_files_obj.get_timestamp_only(req);
  LoadDataFinishRequestFunc({req, res, pi, timestamp_only, new_matrix, new_order, bar_type, dist});
});

//
//  S E Q U E N C E S
//

function err_read_file(err, req, res, seqs_filename) {
  console.log(err);
  if (req.session.otus){
    res.send('<br><h3>No sequences are associated with this OTU project.</h3>');
  }
  else {
    res.send('<br><h3>No file found: ' + seqs_filename + "; Use the browsers 'Back' button and try again</h3>");
  }
}

function get_clean_data_or_die(req, res, data, pjds, selected_did, search_tax, seqs_filename) {
  let clean_data = "";
  try {
    clean_data = JSON.parse(data);
  } catch (e) {
    console.log(e);
    // TODO: Andy, how to test this?
    res.render('visuals/user_viz_data/sequences', {
      title: 'Sequences',
      ds: pjds,
      did: selected_did,
      tax: search_tax,
      fname: seqs_filename,
      seq_list: 'Error Retrieving Sequences',
      user: req.user, hostname: CFG.hostname,
    });
    return;
  }
  return clean_data;
}

function render_seq(req, res, pjds, search_tax, seqs_filename = '', seq_list = '')
{
  res.render('visuals/user_viz_data/sequences', {
    title: 'Sequences',
    ds: pjds,
    tax: search_tax,
    fname: seqs_filename,
    seq_list: seq_list,
    user: req.user,
    hostname: CFG.hostname,
  });
}

function filter_data_by_last_taxon(search_tax, clean_data) {
  //console.log('search_tax')
  //console.log(search_tax)
  const search_tax_arr = search_tax.split(";").filter( (value) => {
    if (!value.includes('_NA')) {
        return value;
    }
  });
  //console.log('search_tax_arr')
  //console.log(search_tax_arr)
  const last_element_number = search_tax_arr.length - 1; // need to trim _NAs
  const last_taxon = search_tax_arr[last_element_number];
  const curr_rank = C.RANKS[last_element_number];
  const rank_name_id = curr_rank + "_id";
  const db_id = C.new_taxonomy.taxa_tree_dict_map_by_rank[curr_rank].filter(i => i.taxon === last_taxon).map(e => e.db_id);
  
  let filtered_data = clean_data;
  //console.log('FILTERdb_id')
 //console.log(curr_rank)
 //console.log(db_id)
 //for(x in clean_data){
    //let tax_id = clean_data[x][rank_name_id]
    //console.log('ID '+tax_id+'_'+curr_rank)
    //console.log(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[tax_id+'_'+curr_rank])   //["3_domain"]
 //}
  try {
    filtered_data = clean_data.filter(i => (parseInt(i[rank_name_id]) === parseInt(db_id)));
  }
  catch (e) {
    console.log("No clean_data in filter_data_by_last_taxon");
  }
  //if(filtered_data == clean_data){
  //   console.log('filtered data unchanged')
  //}
  return filtered_data;
}

function get_long_tax_name(curr_ob) {
  return Object.keys(curr_ob).reduce((long_name_arr, key) => {
    if (key.endsWith("_id")) {
      let db_id = curr_ob[key];
      let curr_rank_name = key.substring(0, key.length - 3);
      let curr_name = "";
      try {
        curr_name = C.new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank[db_id + "_" + curr_rank_name].taxon;
      }
      catch(e) {
        curr_name = curr_rank_name + "_NA";
      }
      long_name_arr.push(curr_name);
    }
    return long_name_arr;
  }, []);
}

function make_seq_list_by_filtered_data_loop(filtered_data) {
  let seq_list = filtered_data.reduce((comb_list, curr_ob) => {
    // console.time("TIME: prettyseq");
    let prettyseq = helpers.make_color_seq(curr_ob.seq);
    // console.timeEnd("TIME: prettyseq");
    let seq_tax_arr = get_long_tax_name(curr_ob);
    let seq_tax = seq_tax_arr.join(";");
    comb_list.push({
      prettyseq: prettyseq,
      seq: curr_ob.seq,
      seq_count: curr_ob.seq_count,
      gast_distance: curr_ob.gast_distance,
      classifier: curr_ob.classifier,
      tax: seq_tax
    });

    return comb_list;
  }, []);

  return seq_list;
}

async function read_file_when_ready(filename_path) {
  return await viz_files_obj.checkExistsWithTimeout(filename_path, 1000);
}

// test: visuals/bar_single?did=474463&ts=anna10_1568652597457&order=alphaDown
// click on a barchart row
router.get('/sequences/', helpers.isLoggedIn, (req, res) => {
  console.log('in sequences');
  const myurl = url.parse(req.url, true);
  // console.log(myurl.query);
  const search_tax = myurl.query.taxa;
  const seqs_filename = myurl.query.filename;
  const tmp_file_path = file_path_obj.get_tmp_file_path(req);
  const seqs_filename_path = path.join(tmp_file_path, seqs_filename);

  //
  // http://localhost:3000/visuals/bar_single?did=474467&ts=anna10_1573500571628&order=alphaDown// anna10_474467_1573500576052_sequences.json
  let selected_did = myurl.query.did;
  let pjds = req.session.project_dataset_vars.current_project_dataset_obj_by_did[selected_did];
  if (seqs_filename){
    //console.log('found filename', seqs_filename)

    fs.access(seqs_filename_path, error => {
      if (error) {
        console.log("Not ready yet: ", seqs_filename_path);
      }
      else {
        fs.readFile(seqs_filename_path, 'utf8', function readFile(err, data) {
          // console.time("TIME: readFile");
          if (err) {
            err_read_file(err, req, res, seqs_filename);
          }
          //console.log('parsing data')

          let clean_data = get_clean_data_or_die(req, res, data, pjds, selected_did, search_tax, seqs_filename);

          // console.time("TIME: loop through clean_data");
          let filtered_data = filter_data_by_last_taxon(search_tax, clean_data);

          let seq_list = make_seq_list_by_filtered_data_loop(filtered_data);
          // console.timeEnd("TIME: loop through clean_data");

          render_seq(req, res, pjds, search_tax, seqs_filename, JSON.stringify(seq_list));
          // console.timeEnd("TIME: readFile");
        }.bind());
      }
    });
  }
  else {
    // TODO: Andy, how to test this?
    // render_seq(req, res, pjds, search_tax, '', 'Error Retrieving Sequences');
    res.render('visuals/user_viz_data/sequences', {
      title: 'Sequences',
      ds: pjds,
      tax: search_tax,
      fname: '',
      seq_list: 'Error Retrieving Sequences',
      user: req.user, hostname: CFG.hostname,
    });
  }
});

/*
*   PARTIALS
*      These six partials all belong to the unit_selection page
*      and are shown via ajax depending on user selection in combo box
*       on that page.  AAV
*/
//test: simple_taxonomy
router.get('/partials/tax_' + C.default_taxonomy.name + '_simple', helpers.isLoggedIn,  (req, res) => {
  console.log("in '/partials/tax_' + C.default_taxonomy.name + '_simple'");
  res.render('visuals/partials/tax_' + C.default_taxonomy.name + '_simple', {
    doms : C.UNITSELECT.silva119_simple.domains
  });
});

//
//
//

// benchmarking
// let start = process.hrtime();
//

// test: it is only called from public/javascrips/metadata.js line 30
router.get('/partials/load_metadata', helpers.isLoggedIn,  (req, res) => {
  let myurl = url.parse(req.url, true);
  let load = myurl.query.load  || 'all';   // either 'all' or 'selected'
  res.render('visuals/partials/load_metadata',
    { title   : 'metadata_table',
      load    : load
    });
});
//
//
//
router.get('/partials/tax_'+C.default_taxonomy.name+'_custom', helpers.isLoggedIn,  (req, res) => {
  res.render('visuals/partials/tax_'+C.default_taxonomy.name+'_custom',  { title   : C.default_taxonomy.show+' Custom Taxonomy Selection'});
});

// test: on unit_select page drop down -select RDP
router.get('/partials/tax_rdp2.6_simple', helpers.isLoggedIn,  (req, res) => {
  res.render("visuals/partials/tax_rdp26_simple", {
    doms : C.UNITSELECT.rdp2_6_simple.domains,
  });
});

// test: on unit_select page drop down - select Generic
router.get('/partials/tax_generic_simple', helpers.isLoggedIn,  (req, res) => {
  res.render("visuals/partials/tax_generic_simple", {
    doms: C.DOMAINS
  });
});

//test: save_datasets
router.post('/save_datasets', helpers.isLoggedIn,  (req, res) => {

  console.log('req.body: save_datasets-->>');
  helpers.print_log_if_not_vamps(req.body);
  console.log('req.body: save_datasets');

  let filename_path = path.join(CFG.USER_FILES_BASE,req.user.username,req.body.filename);
  helpers.mkdirSync(path.join(CFG.USER_FILES_BASE));  // create dir if not present
  helpers.mkdirSync(path.join(CFG.USER_FILES_BASE,req.user.username)); // create dir if not present
  //console.log(filename);
  helpers.write_to_file(filename_path,req.body.datasets);

  res.send('OK');


});
//
//
// test: click go to saved datasets
router.get('/saved_elements', helpers.isLoggedIn,  (req, res) => {
  console.log('in show_saved_datasets');
  if (req.user.username === 'guest'){
    req.flash('fail', "The 'guest' user cannot save datasets");
    res.redirect('/user_data/your_data');
  } else {
    //console.log('req.body: show_saved_datasets-->>');
    //console.log(req.body);
    //console.log('req.body: show_saved_datasets');
    gather_saved_elements_data(req, res)
    return
    
  }

});

// html += add_html(dataset_arr, did, name);

function reorder_did_html(did, name, idx) {
  let html = "";
  html += "<tr class='tooltip_row'>";
  html += "<td class='dragHandle' id = '" + did + "--" + name + "'> ";
  html += "<input type = 'hidden' name = 'ds_order[]' value='" + did + "'>";
  html += (parseInt(idx)+1).toString() + " (id:" + did + ") - " + name;
  html += "</td>";
  html += "   <td>";
  html += "       <a href='#' onclick='move_to_the_top(" + (parseInt(idx) + 1).toString() + ",\"" + did + "--" + name + "\")'>^</a>";
  html += "   </td>";
  html += "</tr>";

  return html;
}

function reverse_or_reset_datasets(req, ids) {
  const pd_vars = new visualization_controller.visualizationCommonVariables(req, ids);

  let html = '';

  html += "<table id='drag_table' class='table table-condensed' >";
  html += "<thead></thead>";
  html += "  <tbody>";
  html += ids.reduce((html_txt, did, idx) => {
    const pr_dat_name = pd_vars.current_project_dataset_obj_by_did[did];
    // TODO: html_txt vs. html???
    return html_txt += reorder_did_html(did, pr_dat_name, idx);
  }, "");
  html += "</tbody>";
  html += "</table>";
  return html;
}

//
//  R E S E T
// test: from reorder_datasets click "reset order"
router.post('/reset_ds_order', helpers.isLoggedIn,  (req, res) => {
  console.log('in reset_ds_order');

  let html = '';
  html += reverse_or_reset_datasets(req, req.session.chosen_id_order);

  res.send(html);
});

function compare_by_key_name_asc(key_name) {
  return function compare( a, b ) {
    if ( a[key_name] < b[key_name] ){
      return -1;
    }
    if ( a[key_name] > b[key_name] ){
      return 1;
    }
    return 0;
  };
}


//
// A L P H A - B E T I Z E
// test: from re-order datasets, "Alphabetize"
router.post('/alphabetize_ds_order', helpers.isLoggedIn, (req, res) => {
  console.log('in alphabetize_ds_order');

  let name_ids = req.session.chosen_id_order.reduce((arr_of_obj, did) => {
    let temp_obj = {
      did: did,
      d_name: req.session.project_dataset_vars.current_project_dataset_obj_by_did[did]
    };
    arr_of_obj.push(temp_obj);
    return arr_of_obj;
  }, []);

  name_ids.sort(compare_by_key_name_asc("d_name"));
  let dids_sorted_by_dname = name_ids.reduce((did_arr, ob) => {
    did_arr.push(ob["did"]);
    return did_arr;
  }, []);

  let html = '';
  html += reverse_or_reset_datasets(req, dids_sorted_by_dname);

  res.send(html);
});


//
// R E V E R S E  O R D E R
//
// test: from re-order datasets, "Reverse"
router.post('/reverse_ds_order', helpers.isLoggedIn, (req, res) => {
  console.log('in reverse_ds_order');
  let ids = JSON.parse(req.body.ids);
  ids.reverse();

  let html = '';
  html += reverse_or_reset_datasets(req, ids);
  res.send(html);
});

function get_ds_list(output) {
  let lines = output.split(/\n/);
  let ds_list = "";
  let ds_list_line = lines.find(l => l.startsWith('DS_LIST'));
  try {
    ds_list = ds_list_line.split('=')[1];
  }
  catch (err) {
    console.log("Err in DS_LIST", err);
  }
  return ds_list;
}
//
//  C L U S T E R  D A T A S E T  O R D E R
// test: from re-order datasets, "--Select distance metric to cluster by:". Should not be "undefined"
router.post('/cluster_ds_order', helpers.isLoggedIn, (req, res) => {
  console.log('in cluster_ds_order');
  let html = '';
  const user_timestamp = viz_files_obj.get_user_timestamp(req);

  let metric = req.body.metric;
  let biom_file_path = viz_files_obj.get_file_tmp_path_by_ending(req, 'count_matrix.biom');
  let tmp_file_path = file_path_obj.get_tmp_file_path(req);

  const current_pr_dat_obj = req.session.project_dataset_vars;

  let pjds_lookup = current_pr_dat_obj.current_project_dataset_obj_by_name;
  let options = {
    scriptPath : CFG.PATH_TO_VIZ_SCRIPTS,
    args :       [ '-in', biom_file_path, '-metric', metric, '--function', 'cluster_datasets', '--basedir', tmp_file_path, '--prefix', user_timestamp],
  };
  console.log(options.scriptPath + '/distance_and_ordination.py ' + options.args.join(' '));

  let cluster_process = spawn( options.scriptPath + '/distance_and_ordination.py', options.args, {
    env:{'PATH': CFG.PATH, 'LD_LIBRARY_PATH': CFG.LD_LIBRARY_PATH},
    detached: true,
    stdio: [ 'ignore', null, null ]
  });  // stdin, stdout, stderr

  //let heatmap_process = spawn( 'which' , ['python'], {env:{'PATH':envpath}});
  let output = '';
  cluster_process.stdout.on('data', function clusterProcessStdout(data) {
    output += data.toString();
  });

  cluster_process.on('close', function clusterProcessOnClose(code) {
    console.log('ds cluster process exited with code ' + code);
    let ds_list = get_ds_list(output);
    helpers.print_log_if_not_vamps('dsl: ' + JSON.stringify(ds_list));

    //let last_line = ary[ary.length - 1];
    if (code === 0){   // SUCCESS
      try {
        let dataset_list = JSON.parse(ds_list);

        let potential_chosen_id_name_hash = COMMON.create_new_chosen_id_name_hash(dataset_list, pjds_lookup);
        let ascii_file = viz_files_obj.get_tree_file_name(req, metric);
        let ascii_file_path = path.join(tmp_file_path, ascii_file);
        read_file_when_ready(ascii_file_path);
          // .then(r => console.log("RRR: ", r));
        fs.readFile(ascii_file_path, 'utf8', function readAsciiTreeFile(err, ascii_tree_data) {
          if (err) {
            return console.log(err);
          } else {
            //console.log(data);

            html = '';

            html += "<table id='drag_table' class='table table-condensed' >";
            html += "<thead></thead>";
            html += "  <tbody>";
            for (let i in potential_chosen_id_name_hash.names){
              html += "<tr class='tooltip_row'>";
              html += "<td class='dragHandle' id='" + potential_chosen_id_name_hash.ids[i] + "--" + potential_chosen_id_name_hash.names[i] + "'> ";
              html += "<input type='hidden' name='ds_order[]' value='" + potential_chosen_id_name_hash.ids[i] + "'>";
              html += (parseInt(i) + 1).toString() + " (id:" +  potential_chosen_id_name_hash.ids[i] + ") - " + potential_chosen_id_name_hash.names[i];
              html += "</td>";
              html += "   <td>";
              html += "       <a href='#' onclick='move_to_the_top(" + (parseInt(i) + 1).toString() + ",\"" + potential_chosen_id_name_hash.ids[i] + "--" + potential_chosen_id_name_hash.names[i] + "\")'>^</a>";
              html += "   </td>";
              html += "</tr>";
            }
            html += "</tbody>";
            html += "</table>";
            html += '/////<pre style="font-size:10px">' + metric + '<br><small>' + ascii_tree_data + '</small></pre>';

            res.send(html);
          }
        });
      }
      catch(err) {
        // TODO: test
        res.send('Calculation Error: ' + err.toString());
        //      let html = "<dev class = 'base_color_red'>Python Script ERROR in PCOA 3D </dev>";
        //       res.json(data);
      }
    }
  });
});
//
//
//
// test heatmap
router.post('/dheatmap_number_to_color', helpers.isLoggedIn, (req, res) => {
  console.log('in dheatmap_number_to_color');

  const distmtx_file_tmp_path = viz_files_obj.get_file_tmp_path_by_ending(req, 'distance.json');

  read_file_when_ready(distmtx_file_tmp_path);
  const distance_matrix = JSON.parse(fs.readFileSync(distmtx_file_tmp_path, 'utf8'));

  let metadata = {};
  metadata.numbers_or_colors = req.body.numbers_or_colors;
  metadata.split = false;
  metadata.metric = req.session.selected_distance;  // revert back to selected
  let html = IMAGES.create_hm_table(req, distance_matrix, metadata );

  const outfile_name = viz_files_obj.get_file_names(req)['dheatmap-api.html'];

  let data = {};
  data.html = html;
  data.numbers_or_colors = req.body.numbers_or_colors;
  data.filename = outfile_name;
  //res.send(outfile_name)
  res.json(data);
});

function FinishSplitFile(req, res){
  let file_name = viz_files_obj.get_distmtx_file_name(req);
  let distmtx_file_path = file_path_obj.get_tmp_distmtx_file_path(req, file_name);

  read_file_when_ready(distmtx_file_path);
  fs.readFile(distmtx_file_path, 'utf8', function readFile(err, mtxdata) {
    if (err) {
      res.json({'err': err});
    } else {
      let split_distance_csv_matrix = mtxdata.split('\n');

      let metadata = {};
      metadata.numbers_or_colors = req.body.numbers_or_colors;
      metadata.split = true;
      metadata.metric = req.body.split_distance_choice;

      let html = IMAGES.create_hm_table_from_csv(req, split_distance_csv_matrix, metadata );

      let outfile_name = viz_files_obj.get_file_names(req)['dheatmap-api.html'];

      let data = {};
      data.html = html;
      data.numbers_or_colors = req.body.numbers_or_colors;
      data.filename = outfile_name;
      res.json(data);
    }
  });
}


router.post('/dheatmap_split_distance', helpers.isLoggedIn, (req, res) => {
  console.log('in dheatmap_split_distance');
  console.log(req.body);

  const test_distmtx_file = viz_files_obj.get_file_tmp_path_by_ending(req, 'distance_mh_bc.tsv');

  if (helpers.fileExists(test_distmtx_file)){
    console.log('Using Old Files');
    FinishSplitFile(req, res);
    return;
  }

  const biom_file_path = viz_files_obj.get_file_tmp_path_by_ending(req, 'count_matrix.biom');
  const user_timestamp = viz_files_obj.get_user_timestamp(req);
  const tmp_file_path = file_path_obj.get_tmp_file_path(req);
  let options = {
    scriptPath: CFG.PATH_TO_VIZ_SCRIPTS,
    args:       [ '-in', biom_file_path, '-splits', '--function', 'splits_only', '--basedir', tmp_file_path, '--prefix', user_timestamp ],
  };

  console.log(options.scriptPath + '/distance_and_ordination.py ' + options.args.join(' '));
  let split_process = spawn( options.scriptPath +'/distance_and_ordination.py', options.args, {
    env: {'PATH': CFG.PATH, 'LD_LIBRARY_PATH': CFG.LD_LIBRARY_PATH},
    detached: true,
    stdio: 'pipe'  // stdin, stdout, stderr
  });

  let stdout = '';
  split_process.stdout.on('data', function splitsProcessStdout(data) {
    //
    //data = data.toString().replace(/^\s+|\s+$/g, '');
    data = data.toString();
    stdout += data;

  });

  let stderr = '';
  split_process.stderr.on('data', function splitsProcessStderr(data) {
    console.log('stderr: ' + data);
    //data = data.toString().replace(/^\s+|\s+$/g, '');
    data = data.toString();
    stderr += data;
  });
  split_process.on('close', function splitsProcessOnClose(code) {
    console.log('finished code:' + code.toString());
    console.log('Creating New Split Distance Files');
    FinishSplitFile(req, res);

  });
});

//
//
//
// test: "More download choices" "Matrix file" or "Biom Matrix File" etc.
router.post('/download_file', helpers.isLoggedIn, (req, res) => {
  console.log('in routes_visualization download_file');
  const file_type = req.body.file_type;
  res.setHeader('Content-Type', 'text/plain');

  if (file_type === 'matrix') {
    let user_timestamp = viz_files_obj.get_user_timestamp(req);
    let tmp_file_path = file_path_obj.get_tmp_file_path(req);
    helpers.create_matrix_from_biom(res, tmp_file_path, user_timestamp);
  }
  else {
    const file_path = viz_files_obj.get_file_names_switch(req, file_type);
    res.download(file_path); // Set disposition and send it.
  }

});

//
//
//
// test: clear by substring, first opening
router.get('/clear_filters', helpers.isLoggedIn, (req, res) => {
  //req.session.SHOW_DATA = C.ALL_DATASETS;
  console.log('in clear filters');
  //console.log(req.query)
  //FILTER_ON = false
  req.session.PROJECT_TREE_OBJ = [];
  if (req.query.hasOwnProperty('btn') && req.query.btn === '1'){
    req.session.DATA_TO_OPEN = {};
  }

  // TOTO These 'now GLOBAL' variables should be attached to the session so filering is seen by only one person
  // DATA_TO_OPEN PROJECT_TREE_OBJ PROJECT_TREE_PIDS PROJECT_FILTER SHOW_DATA
  req.session.PROJECT_TREE_PIDS = filters_obj.filter_project_tree_for_permissions(req, req.session.SHOW_DATA.projects);
  req.session.PROJECT_FILTER = {"substring":"", "env":[], "target":"", "portal":"", "public":"-1", "metadata1":"", "metadata2":"", "metadata3":"", "pid_length":req.session.PROJECT_TREE_PIDS.length};
  res.json(req.session.PROJECT_FILTER);
});


//
//
//

router.get('/load_portal/:portal', helpers.isLoggedIn, (req, res) => {
  let portal = req.params.portal;
  console.log('in load_portal: ' + portal);
  req.session.SHOW_DATA = C.ALL_DATASETS;
  req.session.PROJECT_TREE_OBJ = [];

  req.session.PROJECT_TREE_OBJ = helpers.get_portal_projects(req, portal);
  req.session.PROJECT_TREE_PIDS = filters_obj.filter_project_tree_for_permissions(req, req.session.PROJECT_TREE_OBJ);
  let temp_project_filter = {"substring": "", "env": [],"target": "", "portal": "", "public": "-1", "metadata1": "", "metadata2": "", "metadata3": "", "pid_length":  req.session.PROJECT_TREE_PIDS.length};
  res.json(temp_project_filter);
});
//
//
//  FILTERS FILTERS  FILTERS FILTERS  FILTERS FILTERS  FILTERS FILTERS
//  FILTERS FILTERS  FILTERS FILTERS  FILTERS FILTERS  FILTERS FILTERS
//

const filters_obj =  new visualization_controller.visualizationFilters();

//  FILTER #1 LIVESEARCH PROJECTS (substring) FILTER
//
// test: search by substring
router.get('/livesearch_projects/:substring', (req, res) => {
  console.log('viz:in livesearch_projects/:substring');
  let substring = req.params.substring.toUpperCase();
  let empty_string = filters_obj.check_if_empty_val(substring);
  if (empty_string) {
    substring = "";
  }
  req.session.PROJECT_FILTER.substring = substring;

  const global_filter_vals = filters_obj.get_global_filter_values(req);
  req.session.PROJECT_FILTER = global_filter_vals.project_filter;
  req.session.PROJECT_TREE_OBJ = global_filter_vals.newproject_tree_obj;
  req.session.PROJECT_TREE_PIDS = global_filter_vals.project_tree_pids;

  res.json(req.session.PROJECT_FILTER);
});


//
//  FILTER #2 LIVESEARCH ENV PROJECTS FILTER
//
// test click filter by ENV source on visuals_index
router.get('/livesearch_env/:envid', (req, res) => {
  req.session.PROJECT_FILTER.env = filters_obj.get_envid_lst(req);

  const global_filter_vals = filters_obj.get_global_filter_values(req);
  req.session.PROJECT_FILTER = global_filter_vals.project_filter;
  req.session.PROJECT_TREE_OBJ = global_filter_vals.newproject_tree_obj;
  req.session.PROJECT_TREE_PIDS = global_filter_vals.project_tree_pids;

  // helpers.print_log_if_not_vamps('PROJECT_FILTER');
  console.log(req.session.PROJECT_FILTER);
  res.json(req.session.PROJECT_FILTER);

});
//
//  FILTER #3 LIVESEARCH TARGET PROJECTS FILTER
//
// test click filter by domain/Target on visuals_index
router.get('/livesearch_target/:gene_target', (req, res) => {
  let gene_target = req.params.gene_target;
  let empty_string = filters_obj.check_if_empty_val(gene_target);
  if (empty_string) {
    gene_target = "";
  }
  req.session.PROJECT_FILTER.target = gene_target;

  const global_filter_vals = filters_obj.get_global_filter_values(req);
  req.session.PROJECT_FILTER = global_filter_vals.project_filter;
  req.session.PROJECT_TREE_OBJ = global_filter_vals.newproject_tree_obj;
  req.session.PROJECT_TREE_PIDS = global_filter_vals.project_tree_pids;

  console.log(req.session.PROJECT_FILTER);
  res.json(req.session.PROJECT_FILTER);

});
//
//
// FILTER #4
//
// test click filter by portal on visuals_index
router.get('/livesearch_portal/:portal', (req, res) => {
  console.log('viz:in livesearch portal');
  let select_box_portal = req.params.portal;
  let empty_string = filters_obj.check_if_empty_val(select_box_portal);
  if (empty_string) {
    select_box_portal = "";
  }
  req.session.PROJECT_FILTER.portal = select_box_portal;

  const global_filter_vals = filters_obj.get_global_filter_values(req);
  req.session.PROJECT_FILTER = global_filter_vals.project_filter;
  req.session.PROJECT_TREE_OBJ = global_filter_vals.newproject_tree_obj;
  req.session.PROJECT_TREE_PIDS = global_filter_vals.project_tree_pids;

  res.json(req.session.PROJECT_FILTER);

});
//
//
//
//  FILTER # 5 LIVESEARCH PUBLIC/PRIVATE PROJECTS FILTER
//
// test: click public/private on visuals_index
router.get('/livesearch_status/:q', (req, res) => {
  console.log('viz:in livesearch status');
  req.session.PROJECT_FILTER.public = req.params.q;

  const global_filter_vals = filters_obj.get_global_filter_values(req);
  req.session.PROJECT_FILTER = global_filter_vals.project_filter;
  req.session.PROJECT_TREE_OBJ = global_filter_vals.newproject_tree_obj;
  req.session.PROJECT_TREE_PIDS = global_filter_vals.project_tree_pids;

  console.log(req.session.PROJECT_FILTER);
  res.json(req.session.PROJECT_FILTER);

});
//
//
//  FILTER #6  LIVESEARCH METADATA FILTER
//
// test click filter by Metadata on visuals_index
router.get('/livesearch_metadata/:num/:q', (req, res) => {
  console.log('viz:in livesearch metadata');

  let num = req.params.num;
  let q = req.params.q;
  console.log('num ' + num);
  console.log('query ' + q);

  let empty_string = filters_obj.check_if_empty_val(q);
  if (empty_string) {
    q = "";
  }
  req.session.PROJECT_FILTER['metadata' + num] = q;

  const global_filter_vals = filters_obj.get_global_filter_values(req);
  req.session.PROJECT_FILTER = global_filter_vals.project_filter;
  req.session.PROJECT_TREE_OBJ = global_filter_vals.newproject_tree_obj;
  req.session.PROJECT_TREE_PIDS = global_filter_vals.project_tree_pids;

  console.log(req.session.PROJECT_FILTER);
  res.json(req.session.PROJECT_FILTER);

});

function get_files_prefix(req) {
  let files_prefix = path.join(CFG.JSON_FILES_BASE, NODE_DATABASE) + "--datasets_" ;
  let units = req.body.units;
  let taxonomies = {
    default_simple: 'tax_' + C.default_taxonomy.name + '_simple',
    default_custom: 'tax_' + C.default_taxonomy.name + '_custom',
    rdp: 'tax_rdp2.6_simple',
    generic: 'tax_generic_simple'
  };

  if (units === taxonomies["default_simple"] || units === taxonomies["default_custom"]) {
    files_prefix = files_prefix + C.default_taxonomy.name;
  } else if (units === taxonomies['rdp']) {
    files_prefix = files_prefix + "rdp2.6";
  } else if (units === taxonomies['generic']) {
    files_prefix = files_prefix + "generic";
  } else {
    // TODO: test
    //      let html = "<dev class = 'base_color_red'>Python Script ERROR in PCOA 3D </dev>";
    //       res.json(data);
    console.log('ERROR: Units not found: ' + req.body.units); // ERROR
  }
  return files_prefix;
}
//
// test: page after custom taxonomy been chosen, shows the tree
router.post('/check_units', (req, res) => {
  console.log('IN check_UNITS');
  console.log(req.body);
  let path_to_file;
  let jsonfile;

  let files_prefix = get_files_prefix(req);
  let file_err = 'PASS';
  let dataset_ids = req.session.chosen_id_order;
  // console.log('dataset_ids')
//   console.log(dataset_ids)

  for (let i in dataset_ids){
    //console.log(dataset_ids[i]+' <> '+C.DATASET_NAME_BY_DID[dataset_ids[i]])
    path_to_file = path.join(files_prefix, dataset_ids[i] +'.json');
    //console.log(path_to_file)
    try {
      jsonfile = require(path_to_file);
    }
    catch(e){
      file_err = 'FAIL';
      break;
    }
  }
  // TODO: test
  res.send(file_err);
  //      let html = "<dev class = 'base_color_red'>Python Script ERROR in PCOA 3D </dev>";
  //       res.json(data);
});
//
//

function get_options_by_node(node) {
  let options_obj = {
    id: node.node_id,
    text: node.taxon,
    child: 0,
    tooltip: node.rank,
  };
  if (node.children_ids.length > 0) {
    options_obj.child = 1;
    options_obj.item = [];
  }
  return options_obj;
}

//
// test: choose custom taxonomy, show tree
router.get('/tax_custom_dhtmlx', (req, res) => {
  // console.time("TIME: tax_custom_dhtmlx");
  console.log('IN tax_custom_dhtmlx')
  let myurl = url.parse(req.url, true);
  let id = myurl.query.id;

  let json = {};
  json.id = id;
  json.item = [];

  if (parseInt(id) === 0){
    /*
        return json for collapsed tree: 'domain' only
            json = {"id":"0","item":[
                {"id":"1","text":"Bacteria","tooltip":"domain","checked":true,"child":"1","item":[]},
                {"id":"214","text":"Archaea","tooltip":"domain","checked":true,"child":"1","item":[]},
                {"id":"338","text":"Unknown","tooltip":"domain","checked":true,"child":"1","item":[]},
                {"id":"353","text":"Organelle","tooltip":"domain","checked":true,"child":"1","item":[]}
                ]
            }
    */

    C.new_taxonomy.taxa_tree_dict_map_by_rank["domain"].map(node => {
        let options_obj = get_options_by_node(node);
        options_obj.checked = true;
        json.item.push(options_obj);
      }
    );
  }
  else {
    const objects_w_this_parent_id = C.new_taxonomy.taxa_tree_dict_map_by_id[id].children_ids.map(n_id => C.new_taxonomy.taxa_tree_dict_map_by_id[n_id]);
    objects_w_this_parent_id.map(node => {
      let options_obj = get_options_by_node(node);
      options_obj.checked = false;
      json.item.push(options_obj);
    });
  }
  json.item.sort(function sortByAlpha(a, b) {
    return helpers.compareStrings_alpha(a.text, b.text);
  });

  // console.timeEnd("TIME: tax_custom_dhtmlx");

  res.json(json);
});
//

function get_tt_pj_id(node) {
  let tt_pj_id = 'project/' + node.project + '/' + node.title;
  if (node.public) {
    tt_pj_id += '/public';
  } else {
    tt_pj_id += '/private';
  }
  return tt_pj_id;
}

function get_itemtext(pid) {
  let node = C.PROJECT_INFORMATION_BY_PID[pid];
  //console.log('node',node)
  let tt_pj_id = get_tt_pj_id(node);

  let pid_str = pid.toString();
  let itemtext = "<span id='" + tt_pj_id + "' class='tooltip_pjds_list'>" + node.project + "</span>";
  itemtext += " <a href='/projects/" + pid_str + "'><span title='profile' class='glyphicon glyphicon-question-sign'></span></a>";
  if (node.public) {
    itemtext += "<small> <i>(public)</i></small>";
  } else {
    itemtext += "<a href='/users/" + node.oid + "'><small> <i>(PI: " + node.username +")</i></small></a>";
  }
  return itemtext;
}
//  project_custom_dhtmlx
//
// test: show tree
router.get('/project_dataset_tree_dhtmlx', (req, res) => {
  console.log('IN project_dataset_tree_dhtmlx - routes_visualizations');
  // console.time("TIME: project_dataset_tree_dhtmlx");
  let myurl = url.parse(req.url, true);
  let id = myurl.query.id;
  console.log('id = ' + id);
  let json = {};
  json.id = id;
  json.item = [];
  console.log('req.session.DATA_TO_OPEN');
  console.log(req.session.DATA_TO_OPEN);



  let itemtext;
  if (parseInt(id) === 0){
    req.session.PROJECT_TREE_PIDS.map(pid => {
      itemtext = get_itemtext(pid);

      let pid_str = pid.toString();
      // if (Object.keys(req.session.DATA_TO_OPEN).includes(pid_str)){
      // TODO: Andy, how to test this?
      //   // TODO ? use json_item_collect(node, json_item, checked)
      //   json.item.push({id: 'p' + pid_str, text: itemtext, checked: false, child: 1, item: [], open: '1'});
      // }
      // else {
      //   json.item.push({id: 'p' + pid_str, text: itemtext, checked: false, child: 1, item: []});
      // }

      let options_obj = {
        id: 'p' + pid_str,
        text: itemtext,
        checked: false,
        child: 1,
        item: [],
      };
      if (Object.keys(req.session.DATA_TO_OPEN).includes(pid_str)){
        // TODO: Andy, how to test this?
        options_obj.open = '1';
      }

      json.item.push(options_obj);

      // return json;
    });
  }
  else { //parseInt(id) !== 0
    //console.log(JSON.stringify(ALL_DATASETS))
    id = id.substring(1);  // id = pxx
    let this_project = C.ALL_DATASETS.projects.find(prj => prj.pid === parseInt(id));

    let all_checked_dids = [];
    if (Object.keys(req.session.DATA_TO_OPEN).length > 0){
      // TODO: Andy, how to test this?
      //console.log('dto');
      helpers.print_log_if_not_vamps('req.session.DATA_TO_OPEN');
      for (let openpid in req.session.DATA_TO_OPEN){
        Array.prototype.push.apply(all_checked_dids, req.session.DATA_TO_OPEN[openpid]);
      }
    }
    console.log('all_checked_dids:');
    helpers.print_log_if_not_vamps(JSON.stringify(all_checked_dids));

    let pname = this_project.name;
    this_project.datasets.map(dat => {

      let did   = dat.did;
      //console.log('didXX', did)
      let dname = dat.dname;
      let ddesc = dat.ddesc;
      let tt_ds_id  = 'dataset/' + pname + '/' + dname + '/' + ddesc;
      itemtext = "<span id='" +  tt_ds_id  + "' class='tooltip_pjds_list'>" + dname + "</span>";

      let options_obj = {
        id: did,
        text: itemtext,
        child: 0,
      };
      if (all_checked_dids.includes(parseInt(did))) {
        options_obj.checked = '1';
      }

      json.item.push(options_obj);
    });
  }
  json.item.sort(function sortByAlpha(a, b) {
    return helpers.compareStrings_alpha(a.text, b.text);
  });
  // console.timeEnd("TIME: project_dataset_tree_dhtmlx");
  res.send(json);
});
//
//
// test: click on row (index 1...) of taxonomy table
router.get('/taxa_piechart', (req, res) => {
  console.log('IN taxa_piechart - routes_visualizations');
  const myurl = url.parse(req.url, true);
  const tax = myurl.query.tax;
  const tmp_file_path = file_path_obj.get_tmp_file_path(req);
  const matrix_file_name = viz_files_obj.get_file_names(req)['count_matrix.biom'];
  const matrix_file_path = path.join(tmp_file_path, matrix_file_name);

  read_file_when_ready(matrix_file_path);
  fs.readFile(matrix_file_path, 'utf8', (err, mtxdata) => {
    if (err) {
      let msg = 'ERROR Message ' + err;
      helpers.render_error_page(req, res, msg);
    } else {
      let biom_matrix = JSON.parse(mtxdata);
      let data = [];
      let new_matrix = {};

      for (let i in biom_matrix.rows){
        if (biom_matrix.rows[i].id === tax){

          data = biom_matrix.data[i];
          // data = [1,2,3,4]
          // want [[1],[2],[3],[4]]

          new_matrix.data = [];
          for (let n in data){
            new_matrix.data.push([data[n]]);
          }
          new_matrix.columns = [biom_matrix.rows[i]];
        }
      }
      new_matrix.rows = biom_matrix.columns;
      helpers.print_log_if_not_vamps( 'new mtx:' + JSON.stringify(new_matrix) + '\ncounts: ' + JSON.stringify(new_matrix.data));

      let cols =  biom_matrix.columns;

      const timestamp_only = viz_files_obj.get_timestamp_only(req);
      res.render('visuals/user_viz_data/pie_single_tax', {
        title: 'Datasets PieChart',
        matrix: JSON.stringify(new_matrix),
        //post_items: JSON.stringify(visual_post_items),
        tax: tax,
        datasets: JSON.stringify(cols),
        counts: data,
        ts: timestamp_only,
        user: req.user, hostname: CFG.hostname,
      });
    }
  });
});
//
//
//
router.post('/rename_datasets_file', (req, res) => {
	console.log('in rename_datasets_file')
	console.log(req.body);
	if(Object.keys(req.body).length === 0){
		gather_saved_elements_data(req, res)
		return;
	}
	//console.log(CFG.USER_FILES_BASE);
	let saved_elements_dir = path.join(CFG.USER_FILES_BASE,req.user.username);
	//console.log(saved_elements_dir);
	
	let pathto_oldfilename = path.join(saved_elements_dir, req.body.oldfilename)
	let pathto_newfilename = path.join(saved_elements_dir, req.body.newfilename)
	console.log(pathto_newfilename)
	console.log(pathto_oldfilename)
	fs.rename(pathto_oldfilename, pathto_newfilename, function(err) {
    	if ( err ) console.log('ERROR: ' + err);
    	gather_saved_elements_data(req, res)
	});
	return;
        
})
module.exports = router;

/**
 * F U N C T I O N S
 **/

// Generally put fucntion in helpers.js
//
function gather_saved_elements_data(req, res) {
	let acceptable_prefixes = ['datasets', 'image'];
    let saved_elements_dir = path.join(CFG.USER_FILES_BASE,req.user.username);

    let file_info = {};
    let modify_times = [];
    helpers.mkdirSync(saved_elements_dir);
    fs.readdir(saved_elements_dir, (err, files) => {
      if (err){

        let msg = 'ERROR Message '+err;
        helpers.render_error_page(req,res,msg);

      } else {
        for (let f in files){
          let name_parts = files[f].split('-');
          let prefix_name = name_parts[0];
          if (acceptable_prefixes.includes(prefix_name)){
            let stat = fs.statSync(path.join(saved_elements_dir, files[f]));
            file_info[stat.mtime.getTime()] = {
              'filename': files[f],
              'size': stat.size,
              'mtime': stat.mtime.toString()
            };
            modify_times.push(stat.mtime.getTime());

          }
        }
        modify_times.sort().reverse();
        //console.log(JSON.stringify(file_info));
      }

      res.render('visuals/saved_elements',
        { title: 'saved_elements',

          finfo: JSON.stringify(file_info),
          times: modify_times,
          user: req.user, hostname: CFG.hostname,
        });

    });
}