var Project   = require(app_root + '/models/project_model');
// var Dataset   = require(app_root + '/models/dataset_model');
var User      = require(app_root + '/models/user_model');
var helpers   = require(app_root + '/routes/helpers/helpers');
var CONSTS    = require(app_root + '/public/constants');
var validator = require('validator');
// var config    = require(app_root + '/config/config');
// var fs        = require('fs');
// var path      = require('path');

// 1 create data from
// 1.1  db
// 1.2  form
// 1.3  file

// 2 saved data to
// 2.1  db
// 2.2  form
// 2.3  file

// 3 show data
// ===

// 1 create data
class CreateDataObj {

  constructor(req, res, project_id, dataset_ids) {
    this.req             = req || {};
    this.res             = res || {};
    this.pid             = project_id || '';
    this.dataset_ids     = dataset_ids || [];
    this.all_field_names = this.collect_field_names();
    this.all_metadata    = {};
    this.prepare_empty_metadata_object();
    //
    // this.project         = PROJECT_INFORMATION_BY_PID[project_id].project;
  }

  collect_field_names() {
    var all_field_names = this.get_field_names_by_dataset_ids(this.dataset_ids);
    all_field_names     = all_field_names.concat(CONSTS.METADATA_FORM_REQUIRED_FIELDS);
    all_field_names     = all_field_names.concat(CONSTS.REQ_METADATA_FIELDS_wIDs);
    all_field_names     = all_field_names.concat(CONSTS.PROJECT_INFO_FIELDS);
    all_field_names     = all_field_names.concat(CONSTS.METADATA_NAMES_ADD);

    all_field_names = helpers.unique_array(all_field_names);
    return all_field_names;
  }

  get_field_names_by_dataset_ids() {

    var field_names_arr = [];

    if (typeof dataset_ids === 'undefined' || this.dataset_ids.length === 0) {
      field_names_arr = field_names_arr.concat(Object.keys(MD_CUSTOM_FIELDS_UNITS));
    }
    else {
      for (var i = 0; i < this.dataset_ids.length; i++) {
        var dataset_id  = this.dataset_ids[i];
        field_names_arr = field_names_arr.concat(Object.keys(AllMetadata[dataset_id]));
      }
    }
    field_names_arr = helpers.unique_array(field_names_arr); // one level
    field_names_arr.sort();

    return field_names_arr;
//  [
//   'access_point_type',
//   'adapter_sequence',
//   'adapter_sequence_id',
// ...
  }

  prepare_empty_metadata_object() {
    console.time('TIME: prepare_empty_metadata_object');
    var pid             = this.pid;
    var field_names_arr = this.all_field_names;
    var all_metadata    = this.all_metadata || {};

    if (!(all_metadata.hasOwnProperty(this.pid))) {
      all_metadata[pid] = {};
    }

    for (var i = 0; i < field_names_arr.length; i++) {
      var field_name = field_names_arr[i];
      if (!(all_metadata[pid].hasOwnProperty(field_name))) {
        all_metadata[pid][field_name] = [];
      }
    }

    console.timeEnd('TIME: prepare_empty_metadata_object');
    this.all_metadata = all_metadata;
  }

  get_project_info(req, res, project_name_or_pid) {
    var project_info;

    var user_id  = req.form.pi_id_name.split('#')[0];
    var user_obj = User.getUserInfoFromGlobal(user_id);

    // TODO: use with new
    if (typeof project_name_or_pid === 'undefined') {
      const new_project = new Project(req, res, "", user_obj);
      var project_obj   = new_project.project_obj;

    }
    if (helpers.isInt(project_name_or_pid)) {
      project_info = PROJECT_INFORMATION_BY_PID[project_name_or_pid];
    }
    else {
      project_info = PROJECT_INFORMATION_BY_PNAME[project_name_or_pid];
    }

    return {
      project: project_info.project,
      first_name: project_info.first,
      institution: project_info.institution,
      last_name: project_info.last,
      pi_email: project_info.email,
      pi_name: project_info.first + ' ' + project_info.last,
      project_title: project_info.title,
      public: project_info.public,
      username: project_info.username
    };
  }

  // This function cyclomatic complexity is too high (6)
  add_project_abstract_info(all_metadata_pid, repeat_times) { // use project_obj.abstract_data instead
    if ((all_metadata_pid['project_abstract'] === 'undefined') || (typeof all_metadata_pid['project_abstract'] === 'undefined') || (!all_metadata_pid.hasOwnProperty(['project_abstract']))) {
      all_metadata_pid['project_abstract'] = this.fill_out_arr_doubles('', repeat_times);
    }
    else {

      if ((all_metadata_pid['project_abstract'][0] !== 'undefined') && (!Array.isArray(all_metadata_pid['project_abstract'][0]))) {

        var project_abstract_correct_form = helpers.unique_array(all_metadata_pid['project_abstract']);

        if (typeof project_abstract_correct_form[0] !== 'undefined') {

          all_metadata_pid['project_abstract'] = this.fill_out_arr_doubles(project_abstract_correct_form[0].split(','), repeat_times);

        }
      }
    }
    return all_metadata_pid;
  }

  transpose_2d_arr(data_arr, matrix_length) {
    console.time('TIME: transpose_2d_arr');

    //make an array with proper length, even if the first one is empty
    // var matrix_length = DATASET_IDS_BY_PID[project_id].length + 1;
    var length_array = data_arr[0];
    if (data_arr[0].length < matrix_length) {
      length_array = this.fill_out_arr_doubles('', matrix_length);
    }

    var newArray = length_array.map(function (col, i) {
      return data_arr.map(function (row) {
        return row[i];
      });
    });
    console.timeEnd('TIME: transpose_2d_arr');
    return newArray;
  }

//   convertArrayOfObjectsToCSV(args) {
//   console.time('TIME: convertArrayOfObjectsToCSV');
//
//   var result, columnDelimiter, lineDelimiter, data, cellEscape, data_arr, transposed_data_arr, user_info, project_id;
//
//   data = args.data || null;
//   if (data === null) {
//     return null;
//   }
//
//   user_info = args.user_info || null;
//   if (user_info === null) {
//     return null;
//   }
//
//   project_id = args.project_id || null;
//   if (project_id === null) {
//     return null;
//   }
//
//   data_arr = helpers.array_from_object(data);
//
//   var matrix_length = DATASET_IDS_BY_PID[project_id].length + 1;
//   transposed_data_arr = this.transpose_2d_arr(data_arr, matrix_length);
//
//   columnDelimiter = args.columnDelimiter || ',';
//   lineDelimiter   = args.lineDelimiter || '\n';
//   cellEscape      = args.cellEscape || '"';
//
//   result = '';
//   transposed_data_arr.map(function (row) {
//     // TODO: to a function?
//     // result = row.map(function (item) {
//     var r1 = row.map(function (item) {
//       // Wrap each element of the items array with quotes
//       return cellEscape + item + cellEscape;
//     }).join(columnDelimiter);
//
//     result += r1;
//     result += lineDelimiter;
//   });
//
//
//   console.timeEnd('TIME: convertArrayOfObjectsToCSV');
//
//   return result;
// };

  make_metadata_object(req, res, pid, data_obj) {
    console.time('TIME: make_metadata_object');

    // var all_metadata = {};
    var dataset_ids  = DATASET_IDS_BY_PID[pid];
    var repeat_times = dataset_ids.length;

    // 0) get field_names
    // var all_field_names = this.collect_field_names(dataset_ids);

    // 1)
    //   // TODO: don't send all_metadata?
    var all_metadata = this.all_metadata;

    //2) all

    all_metadata[pid] = data_obj;

    //3) special

    var owner_id      = PROJECT_INFORMATION_BY_PID[pid].oid;
    const new_project = new Project(req, res, pid, owner_id);
    var project_info  = new_project.project_obj;

    // TODO: move to db creation?
    // console.log('MMM33 all_metadata[pid]');
    // console.log(JSON.stringify(all_metadata[pid]));

    for (var idx in CONSTS.PROJECT_INFO_FIELDS) {
      var field_name = CONSTS.PROJECT_INFO_FIELDS[idx];

      //todo: split if, if length == dataset_ids.length - just use as is
      if ((typeof all_metadata[pid][field_name] !== 'undefined') && all_metadata[pid][field_name].length < 1) {
        all_metadata[pid][field_name] = this.fill_out_arr_doubles(all_metadata[pid][field_name], repeat_times);
      }
      else {
        all_metadata[pid][field_name] = this.fill_out_arr_doubles(project_info[field_name], repeat_times);
      }
    }

    all_metadata[pid] = this.add_project_abstract_info(all_metadata[pid], repeat_times);

    // console.log('MMM9 all_metadata[pid]');
    // console.log(JSON.stringify(all_metadata[pid]));

    console.timeEnd('TIME: make_metadata_object');
    return all_metadata;

  }

  get_names_from_ordered_const() {
    console.time('time: ordered_metadata_names_only');

    const arraycolumn = (arr, n) =>
      arr.map(x => x[n]
      )
    ;

    console.timeEnd('time: ordered_metadata_names_only');
    return arraycolumn(CONSTS.ORDERED_METADATA_NAMES, 0);
  }

  make_array4(field_names_arr) {
// make a 2D array as in CONSTS.ORDERED_METADATA_NAMES: [field_names_arr[i2], field_names_arr[i2], '', '']
    var new_arr = [];
    for (var i2 = 0; i2 < field_names_arr.length; i2++) {
      var temp_arr = [field_names_arr[i2], field_names_arr[i2], '', ''];
      new_arr.push(temp_arr);
    }
    return new_arr;
  }

  make_all_field_names(dataset_ids) {
    var ordered_metadata_names_only = this.get_names_from_ordered_const();

    // why get_field_names_by_dataset_ids again? 1) substract METADATA_NAMES_SUBSTRACT, 2) substract '_id', 3) substract ordered_metadata_names_only
    var structured_field_names0 = this.get_field_names_by_dataset_ids(dataset_ids);
    var diff_names              = structured_field_names0.filter(function (x) {
      return CONSTS.METADATA_NAMES_SUBSTRACT.indexOf(x) < 0;
    });
    diff_names                  = diff_names.filter(function (item) {
      return /^((?!_id).)*$/.test(item);
    });
    diff_names                  = diff_names.filter(function (x) {
      return ordered_metadata_names_only.indexOf(x) < 0;
    });

    // // make a 2D array as in CONSTS.ORDERED_METADATA_NAMES: [diff_names[i2], diff_names[i2], '', '']
    // // TODO: add units from db
    // var big_arr_diff_names = [];
    // for (var i2 = 0; i2 < diff_names.length; i2++) {
    //   var temp_arr = [diff_names[i2], diff_names[i2], '', ''];
    //   big_arr_diff_names.push(temp_arr);
    // }

    var big_arr_diff_names = this.make_array4(diff_names);
    return helpers.unique_array(CONSTS.ORDERED_METADATA_NAMES.concat(big_arr_diff_names));

  }

  // new rows
  new_row_field_validation(req, field_name) {
    console.time('TIME: new_row_field_validation');
    var err_msg = '';

    //todo: send a value instead of 'req.body[field_name]'?
    var field_val_trimmed   = validator.escape(req.body[field_name] + '');
    field_val_trimmed       = validator.trim(field_val_trimmed + '');
    var field_val_not_valid = validator.isEmpty(field_val_trimmed + '');

    if (field_val_not_valid) {
      console.log("ERROR: an empty user's " + field_name);
      err_msg = 'User added field "' + field_name + '" must be not empty and have only alpha numeric characters';
      req.form.errors.push(err_msg);
    }

    console.timeEnd('TIME: new_row_field_validation');
    return field_val_trimmed;
  }

  get_column_name(row_idx, req) {
    console.time('TIME: get_column_name');

    var units_field_name  = this.new_row_field_validation(req, 'Units' + row_idx);
    var users_column_name = this.new_row_field_validation(req, 'Column Name' + row_idx);
    if (units_field_name !== '' && users_column_name !== '') {
      return [users_column_name, units_field_name];
    }
    console.timeEnd('TIME: get_column_name');
  }

  isUnique(all_clean_field_names_arr, column_name) {
    return (all_clean_field_names_arr.indexOf(column_name) < 0);
  }

  get_cell_val_by_row(row_idx, req) {
    console.time('TIME: get_cell_val_by_row');
    var new_row_length = req.body.new_row_length;
    var new_row_val    = [];

    for (var cell_idx = 0; cell_idx < parseInt(new_row_length); cell_idx++) {
      var cell_name = 'new_row' + row_idx.toString() + 'cell' + cell_idx.toString();
      var clean_val = validator.escape(req.body[cell_name] + '');
      clean_val     = validator.trim(clean_val + '');

      new_row_val.push(clean_val);
    }
    console.timeEnd('TIME: get_cell_val_by_row');

    return new_row_val;
  }

  get_first_column(matrix, col) {
    console.time('TIME: get_first_column');
    var column = [];
    for (var i = 0; i < matrix.length; i++) {
      column.push(matrix[i][col]);
    }
    console.timeEnd('TIME: get_first_column');

    return column;
  }

  collect_new_rows(req, all_field_names) {
    console.time('TIME: collect_new_rows');
    var new_row_num               = req.body.new_row_num;
    var all_clean_field_names_arr = helpers.unique_array(this.get_first_column(all_field_names, 0));

    for (var row_idx = 1; row_idx < parseInt(new_row_num) + 1; row_idx++) {
      var column_n_unit_names = this.get_column_name(row_idx, req);

      if (column_n_unit_names) {

        var users_column_name = column_n_unit_names[0];
        var units_field_name  = column_n_unit_names[1];
        var column_name       = users_column_name + ' (' + units_field_name + ')';
        var re                = / /g;
        var clean_column_name = users_column_name.toLowerCase().replace(re, '_') + '--UNITS--' + units_field_name.toLowerCase().replace(re, '_');


        if (column_name && this.isUnique(all_clean_field_names_arr, clean_column_name)) {
          // [ 'run', 'Sequencing run date', 'MBL Supplied', 'YYYY-MM-DD' ],
          all_field_names.push([clean_column_name, column_name, '', units_field_name]);
          req.form[clean_column_name] = [];
          req.form[clean_column_name] = this.get_cell_val_by_row(row_idx, req);
        }
        else if (!this.isUnique(all_clean_field_names_arr, clean_column_name)) {
          var err_msg = 'User added field with units "' + column_name + '" must be unique and have only alpha numeric characters';
          req.form.errors.push(err_msg);
        }
      }
    }
    console.timeEnd('TIME: collect_new_rows');

    return all_field_names;
  }


  fill_out_arr_doubles(value, repeat_times) {
    var arr_temp = Array(repeat_times);

    arr_temp.fill(value, 0, repeat_times);

    return arr_temp;
  }

  get_pi_list() {
    console.log('FROM Metadata Controller');
    var pi_list = [];

    for (var i in ALL_USERS_BY_UID) {
      pi_list.push({
        'PI': ALL_USERS_BY_UID[i].last_name + ' ' + ALL_USERS_BY_UID[i].first_name,
        'pi_id': i,
        'last_name': ALL_USERS_BY_UID[i].last_name,
        'first_name': ALL_USERS_BY_UID[i].first_name,
        'pi_email': ALL_USERS_BY_UID[i].email
      });
    }

    pi_list.sort(function sortByAlpha(a, b) {
      return helpers.compareStrings_alpha(a.PI, b.PI);
    });

    return pi_list;
  }

  from_obj_to_obj_of_arr(data, pid) {
    console.time('TIME: from_obj_to_obj_of_arr');
    var obj_of_arr = {};

    var dataset_ids = DATASET_IDS_BY_PID[pid];

    var all_field_names = this.all_field_names;

    for (var did_idx in dataset_ids) {
      var did = dataset_ids[did_idx];
      for (var field_name_idx in all_field_names) {

        var field_name = all_field_names[field_name_idx];
        if (!(obj_of_arr.hasOwnProperty(field_name))) {
          obj_of_arr[field_name] = [];
        }
        obj_of_arr[field_name].push(data[did][field_name]);
      }
    }

    // console.log('HHH3 obj_of_arr from from_obj_to_obj_of_arr');
    // console.log(JSON.stringify(obj_of_arr));
    // adapter_sequence = [
    //   'NNNNCAGTA',
    //   'NNNNATCGA',
    //   'NNNNAGACA',
    //   null,
    //   'NNNNCAGTA',
    //   'NNNNATCGA',
    //   null,
    //   'NNNNTGATA',
    //   'NNNNTAGCA',
    //   'NNNNATATA',
    //   'NNNNTCACA',
    //   'NNNNACTAT'
    // ]
    console.timeEnd('TIME: from_obj_to_obj_of_arr');
    return obj_of_arr;
  }

  create_all_metadata_form_new(rows, all_field_names, project_obj) {
    console.time('TIME: create_all_metadata_form_new');

    var req = this.req;
    var res = this.res;
    var pid = project_obj.pid;
    console.log('DDD pid', pid);
    var d_region_arr = req.form.d_region.split('#');
    console.log('DDD3, all_field_names', all_field_names);

    this.prepare_empty_metadata_object(pid, all_field_names, {});
    var all_metadata = this.all_metadata;
    console.log('PPP01 all_metadata from create_all_metadata_form_new', all_metadata);
    var repeat_times = parseInt(req.form.samples_number, 10);
    console.log(typeof repeat_times);

    // TODO: add to current_info fields from below and do all_metadata[pid][field_name] for all at once

    var current_info        = Object.assign(project_obj);
    current_info.domain     = d_region_arr[0].slice(0, -1);
    current_info.dna_region = d_region_arr[1].split('_')[0];
    // target_gene:

    // TODO: domain_id
    // constants.DOMAINS = {
    //   domains: [
    //     {id: 1, name: 'Archaea'},

    for (var field_name in current_info) {
      all_metadata[pid][field_name] = [current_info[field_name]];
      //todo: split if, if length == dataset_ids.length - just use as is
      if ((typeof all_metadata[pid][field_name] !== 'undefined') && all_metadata[pid][field_name].length < 1) {
        all_metadata[pid][field_name] = this.fill_out_arr_doubles(all_metadata[pid][field_name], repeat_times);
      }
      else {
        all_metadata[pid][field_name] = this.fill_out_arr_doubles(current_info[field_name], repeat_times);
      }
    }

    // obj1.concat(obj2);

    console.log('FFF1 all_metadata[pid] before');
    console.log(JSON.stringify(all_metadata[pid]));

    all_metadata[pid] = this.add_project_abstract_info(all_metadata[pid], repeat_times);

    console.log('FFF2 all_metadata[pid] before');
    console.log(JSON.stringify(all_metadata[pid]));

    var more_fields = ['adapter_sequence_id',
      'dataset_description',
      'dataset_id',
      'dna_region_id',
      'domain_id',
      'env_biome_id',
      'env_feature_id',
      'env_material_id',
      'env_package_id',
      'geo_loc_name_id',
      'illumina_index_id',
      'primer_suite_id',
      'run_id',
      'sequencing_platform_id',
      'target_gene_id'];

    for (var f in more_fields) {
      all_metadata[pid][more_fields[f]] = this.fill_out_arr_doubles('', repeat_times);

    }

    console.log('PPP02 all_metadata from create_all_metadata_form_new', all_metadata);
    console.timeEnd('TIME: create_all_metadata_form_new');

    return all_metadata;

  }

  get_new_val(req, all_metadata_pid, all_new_names) {
    var new_val = [];
    for (var new_name_idx in all_new_names) {
      var new_name = all_new_names[new_name_idx];
      if (new_name !== '') {
        new_val = req.body[new_name];
      }
      if (typeof new_val !== 'undefined' && new_val.length !== 0) {
        all_metadata_pid[new_name] = new_val;
      }
    }
    return all_metadata_pid;
  }

  get_all_req_metadata(dataset_id) {
    console.time('TIME: 5) get_all_req_metadata');

    var data = {};
    for (var idx = 0; idx < CONSTS.REQ_METADATA_FIELDS_wIDs.length; idx++) {
      var key      = CONSTS.REQ_METADATA_FIELDS_wIDs[idx];
      // data[key] = [];
      var val_hash = helpers.required_metadata_names_from_ids(AllMetadata[dataset_id], key + '_id');

      data[key] = val_hash.value;
    }
    console.time('TIME: 5) get_all_req_metadata');

    return data;
  }

  // This function cyclomatic complexity is too high (68)
  get_primers_info(dataset_id) {
    console.time('TIME: get_primers_info');
    var primer_suite_id = AllMetadata[dataset_id]['primer_suite_id'];
    var primer_info     = {};

    if (typeof primer_suite_id === 'undefined' || typeof MD_PRIMER_SUITE[primer_suite_id] === 'undefined' || typeof MD_PRIMER_SUITE[primer_suite_id].primer === 'undefined') {
      return {};
    }
    else {
      try {
        for (var i = 0; i < MD_PRIMER_SUITE[primer_suite_id].primer.length; i++) {

          var curr_direction = MD_PRIMER_SUITE[primer_suite_id].primer[i].direction;

          if (typeof primer_info[curr_direction] === 'undefined' || primer_info[curr_direction].length === 0) {
            primer_info[curr_direction] = [];
          }

          primer_info[curr_direction].push(MD_PRIMER_SUITE[primer_suite_id].primer[i].sequence);
        }
      } catch (err) {
        // Handle the error here.
        return {};
      }

    }
    // console.log('DDD primer_info');
    // console.log(JSON.stringify(primer_info));
    // {'F':['CCTACGGGAGGCAGCAG','CCTACGGG.GGC[AT]GCAG','TCTACGGAAGGCTGCAG'],'R':['GGATTAG.TACCC']}

    console.timeEnd('TIME: get_primers_info');
    return primer_info;
  }

  // get_project_name(edit_metadata_file) {
  //   console.time('TIME: get_project_name');
  //
  //   var edit_metadata_file_parts = edit_metadata_file.split('-')[1].split('_');
  //   var edit_metadata_project    = '';
  //
  //   if (edit_metadata_file_parts.length >= 4) {
  //
  //     edit_metadata_project = edit_metadata_file_parts[1] + '_' + edit_metadata_file_parts[2] + '_' + edit_metadata_file_parts[3];
  //   }
  //
  //   console.timeEnd('TIME: get_project_name');
  //   return edit_metadata_project;
  // }

  saveDataset(req, project_id) {
    console.log('TTT1 req.form from saveDataset = ', req.form);
    //dataset_id, dataset, dataset_description, project_id, created_at, updated_at,

    var dataset_obj                 = {};
    dataset_obj.dataset_id          = 0;
    dataset_obj.dataset             = req.form.dataset_name;
    dataset_obj.dataset_description = req.form.dataset_description;
    dataset_obj.project_id          = project_id;
    dataset_obj.created_at          = new Date();
    dataset_obj.updated_at          = new Date();

    console.log('OOO1 JSON.stringify(dataset_obj) = ', JSON.stringify(dataset_obj));

    // Dataset.addDataset(dataset_obj, function (err, rows) {

  }

  //  new submission
  // new_project_saved(err, rows) {
  //
  //   if (err) {
  //     console.log('WWW0 err', err);
  //     req.flash('fail', err);
  //     module.exports.show_metadata_new_again(req, res);
  //     // res.json(err);
  //   }
  //   else {
  //     console.log('WWW rows', rows);
  //     var pid = rows.insertId;
  //     add_info_to_project_globals(project_obj, pid);
  //
  //     const met_obj = new new_metadata_controller.CreateDataObj(req, res, pid, []);
  //
  //     var all_field_names = met_obj.collect_field_names();
  //
  //     // var all_field_names = collect_field_names();
  //     // TODO: add
  //     //   funding_code: [ '0' ],
  //     //   sample_concentration: [],
  //     //   submit_code: [],
  //     //   tube_label:
  //     // d_region: 'Bacterial#v4v5#Bv4v5',
  //     //   dataset_description: [],
  //     //   dataset_name: [],
  //     //   funding_code: '0',
  //     //   pi_id_name: '1453#Amrani Said#Amrani#Said#said_amrani@yahoo.com',
  //     //   project_description: 'sdf sdgfdsg sfgdf',
  //     //   project_name1: 'SA',
  //     //   project_name2: 'AAA',
  //     //   project_title: 'AAA54645674',
  //     //   sample_concentration: [],
  //     //   samples_number: '2',
  //     //   submit_code: [],
  //     //   tube_label: [] }
  //
  //     // 14	  ['run', 'Sequencing run date', 'MBL Supplied', 'YYYY-MM-DD'],
  //
  //     var all_field_names4     = [];
  //     // var all_field_names4_temp = CONSTS.ORDERED_METADATA_NAMES;
  //     var parameter            = CONSTS.ORDERED_METADATA_NAMES.slice(0, 1);
  //     var new_user_submit      = [['', 'New submit info', '', '']];
  //     var user_sample_name     = CONSTS.ORDERED_METADATA_NAMES.slice(17, 18);
  //     var dataset_description  = [['dataset_description', 'Dataset description', 'User Supplied', '']];
  //     var tube_label           = [['tube_label', 'Tube label', 'User Supplied', '']];
  //     var sample_concentration = [['sample_concentration', 'Sample concentration', 'User Supplied', 'ng/ul']];
  //     var dna_quantitation     = CONSTS.ORDERED_METADATA_NAMES.slice(35, 36);
  //     var env_package          = CONSTS.ORDERED_METADATA_NAMES.slice(16, 17);
  //
  //     var second_part_part_1 = CONSTS.ORDERED_METADATA_NAMES.slice(1, 16);
  //     var second_part_part_2 = CONSTS.ORDERED_METADATA_NAMES.slice(18, 35);
  //     var second_part_part_3 = CONSTS.ORDERED_METADATA_NAMES.slice(36);
  //
  //     // var general = CONSTS.ORDERED_METADATA_NAMES.slice(1,1);
  //     // var funding_code = [['funding_code', 'Funding Code', 'User Supplied', 'numeric only']];
  //     // var vamps_dataset_name = CONSTS.ORDERED_METADATA_NAMES.slice(2,2);
  //     // var second_part_part = CONSTS.ORDERED_METADATA_NAMES.slice(3,5);
  //     // var domain = CONSTS.ORDERED_METADATA_NAMES.slice(6,6);
  //     // var target_gene = CONSTS.ORDERED_METADATA_NAMES.slice(7,7);
  //     // var dna_region = CONSTS.ORDERED_METADATA_NAMES.slice(8,8);
  //
  //     //   submit_code: [],
  //
  //     // [['structured comment name','Parameter','',''],['','General','',''],['dataset','VAMPS dataset name','MBL Supplied','']
  //
  //     all_field_names4 = all_field_names4.concat(parameter);
  //     all_field_names4 = all_field_names4.concat(new_user_submit);
  //     all_field_names4 = all_field_names4.concat(user_sample_name);
  //     all_field_names4 = all_field_names4.concat(dataset_description);
  //     all_field_names4 = all_field_names4.concat(tube_label);
  //     all_field_names4 = all_field_names4.concat(sample_concentration);
  //     all_field_names4 = all_field_names4.concat(dna_quantitation);
  //     all_field_names4 = all_field_names4.concat(env_package);
  //     all_field_names4 = all_field_names4.concat(second_part_part_1);
  //     all_field_names4 = all_field_names4.concat(second_part_part_2);
  //     all_field_names4 = all_field_names4.concat(second_part_part_3);
  //
  //
  //     var all_metadata = met_obj.create_all_metadata_form_new(rows, req, res, all_field_names, project_obj);
  //     // all_metadata = { '485':
  //     //     { project: [ 'MS_AAA_EHSSU', 'MS_AAA_EHSSU', 'MS_AAA_EHSSU' ],
  //     //       dataset: ['', '', ''],
  //     //       sample_name: ['', '', ''],
  //     //       investigation_type: ['', '', ''],
  //     //       domain: ['', '', ''],
  //     //       first_name: [ 'Mohammadkarim', 'Mohammadkarim', 'Mohammadkarim' ],
  //     // module.exports.render_edit_form(req, res, all_metadata, all_field_names4);
  //
  //     var all_field_units = MD_CUSTOM_UNITS[pid];
  //
  //     const show_new = new new_metadata_controller.ShowObj(req, res, all_metadata, all_field_names4, all_field_units);
  //     show_new.render_edit_form();
  //   }
  // }

}

class ShowObj {

  constructor(req, res, all_metadata, all_field_names_arr, all_field_units) {
    this.res                     = res;
    this.all_metadata            = all_metadata;
    this.all_field_names_arr     = all_field_names_arr;
    this.all_field_units         = all_field_units;
    this.ordered_field_names_obj = this.make_ordered_field_names_obj();
    this.hostname                = req.CONFIG.hostname;
    this.user                    = req.user;
    // this.user                    = user || req.user.username;
    // this.hostname                = hostname || req.headers.host;
  }

  make_ordered_field_names_obj() {
    console.time('TIME: make_ordered_field_names_obj');
    var ordered_field_names_obj = {};

    for (var i in CONSTS.ORDERED_METADATA_NAMES) {
      // [ 'biomass_wet_weight', 'Biomass - wet weight', '', 'gram' ]
      var temp_arr = [i];
      temp_arr.push(CONSTS.ORDERED_METADATA_NAMES[i]);
      ordered_field_names_obj[CONSTS.ORDERED_METADATA_NAMES[i][0]] = temp_arr;
    }
    console.timeEnd('TIME: make_ordered_field_names_obj');
    return ordered_field_names_obj;
  }

  render_edit_form() {
    console.trace("Show me, I'm in render_edit_form");

    console.log('JJJ1 all_metadata from render_edit_form');
    console.log(JSON.stringify(this.all_metadata));

    console.log('JJJ2 all_field_names from render_edit_form');
    console.log(JSON.stringify(this.all_field_names_arr));

    this.res.render('metadata/metadata_edit_form', {
      title: 'VAMPS: Metadata_upload',
      user: this.user,
      hostname: this.hostname,
      all_metadata: this.all_metadata,
      all_field_names: this.all_field_names_arr,
      ordered_field_names_obj: this.ordered_field_names_obj,
      all_field_units: this.all_field_units,
      dividers: CONSTS.ORDERED_METADATA_DIVIDERS,
      dna_extraction_options: CONSTS.MY_DNA_EXTRACTION_METH_OPTIONS,
      dna_quantitation_options: CONSTS.DNA_QUANTITATION_OPTIONS,
      biome_primary_options: CONSTS.BIOME_PRIMARY,
      feature_primary_options: CONSTS.FEATURE_PRIMARY,
      material_primary_options: CONSTS.MATERIAL_PRIMARY,
      metadata_form_required_fields: CONSTS.METADATA_FORM_REQUIRED_FIELDS,
      env_package_options: CONSTS.DCO_ENVIRONMENTAL_PACKAGES,
      investigation_type_options: CONSTS.INVESTIGATION_TYPE,
      sample_type_options: CONSTS.SAMPLE_TYPE
    });
  }

  show_metadata_new_again(req, res) {
    //collect errors
    var myArray_fail = helpers.unique_array(req.form.errors);

    myArray_fail.sort();
    console.log('myArray_fail = ', myArray_fail);
    req.flash('fail', myArray_fail);

    // TODO: send to object creation in Imp
    var d_region_arr   = req.form.d_region.split('#');
    var pi_id_name_arr = req.form.pi_id_name.split('#');
    var full_name      = pi_id_name_arr[3] + ' ' + pi_id_name_arr[2];
    var project_name1  = req.form.project_name1;
    if (project_name1 === '') {
      project_name1 = this.get_inits(full_name.split(' '));
    }
    var project_name3 = d_region_arr[2];
    var project_name  = project_name1 + '_' + req.form.project_name2 + '_' + project_name3;

    res.render('metadata/metadata_new', {
      // TODO: object created separately in Imp.
      button_name: 'Validate',
      domain_regions: CONSTS.DOMAIN_REGIONS,
      hostname: req.CONFIG.hostname,
      pi_email: pi_id_name_arr[4],
      pi_list: req.session.pi_list,
      pi_name: full_name,
      project_name: project_name,
      project_title: req.form.project_title,
      samples_number: req.form.samples_number,
      title: 'VAMPS: New Metadata',
      user: req.user,
    });
  }

  get_inits(arr) {
    var inits_len     = arr.length;
    var project_name1 = '';
    for (var i = 0; i < inits_len; i++) {
      project_name1 = project_name1 + arr[i][0];
    }
    return project_name1;
  }

  make_new_project_for_form(rows, project_obj) {

    var all_field_names = this.all_field_names;

    // TODO: add
    //   funding_code: [ '0' ],
    //   sample_concentration: [],
    //   submit_code: [],
    //   tube_label:
    // d_region: 'Bacterial#v4v5#Bv4v5',
    //   dataset_description: [],
    //   dataset_name: [],
    //   funding_code: '0',
    //   pi_id_name: '1453#Amrani Said#Amrani#Said#said_amrani@yahoo.com',
    //   project_description: 'sdf sdgfdsg sfgdf',
    //   project_name1: 'SA',
    //   project_name2: 'AAA',
    //   project_title: 'AAA54645674',
    //   sample_concentration: [],
    //   samples_number: '2',
    //   submit_code: [],
    //   tube_label: [] }

    // 14	  ['run', 'Sequencing run date', 'MBL Supplied', 'YYYY-MM-DD'],

    var all_field_names4     = [];
    // var all_field_names4_temp = CONSTS.ORDERED_METADATA_NAMES;
    var parameter            = CONSTS.ORDERED_METADATA_NAMES.slice(0, 1);
    var new_user_submit      = [['', 'New submit info', '', '']];
    var user_sample_name     = CONSTS.ORDERED_METADATA_NAMES.slice(17, 18);
    var dataset_description  = [['dataset_description', 'Dataset description', 'User Supplied', '']];
    var tube_label           = [['tube_label', 'Tube label', 'User Supplied', '']];
    var sample_concentration = [['sample_concentration', 'Sample concentration', 'User Supplied', 'ng/ul']];
    var dna_quantitation     = CONSTS.ORDERED_METADATA_NAMES.slice(35, 36);
    var env_package          = CONSTS.ORDERED_METADATA_NAMES.slice(16, 17);

    var second_part_part_1 = CONSTS.ORDERED_METADATA_NAMES.slice(1, 16);
    var second_part_part_2 = CONSTS.ORDERED_METADATA_NAMES.slice(18, 35);
    var second_part_part_3 = CONSTS.ORDERED_METADATA_NAMES.slice(36);

    // var general = CONSTS.ORDERED_METADATA_NAMES.slice(1,1);
    // var funding_code = [['funding_code', 'Funding Code', 'User Supplied', 'numeric only']];
    // var vamps_dataset_name = CONSTS.ORDERED_METADATA_NAMES.slice(2,2);
    // var second_part_part = CONSTS.ORDERED_METADATA_NAMES.slice(3,5);
    // var domain = CONSTS.ORDERED_METADATA_NAMES.slice(6,6);
    // var target_gene = CONSTS.ORDERED_METADATA_NAMES.slice(7,7);
    // var dna_region = CONSTS.ORDERED_METADATA_NAMES.slice(8,8);

    //   submit_code: [],

    // [['structured comment name','Parameter','',''],['','General','',''],['dataset','VAMPS dataset name','MBL Supplied','']

    all_field_names4 = all_field_names4.concat(parameter);
    all_field_names4 = all_field_names4.concat(new_user_submit);
    all_field_names4 = all_field_names4.concat(user_sample_name);
    all_field_names4 = all_field_names4.concat(dataset_description);
    all_field_names4 = all_field_names4.concat(tube_label);
    all_field_names4 = all_field_names4.concat(sample_concentration);
    all_field_names4 = all_field_names4.concat(dna_quantitation);
    all_field_names4 = all_field_names4.concat(env_package);
    all_field_names4 = all_field_names4.concat(second_part_part_1);
    all_field_names4 = all_field_names4.concat(second_part_part_2);
    all_field_names4 = all_field_names4.concat(second_part_part_3);


    var all_metadata = this.create_all_metadata_form_new(rows, all_field_names, project_obj);
    // all_metadata = { '485':
    //     { project: [ 'MS_AAA_EHSSU', 'MS_AAA_EHSSU', 'MS_AAA_EHSSU' ],
    //       dataset: ['', '', ''],
    //       sample_name: ['', '', ''],
    //       investigation_type: ['', '', ''],
    //       domain: ['', '', ''],
    //       first_name: [ 'Mohammadkarim', 'Mohammadkarim', 'Mohammadkarim' ],
    // module.exports.render_edit_form(req, res, all_metadata, all_field_names4);

    var all_field_units = MD_CUSTOM_UNITS[project_obj.pid];

    var show_new = module.exports.ShowObj(this.req, this.res, all_metadata, all_field_names4, all_field_units);
    show_new.render_edit_form();
  }

}

// export the class
module.exports = {
  CreateDataObj: CreateDataObj,
  ShowObj: ShowObj
};

