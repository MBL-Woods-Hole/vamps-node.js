/*jslint node: true */
// "use strict" ;

var express = require('express');
var router = express.Router();
var passport = require('passport');
var helpers = require('./helpers/helpers');
var path = require('path');
var fs = require('fs-extra');
var queries = require('./queries');
var config = require('../config/config');
var mysql = require('mysql2');
var iniparser = require('iniparser');
var COMMON = require('./visuals/routes_common');
var Readable = require('readable-stream').Readable;
//var chokidar = require('chokidar');
var spawn = require('child_process').spawn;
//
//
//
// OLIGOTYPING
//

router.get('/livesearch_taxonomy/:q', helpers.isLoggedIn, function(req, res) {
  var q = req.params.q;
  if(q.length <= 2){
    var result = (hint === "") ? ("Too Short") : (hint);
    return
  }
  console.log('oligo in livesearch taxonomy-1');
  q = q.toLowerCase();
  var hint = '';
  var obj = new_taxonomy.taxa_tree_dict_map_by_rank;
  var taxon;
  
  if(q !== ''){
    for(var n in obj["family"]){
      taxon = obj["family"][n].taxon;
      t_lower = taxon.toLowerCase();
      if(t_lower != 'family_na' && t_lower.indexOf(q) != -1){
        hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','family');return false;\" >"+taxon + "</a> <small>(family)</small><br>";
      }
    }
    for(var n in obj["genus"]){
      taxon = obj["genus"][n].taxon;
      t_lower = taxon.toLowerCase();
      if(t_lower != 'genus_na' && t_lower.indexOf(q) != -1){
        hint += "<a href='' onclick=\"get_tax_str('"+taxon+"','genus');return false;\" >"+taxon + "</a> <small>(genus)</small><br>";
      }
    }
    var result = (hint === "") ? ("No Suggestions") : (hint);
  }
   //var result = (hint === "") ? ("No Suggestions") : (hint);
   res.send(result);
 });
//
// LIVESEARCH TAX
//
router.get('/livesearch_taxonomy/:rank/:taxon', helpers.isLoggedIn, function(req, res) {
  console.log('oligo in livesearch_taxonomy-2')
  var selected_taxon = req.params.taxon;
  var selected_rank = req.params.rank;
  var rank_number = req.CONSTS.RANKS.indexOf(selected_rank);
  console.log(req.params);
  var this_item = new_taxonomy.taxa_tree_dict_map_by_name_n_rank[selected_taxon+'_'+selected_rank];
  var tax_str = selected_taxon;

  var item = this_item;

  // goes up the tree to get taxon parents:
  while(item.parent_id !== 0){
    var item  = new_taxonomy.taxa_tree_dict_map_by_id[item.parent_id];
    var tax_str = item.taxon +';'+tax_str;
    //console.log(item);
  }

  //res.send(tax_str);
  this_item.full_string = tax_str;
  console.log('sending tax_str',this_item);
  res.json(this_item);

});
//
//  OLIGOTYPING-1 GET GENUS (FAMILY)
//
/* GET Import Choices page. */
router.post('/taxa_selection', helpers.isLoggedIn, function (req, res) {
  console.log('in routes_oligotyping.js /oligo_taxa_selection');
  console.log('req.body: oligo_taxa_selection-->>');
  console.log(req.body);
  console.log('req.body: <<--oligo_taxa_selection');

  var dataset_ids = JSON.parse(req.body.dataset_ids);
  //
  //
  req.session.chosen_id_order = dataset_ids
  //
  //
  console.log('dataset_ids '+dataset_ids);
  if (dataset_ids === undefined || dataset_ids.length === 0) {
      console.log('redirecting back -- no data selected');
      req.flash('fail', 'Select Some Datasets');
      res.redirect('/visuals/visuals_index');
     return;
  } else {
      // GLOBAL Variable
      var id_name_hash           = COMMON.create_chosen_id_name_order(dataset_ids);
      console.log('chosen_id_name_hash-->');
      //console.log(chosen_id_name_hash);
      console.log(id_name_hash.length);
      console.log('<--chosen_id_name_hash');

      res.render('oligotyping/oligotyping_taxa_selection', {
              title: 'VAMPS:Oligotyping',
              referer: 'oligotyping1',
              id_name_hash: JSON.stringify(id_name_hash),
             
              user: req.user, hostname: req.CONFIG.hostname
      });
  }
});
//
//
//
router.post('/project_list2', helpers.isLoggedIn, function (req, res) {
    console.log('in routes_oligotyping.js /project_list2');
    console.log('req.body: 1-oligo status-->>');
    console.log(req.body);
    console.log('req.body: <<--oligo status');
    //var tax_string = req.body.tax_string;
    var tax_obj = JSON.parse(req.body.tax_obj);
    var tax_string = req.body.tax_obj.full_string;
    var rank = tax_obj.rank
    console.log('tax_obj:')
    console.log(JSON.stringify(tax_obj, null, 4));
    console.log(req.session)
    var sql_dids = (req.session.chosen_id_order).join("','")
    
    q = "SELECT UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, project, dataset from sequence_pdr_info\n"
    q += " join sequence using (sequence_id)\n"
    q += " join silva_taxonomy_info_per_seq using(sequence_id)\n"
    q += " join silva_taxonomy using(silva_taxonomy_id)\n"
    q += " join dataset using (dataset_id)\n"
    q += " join project using (project_id)\n"
    q += " join family using(family_id)\n"
    if(tax_obj.rank == 'family'){
        q += " where family_id='"+tax_obj.db_id+"'\n"
    }else if(tax_obj.rank == 'genus'){
        q += " join genus using(genus_id)\n"
        q += " where genus_id='"+tax_obj.db_id+"'\n"
    }else{
        console.log('OLIGOTYPE error: no usable rank')
    }
    
    q += " and dataset_id in('"+sql_dids+"') \n"
    console.log('query',q);
    var dataset_lookup = {}
    var html='';
    var timestamp = +new Date();  // millisecs since the epoch!
    var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);

    var collection = connection.query(q, function (err, rows, fields) {
      if (err) {
          throw err;
      } else {
        if(rows.length == 0){
            //res.json({res:'ZERO'})
            req.flash('fail', 'No DATA');
            res.send(JSON.stringify({msg: 'No DATA Found'}))
        }else{
            
          
          var olig_dir = 'oligotyping-'+timestamp
          var data_repo_path = path.join(user_dir_path, olig_dir);
          var fasta_file = 'fasta.fa'
          var fasta_file_path = path.join(data_repo_path, fasta_file);
          var config_file = 'config.ini'
          var config_file_path = path.join(data_repo_path, config_file);
          var FASTA_SUCCESS_FILE    = path.join(data_repo_path,'COMPLETED-FASTA')
          console.log(config_file_path)
          fs.ensureDir(data_repo_path, function (err) {
            if(err){ return console.log(err) } // => null
            fs.chmod(data_repo_path, '0775', function chmodFile(err) {
                if(err){ return console.log(err) } // => null
                var wstream = fs.createWriteStream(fasta_file_path);
                var rs = new Readable();
                var seq_counter = 0
                var sum_seq_length = 0
                for (var i in rows) {
                  seq = rows[i].seq.toString();
                  seq_id = rows[i].sequence_id.toString();
                  seq_count = rows[i].seq_count
                  pjds = rows[i].project+'--'+rows[i].dataset;
                  dataset_lookup[pjds] = 1
                  for(i = 0; i<parseInt(seq_count); i++ ){
                    seq_counter += 1
                    var len = seq.length
                    //console.log('len',len)
                    sum_seq_length += len
                    var no = parseInt(i)+1
                    var sep = '__' // the oligotype script needs to know this
                    entry = '>'+pjds+sep+seq_id+'-'+no.toString()+"\n"+seq+"\n";
                    rs.push(entry);
                  }
                }

                rs.push(null);

                rs
                  .pipe(wstream)
                  .on('finish', function readableStreamOnFinish() {  // finished fasta
                    console.log('done  writing fa-file now write config:');
                    var cutoff = ((sum_seq_length / seq_counter) * 0.8).toFixed(0)

                    //console.log('sum_seq_length',sum_seq_length)
                    //console.log('seq_counter',seq_counter)
                    //console.log('cutoff',cutoff)

                    var config_text = '\n[MAIN]\npath='+data_repo_path+"\n";
                    config_text += 'directory='+olig_dir+"\n";
                    config_text += 'taxonomy='+tax_obj.full_string+"\n";
                    config_text += 'pynast_cutoff_length='+cutoff.toString()+"\n";
                    config_text += 'pynast_cutoff_meaning=80 Percent of Average Sequence Length'+"\n";
                    if(rank == 'family'){
                      config_text += 'rank=family'+"\n";
                      config_text += 'family='+tax_obj.taxon+"\n";
                    }else if(rank == 'genus'){
                      // need to find family
                      items = tax_obj.full_string.split(';')
                      family = items[4]
                      config_text += 'rank=genus'+"\n";
                      config_text += 'family='+family+"\n";
                      config_text += 'genus='+tax_obj.taxon+"\n";
                    }else{
                      config_text += 'rank=unknown'+"\n";
                    }
                    config_text += '\n[DATASETS]'+"\n";
                    for(pjds in dataset_lookup){
                      config_text += pjds+"\n";
                    }
                    fs.closeSync(fs.openSync(FASTA_SUCCESS_FILE, 'w'));
                    fs.writeFile(config_file_path, config_text, function writeConfigFile(err) {
                        if(err) { return console.log(err); }
                        console.log("The Config file was saved!");
                        
                        return
                        
                    })
                  });  // on
              }) // chmod
          })
          //res.send('OK')
          res.redirect('project_list')
          //res.send('OK')
        //return
          
        }
      }
      
    })

});
// router.post('/project_list', helpers.isLoggedIn, function (req, res) {
//     console.log('in routes_oligotyping.js /project_list');
//     console.log('req.body: 2-oligo status-->>');
//     console.log(req.body);
//     console.log('req.body: <<--oligo status');
//     var tax_string = req.body.tax_string;
//     var tax_obj = JSON.parse(req.body.tax_obj);
//     var rank = tax_obj.rank
//     console.log('tax_obj:')
//     console.log(JSON.stringify(tax_obj, null, 4));
// 
//     var sql_dids = (chosen_id_name_hash.ids).join("','")
//     q = "SELECT UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, project, dataset from sequence_pdr_info\n"
//     q += " join sequence using (sequence_id)\n"
//     q += " join silva_taxonomy_info_per_seq using(sequence_id)\n"
//     q += " join silva_taxonomy using(silva_taxonomy_id)\n"
//     q += " join dataset using (dataset_id)\n"
//     q += " join project using (project_id)\n"
//     q += " join family using(family_id)\n"
//     q += " where family_id='"+tax_obj.db_id+"'\n"
//     q += " and dataset_id in('"+sql_dids+"') \n"
//     console.log('query',q);
//     var dataset_lookup = {}
//     var html='';
//     var timestamp = +new Date();  // millisecs since the epoch!
// 
//     var collection = connection.query(q, function (err, rows, fields) {
//       if (err) {
//           throw err;
//       } else {
//         //console.log('rows',rows)
//         if(rows.length == 0){
//           tax_obj.msg = 'ERROR'
//           //res.json(tax_obj)
//           var msg = "NO Data Found"
//           req.flash('fail', msg)
//           //console.log(msg)
//           res.render('oligotyping/oligotyping_taxa_selection', {
//               title: 'VAMPS:Oligotyping',
//               referer: 'oligotyping',
//               id_name_hash: JSON.stringify(req.session.chosen_id_order),
//               
//               user: req.user, hostname: req.CONFIG.hostname
//           });
// 
//         }else{
//           //var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
//           //var pwd = req.CONFIG.PROCESS_DIR;
//           //var user_dir_path = path.join(pwd,'public','user_projects');
//           var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
//           var olig_dir = 'oligotyping-'+timestamp
//           var data_repo_path = path.join(user_dir_path, olig_dir);
//           var fasta_file = 'fasta.fa'
//           var fasta_file_path = path.join(data_repo_path, fasta_file);
//           var config_file = 'config.ini'
//           var config_file_path = path.join(data_repo_path, config_file);
//           var FASTA_SUCCESS_FILE    = path.join(data_repo_path,'COMPLETED-FASTA')
//           fs.ensureDir(data_repo_path, function (err) {
//             if(err){ return console.log(err) } // => null
//             fs.chmod(data_repo_path, '0775', function chmodFile(err) {
//                 if(err){ return console.log(err) } // => null
//                 var wstream = fs.createWriteStream(fasta_file_path);
//                 var rs = new Readable();
//                 var seq_counter = 0
//                 var sum_seq_length = 0
//                 for (var i in rows) {
//                   seq = rows[i].seq.toString();
//                   seq_id = rows[i].sequence_id.toString();
//                   seq_count = rows[i].seq_count
//                   pjds = rows[i].project+'--'+rows[i].dataset;
//                   dataset_lookup[pjds] = 1
//                   for(i = 0; i<parseInt(seq_count); i++ ){
//                     seq_counter += 1
//                     var len = seq.length
//                     //console.log('len',len)
//                     sum_seq_length += len
//                     var no = parseInt(i)+1
//                     var sep = '__' // the oligotype script needs to know this
//                     entry = '>'+pjds+sep+seq_id+'-'+no.toString()+"\n"+seq+"\n";
//                     rs.push(entry);
//                   }
//                 }
// 
//                 rs.push(null);
// 
//                 rs
//                   .pipe(wstream)
//                   .on('finish', function readableStreamOnFinish() {  // finished fasta
//                     console.log('done  writing fa-file now write config:');
//                     var cutoff = ((sum_seq_length / seq_counter) * 0.8).toFixed(0)
// 
//                     //console.log('sum_seq_length',sum_seq_length)
//                     //console.log('seq_counter',seq_counter)
//                     //console.log('cutoff',cutoff)
// 
//                     var config_text = '\n[MAIN]\npath='+data_repo_path+"\n";
//                     config_text += 'directory='+olig_dir+"\n";
//                     config_text += 'taxonomy='+tax_obj.full_string+"\n";
//                     config_text += 'pynast_cutoff_length='+cutoff.toString()+"\n";
//                     config_text += 'pynast_cutoff_meaning=80 Percent of Average Sequence Length'+"\n";
//                     if(rank == 'family'){
//                       config_text += 'rank=family'+"\n";
//                       config_text += 'family='+tax_obj.taxon+"\n";
//                     }else if(rank == 'genus'){
//                       // need to find family
//                       items = tax_obj.full_string.split(';')
//                       family = items[4]
//                       config_text += 'rank=genus'+"\n";
//                       config_text += 'family='+family+"\n";
//                       config_text += 'genus='+tax_obj.taxon+"\n";
//                     }else{
//                       config_text += 'rank=unknown'+"\n";
//                     }
//                     config_text += '\n[DATASETS]'+"\n";
//                     for(pjds in dataset_lookup){
//                       config_text += pjds+"\n";
//                     }
//                     fs.closeSync(fs.openSync(FASTA_SUCCESS_FILE, 'w'));
//                     fs.writeFile(config_file_path, config_text, function writeConfigFile(err) {
//                         if(err) { return console.log(err); }
//                         console.log("The Config file was saved!");
//                     })
//                   });  // on
//               }) // chmod
//           })
//           res.redirect('project_list')
// 
//         }
//       }
//     });
//     console.log('Done with fasta step')
// });
//
//
//
//
// YOUR OLIGO PROJECTS
//
router.get('/project_list', helpers.isLoggedIn, function (req, res) {
    //console.log(PROJECT_INFORMATION_BY_PNAME);
    console.log('GET in oligo : project_list')
    //var pwd = req.CONFIG.PROCESS_DIR;
    var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
    //var user_dir_path = path.join(pwd,','user_projects');

console.log('user_dir_path '+user_dir_path)
    var project_info = {};
    var file_info = [];
     fs.readdir(user_dir_path, function readProjectsDir(err, items) {
            if (err) { return console.log(err); }
            project_info = {}
            for (var d in items) {
                var pts = items[d].split('-');
                if (pts[0] === 'oligotyping') {
                  console.log('got dir', items[d])
                    var oligo_code = pts[1];
                    project_info[oligo_code] = {};
                    var stat = fs.statSync(path.join(user_dir_path, items[d]));
                    if (stat.isDirectory()) {
                        // stat.mtime.getTime() is for sorting to list in oreder

                        // need to read config file
                        // check status?? dir strcture: analisis/gast/<ds>
                        var data_repo_path = path.join(user_dir_path, items[d]);
                        var config_file = path.join(data_repo_path, 'config.ini');

                        project_info[oligo_code].fasta_status   = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-FASTA')) ? 'COMPLETED' : ''
                        project_info[oligo_code].entropy_status = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-ENTROPY')) ? 'COMPLETED' : ''
                        project_info[oligo_code].oligo_status   = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-OLIGO')) ? 'COMPLETED' : ''
                        try{
                            var config = iniparser.parseSync(config_file);

                            file_info.push({ 'oligo_code':oligo_code, 'time':stat.mtime});

                            project_info[oligo_code].family = config['MAIN']['family'];
                            if(config['MAIN'].hasOwnProperty('genus')){
                              project_info[oligo_code].genus = config['MAIN']['genus'];
                            }else{
                              project_info[oligo_code].genus = 'none';
                            }
                            project_info[oligo_code].taxonomy = config['MAIN']['taxonomy'];
                            project_info[oligo_code].rank = config['MAIN']['rank'];
                            project_info[oligo_code].start_date = stat.mtime.toISOString().substring(0,10);
                            project_info[oligo_code].directory = items[d];
                            project_info[oligo_code].cutoff = config['MAIN']['pynast_cutoff_length'];
                           
                        }
                        catch(e){
                          console.log('Config file ERROR',data_repo_path)                     
                        }

                    }

                  }
            }
            file_info.sort(function sortByTime(a, b) {
              //reverse sort: recent-->oldest
              return helpers.compareStrings_int(b.time.getTime(), a.time.getTime());
            });
            //console.log(project_info)
            //console.log(file_info)            
            res.render('oligotyping/oligotyping_project_list',
                { title: 'User Projects',
                  pinfo: JSON.stringify(project_info),
                  finfo: JSON.stringify(file_info),
                  //env_sources :   JSON.stringify(req.CONSTS.ENV_SOURCE),
                                    
                  user: req.user, hostname: req.CONFIG.hostname
            });

    });  // readdir

});
//
// POST PROJECT
//
router.get('/project/:code', helpers.isLoggedIn, function (req, res) {
  console.log('in oligo - project')
  var oligo_code = req.params.code
  console.log(oligo_code)
  //var pwd = req.CONFIG.PROCESS_DIR;
  //var user_dir_path = path.join(pwd,'public','user_projects');
  var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
  var real_html_path = path.join(req.CONFIG.PROCESS_DIR,'public','user_projects') //,req.user.username+'_'+olig_dir+'_'+rando.toString())
  var olig_dir = 'oligotyping-'+oligo_code
  var data_repo_path = path.join(user_dir_path, olig_dir);
  var config_file = path.join(data_repo_path, 'config.ini');
  var config = iniparser.parseSync(config_file);
  rank = config['MAIN']['rank'];

  fasta_status   = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-FASTA')) ? 'COMPLETED' : ''
  entropy_status = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-ENTROPY')) ? 'COMPLETED' : ''
  oligo_status   = helpers.fileExists(path.join(data_repo_path, 'COMPLETED-OLIGO')) ? 'COMPLETED' : ''
  var html_link_path = path.join(data_repo_path, 'html_link.txt');
  var current_html_link = ''
  
  if(fs.existsSync(html_link_path) && oligo_status == 'COMPLETED'){
    current_html_link = String(fs.readFileSync(html_link_path))
    console.log('current_html_link')
    console.log(current_html_link)
  }else{
    console.log('no current_html_link')
  }
  
  console.log(config)
  console.log(fasta_status,' - ',entropy_status,' - ',oligo_status)
  var link_path
  var processed_oligo_runs = []
  fs.readdir(real_html_path, (err, files) => {
    files.forEach(file => {
        if(file.includes(olig_dir)){
            link_path = path.join('/user_projects',file,'index.html')
            console.log('FOUND '+link_path)
            processed_oligo_runs.push({"name":file,"link":link_path})
        }
        
        
    });
    
  
  res.render('oligotyping/oligotyping_project',
                { title: 'Oligotype Project',

                  code : oligo_code,
                  fasta_status   : fasta_status,
                  entropy_status : entropy_status,
                  oligo_status   : oligo_status,
                  html_link      : current_html_link,
                  runs           : JSON.stringify(processed_oligo_runs),
                  directory : config['MAIN']['directory'],
                  path :      config['MAIN']['path'],
                  rank :      config['MAIN']['rank'],
                  family :    config['MAIN']['family'],
                  genus :     config['MAIN']['genus'],
                  cutoff :    config['MAIN']['pynast_cutoff_length'],
                 
                  user: req.user, hostname: req.CONFIG.hostname
  });

  })  // end readdir



});
//
//
// POST ENTROPY
//
router.post('/entropy/:code', helpers.isLoggedIn, function (req, res) {
  console.log('in oligo - entropy-->>')
  console.log(req.body);
  console.log('<<--in oligo - entropy')
  var oligo_code = req.params.code
  var family = req.body.family
  var genus = req.body.genus // may be 'none'
  // { directory: 'oligotyping-1474030905992',
  // fasta_status: 'COMPLETE',
  // entropy_status: 'unknown',
  // oligo1_status: 'unknown',
  // oligo2_status: 'unknown',
  // code: '1474030905992',
  // rank: 'family' }
  // create shell script in dir:
  //var pwd = req.CONFIG.PROCESS_DIR;
  //var user_dir_path = path.join(pwd,'public','user_projects');
  var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
  var olig_dir = 'oligotyping-'+oligo_code
  var data_repo_path = path.join(user_dir_path, olig_dir);
  var config_file = path.join(data_repo_path, 'config.ini');
  var alignmentlog   = path.join(data_repo_path, 'alignment.log');
  var pynastlog   = path.join(data_repo_path, 'pynast.log');
  var entropy_log   = path.join(data_repo_path, 'entropy.log');
  var tmpl_file = path.join(data_repo_path, 'TEMPLATE.tmpl');
  var fasta_file = path.join(data_repo_path, 'fasta.fa');
  var aligned_file = path.join(data_repo_path, 'pynast_aligned.fa');
  var min_align_fasta_file = path.join(data_repo_path, 'minaligned.fa');

  var cutoff = req.body.cutoff
  if(genus == '' || genus == 'none'){
    g = ''
  }else{
    g = '-g '+ genus
  }


  var cmd_options1 = {
      exec : 'create_GG_alignment_template_from_taxon.py',
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ '-f', family,
                      g,
                      path.join(req.CONFIG.PATH_TO_SCRIPTS,'oligotyping','vamps_scripts','otu_id_to_greengenes.txt'),
                      path.join(req.CONFIG.PATH_TO_SCRIPTS,'oligotyping','vamps_scripts','gg_97_otus_6oct2010_aligned.fasta.txt'),
                      '-o', tmpl_file,
                      '>', alignmentlog
                    ],
  };

  var cmd_options2 = {
      exec: 'pynast',
      scriptPath : path.join(req.CONFIG.PATH_TO_PYNAST,'bin'),
      //scriptPath : '',
      args :       [ '-t', tmpl_file,
                      '-i', fasta_file,
                      '-a', aligned_file,
                      '-l', cutoff,
                      '>', pynastlog
                    ],
  };
  var cmd_options3 = {
      exec : 'minalign',
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ aligned_file, '>', min_align_fasta_file],
  };
  var cmd_options4 = {
      //exec : 'entropy_analysis',
      //scriptPath : req.CONFIG.PATH_TO_NODE_SCRIPTS,

      exec : 'entropy-analysis',
      scriptPath : path.join(req.CONFIG.PATH_TO_SCRIPTS,'oligotyping','bin'),


      args :       [ min_align_fasta_file,
                      '--no-display',
                      '>', entropy_log
                    ],
  };
  var cmd_list = []
  lst = [cmd_options1, cmd_options2, cmd_options3, cmd_options4]
  for(n in lst){
    cmd_list.push(path.join(lst[n].scriptPath, lst[n].exec) + ' ' + lst[n].args.join(' '))
  }


  var script_text = helpers.get_local_script_text(cmd_list);

  var script_file = 'entropy_script.sh'
  var script_file_path = path.join(data_repo_path, script_file);
  console.log(script_text)
  fs.writeFile(script_file_path, script_text, function writeEntropyScript(err){
      if(err){ return console.log(err) }
      fs.chmod(script_file_path, '0775', function chmodFile(err) {
          if (err) { return console.log(err);}
            var entropy_process = spawn( script_file_path, {}, {
                               env:{ 'PATH':req.CONFIG.PATH2_7, 'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH },
                               detached: true,
                               stdio:['pipe', 'pipe', 'pipe']
                                 //stdio: [ 'ignore', null, log ]
            });  // stdin, stdout, stderr1

            entropy_process.stdout.on('data', function entropyProcessStdout(data) {
            //console.log('Processing data');
            // data = data.toString().replace(/^\s+|\s+$/g, '');
                  data = data.toString().trim();
                  console.log('STDOUT:',data)
            });
            entropy_process.stderr.on('data', function entropyProcessStderr(data) {
            //console.log('Processing data');
            // data = data.toString().replace(/^\s+|\s+$/g, '');
                  data = data.toString().trim();
                  console.log('STDERR:',data)

            });
            entropy_process.on('close', function entropyProcessOnClose(close_code) {

              console.log('Finished Entropy Process Script')
              // check for files:
              //minaligned.fa-ENTROPY and minaligned.fa-ENTROPY.pdf
              // if present then update config file

              var minaligned_file = path.join(data_repo_path,'minaligned.fa-ENTROPY')
              var pdf_file            = path.join(data_repo_path,'minaligned.fa-ENTROPY.pdf')
              var new_pdf_file        = path.join(data_repo_path,'minaligned.fa-ENTROPY.pdf')
              //var new_pdf_file = path.join(pwd,'tmp',req.user.username+'_'+oligo_code+'_minaligned.fa-ENTROPY.pdf');
              var ENTROPY_SUCCESS_FILE    = path.join(data_repo_path,'COMPLETED-ENTROPY')
              fs.stat(minaligned_file, function checkFilePresence(err,stats){
                if(err){return console.log(err) }
                if (stats.isFile()) {
                  fs.stat(pdf_file, function checkFilePresence(err,stats){
                    if(err){ return console.log(err) }
                    //fs.copy(pdf_file, new_pdf_file, {}, function(err){
                      //if(err){return console.log(err) }
                      console.log('COPIED')
                      if (stats.isFile()) {
                        status = 'entropy_status=COMPLETE\n'
                      }else{
                        status = 'entropy_status=FAIL\n'
                      }
                      //fs.appendFile(config_file, status, function (err) {if(err){return console.log(err) } });
                      fs.closeSync(fs.openSync(ENTROPY_SUCCESS_FILE, 'w'));
                      res.redirect('/oligotyping/project/'+oligo_code)
                      return
                    //})
                  })
                }else{
                  status = 'entropy_status=FAIL\n'
                  //fs.appendFile(config_file, status, function (err) {if(err){return console.log(err) } });
                }
              })

            });
      });

  });


});
//
//
//

router.post('/view_pdf', function(req, res, next) {
  console.log('in oligo - view_pdf-->>')
  console.log(req.body);
  console.log('<<--in oligo - view_pdf')
  var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
  var olig_dir = 'oligotyping-'+req.body.oligo_code
  var data_repo_path = path.join(user_dir_path, olig_dir);
  var pdf_file_path = path.join(data_repo_path,'minaligned.fa-ENTROPY.pdf')
  console.log(pdf_file_path)
  //var stream = fs.readStream(pdf_file);
  // var rs = new Readable();
  // var stream = fs.createReadStream(pdf_file_path, 'binary');
//   var data = fs.readFileSync(pdf_file_path);
  //var filename = "minaligned.fa-ENTROPY.pdf"; 
  //res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
  //res.setHeader('Content-type', 'application/pdf');
  //var link = '/user_projects/'+req.user.username+'_oligotyping-'+oligo_code+'_'+'/index.html'
  //var html = "** <a href='"+pdf_file_path+"' target='_blank'>Open PDF</a> **"
   //console.log(link)
   //console.log(html)
   //stream.pipe(res);
   //res.send(pdf_file_path);
   fs.readFile(pdf_file_path, function (err,data){
        res.contentType("application/pdf");
        res.send(data);
    });
   
//res.contentType("application/pdf");
//res.end(data);
  //res.send()
})
//
//
//
router.post('/open_html', function(req, res, next) {
    console.log('in oligo - open_html-->>')
    console.log(req.body);
    console.log('<<--in oligo - open_html')
    
    //var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
    //var olig_dir = 'oligotyping-'+req.body.oligo_code
    //var data_repo_path = path.join(user_dir_path, olig_dir);
   
    //var html = path.join(data_repo_path,'OLIGOTYPING','HTML-OUTPUT','index.html')
    var html = path.join('tmp','avoorhis_oligo_1538593525362','index.html')
    console.log(html)
    window.open(html,'_blank')
    
    
})
//
//
//
router.post('/oligo/:code', helpers.isLoggedIn, function (req, res) {
  console.log('in oligo - oligo-->>')
  console.log(req.body);
  console.log(req.params);
  console.log('<<--in oligo - oligo')

  var oligo_code = req.params.code
  var family = req.body.family
  var genus = req.body.genus // may be 'none'
  var MIN_PERCENT_ABUNDANCE = req.body.MIN_PERCENT_ABUNDANCE
  var MIN_ACTUAL_ABUNDANCE = req.body.MIN_ACTUAL_ABUNDANCE
  var MIN_SUBSTANTIVE_ABUNDANCE = req.body.MIN_SUBSTANTIVE_ABUNDANCE
  var MIN_NUMBER_OF_SAMPLES = req.body.MIN_NUMBER_OF_SAMPLES
  if(req.body.hasOwnProperty('SELECTED_COMPONENTS')){
    var SELECTED_COMPONENTS = req.body.SELECTED_COMPONENTS
    var appendC = ['-C',SELECTED_COMPONENTS]
  }else if(req.body.hasOwnProperty('NUMBER_OF_AUTO_COMPONENTS')){
    var NUMBER_OF_AUTO_COMPONENTS = req.body.NUMBER_OF_AUTO_COMPONENTS
    var appendC = ['-c',NUMBER_OF_AUTO_COMPONENTS]
  }else{
    console.log('oligotype ERROR -c/-C')
    return
  }

  //var pwd = req.CONFIG.PROCESS_DIR;
  //var user_dir_path = path.join(pwd,'public','user_projects');
  var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
  var olig_dir = 'oligotyping-'+oligo_code
  var data_repo_path = path.join(user_dir_path, olig_dir);
  var config_file = path.join(data_repo_path, 'config.ini');
  var scriptlog = path.join(data_repo_path, 'oligotype_shell_script.log');
  var oligolog = path.join(data_repo_path, 'oligo.log');
  //var tmpl_file = path.join(data_repository, 'TEMPLATE.tmpl');
  //var fasta_file = path.join(data_repository, 'fasta.fa');
  //var aligned_file = path.join(data_repository, 'pynast_aligned.fa');
  var min_align_fasta_file = path.join(data_repo_path, 'minaligned.fa');
  var entropy_file = path.join(data_repo_path, 'minaligned.fa-ENTROPY');
  //var entropy_log   = path.join(data_repository, 'entropy.log');

  //var out_dir  = req.user.username+'_OLIGOTYPING_'+oligo_code
  //var out_oligotype_path  = path.join(pwd,'public','oligotyping','projects', out_dir);

  var out_dir  = 'OLIGOTYPE'
  var out_oligotype_path  = path.join(data_repo_path, out_dir);

  //var page_title = '"('+family+')-'+req.body.directory+'"'
  var page_title = '"'+req.user.username+' run code: '+oligo_code+'"'
  //var cutoff = req.body.cutoff
  if(genus != 'none'){
    g = '-g '+ genus
  }else{
    g = ''
  }
  var cmd_options = {
      //exec : 'oligotype_start',
      //scriptPath : req.CONFIG.PATH_TO_NODE_SCRIPTS,
      exec : 'oligotype',
      scriptPath : path.join(req.CONFIG.PATH_TO_SCRIPTS,'oligotyping','bin'),
      args :       [ min_align_fasta_file, entropy_file,
                    '--skip-check-input-file',
                    '-o', out_oligotype_path,
                    '-A', MIN_ACTUAL_ABUNDANCE,
                    '-M', MIN_SUBSTANTIVE_ABUNDANCE,
                    '-a', MIN_PERCENT_ABUNDANCE,
                    '-s', MIN_NUMBER_OF_SAMPLES,
                    '-t', '__',
                    '--project', page_title,
                    '>',oligolog
                    ]
  };
  cmd_options.args = cmd_options.args.concat(appendC)
  var cmd_list = []
  lst = [cmd_options]
  for(n in lst){
    cmd_list.push(path.join(lst[n].scriptPath, lst[n].exec) + ' ' + lst[n].args.join(' '))
  }


  var script_text = helpers.get_local_script_text( cmd_list);
  var script_file = 'oligo_script.sh'
  var script_file_path = path.join(data_repo_path, script_file);
  console.log(script_text)
  fs.writeFile(script_file_path, script_text, function writeOligoScript(err){
      if(err){ return console.log(err) }
      fs.chmod(script_file_path, '0775', function chmodFile(err) {
          if (err) { return console.log(err);}
            var oligo_process = spawn( script_file_path, {}, {
                               env:{ 'PATH':req.CONFIG.PATH, 'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH },
                               detached: true,
                               stdio:['pipe', 'pipe', 'pipe']
                                 //stdio: [ 'ignore', null, log ]
            });  // stdin, stdout, stderr1

            oligo_process.stdout.on('data', function entropyProcessStdout(data) {
            //console.log('Processing data');
            // data = data.toString().replace(/^\s+|\s+$/g, '');
                  data = data.toString().trim();

            });
            oligo_process.stderr.on('data', function entropyProcessStderr(data) {
            //console.log('Processing data');
            // data = data.toString().replace(/^\s+|\s+$/g, '');
                  data = data.toString().trim();
                  console.log(data)

            });
            oligo_process.on('close', function entropyProcessOnClose(close_code) {

              console.log('Finished Oligotype Process Script')
              // check for files:
              //minaligned.fa-ENTROPY and minaligned.fa-ENTROPY.pdf
              // if present then update config file

              //var minaligned_file = path.join(data_repository,'minaligned.fa-ENTROPY')
              //var pdf_file        = path.join(data_repository,'minaligned.fa-ENTROPY.pdf')
              var OLIGO_SUCCESS_FILE    = path.join(data_repo_path,'COMPLETED-OLIGO')
              var html_dir = path.join(out_oligotype_path,'HTML-OUTPUT')
              //var destination = path.join(req.CONFIG.PROCESS_DIR,'tmp',req.user.username+'_'+olig_dir)
              var rando = helpers.getRandomInt(10000,99999)
              var destination = path.join(req.CONFIG.PROCESS_DIR,'public','user_projects',req.user.username+'_'+olig_dir+'_'+rando.toString())
              
              fs.stat(html_dir, function checkDirPresence(err, stats){
                if(err){
                    status = 'oligo_status=FAIL\n'
                    console.log('FAIL fs.stat no html_dir')
                    //fs.appendFile(config_file, status, function (err) {if(err){return console.log(err) } });
                    res.send('ERROR - HTML-OUTPUT not found:<br>Most likely because no remaining oligotypes.<br>Try changing tags (-a,-A,-M or -s)');
                }else if (stats.isDirectory()) {
                    status = 'oligo_status=COMPLETE\n'
                    console.log('SUCCESS fs.stat html_dir found')
                    //fs.appendFile(config_file, status, function (err) {if(err){return console.log(err) } });
                    fs.closeSync(fs.openSync(OLIGO_SUCCESS_FILE, 'w'));
                    var ncp = require('ncp').ncp;
                    var chmodr = require('chmodr');
                    ncp(html_dir, destination, function (err) {
                       if (err) {   return console.error(err);  }
                       console.log('redirecting back to project page')
                       chmodr(destination, 0o777, (err) => {
                        if (err) {
                            console.log('Failed to execute chmodr', err);
                        } else {
                            console.log('Success');
                        }
                       });
                       //var link = "/oligotyping/projects/"+req.user.username+"_OLIGOTYPING_"+oligo_code+"/HTML-OUTPUT/index.html?rando="+rando.toString()
                       var link = '/user_projects/'+req.user.username+'_oligotyping-'+oligo_code+'_'+rando.toString()+'/index.html'
                       var html_link_file = path.join(data_repo_path, 'html_link.txt');
                       fs.writeFileSync(html_link_file, link)
                       //var html = "** <a href='"+link+"' target='_blank'>Open HTML</a> **"
                       console.log({"link":link,"rando":rando.toString()})
                      
                       res.json({"link":link,"rando":rando.toString()});
                       //res.redirect('/oligotyping/project/'+oligo_code)
                    });
                    // var rando = helpers.getRandomInt(10000,99999)
                    // var link = "/oligotyping/projects/"+req.user.username+"_OLIGOTYPING_"+oligo_code+"/HTML-OUTPUT/index.html?rando="+rando.toString()
                    // var html = "** <a href='"+link+"' target='_blank'>Open HTML</a> **"
                    // console.log(html)
                    // res.send(html);
                }else{
                  status = 'oligo_status=FAIL\n'
                  //fs.appendFile(config_file, status, function (err) {if(err){return console.log(err) } });
                  res.send('ERROR - unknown error');
                }


              })

            });
      });

  });


});
//
//
//
router.get('/rewind/:code/:level', helpers.isLoggedIn, function (req, res) {
  console.log('in oligo - rewind')
  var oligo_code = req.params.code
  var level = req.params.level

  var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
  var olig_dir = 'oligotyping-'+oligo_code
  var data_repo_path = path.join(user_dir_path, olig_dir);

  console.log(oligo_code)
  console.log(level)
  var file1_path = path.join(data_repo_path, 'COMPLETED-FASTA');
  var file2_path = path.join(data_repo_path, 'COMPLETED-ENTROPY');
  var file3_path = path.join(data_repo_path, 'COMPLETED-OLIGO');
  if(level == 'fasta'){
      try{
        fs.unlinkSync(file1_path);
      }
      catch(e){console.log(e)}
      try{
        fs.unlinkSync(file2_path);
      }
      catch(e){console.log(e)}
      try{
        fs.unlinkSync(file3_path);
      }
      catch(e){console.log(e)}
  }else if(level == 'entropy'){
      try{
        fs.unlinkSync(file2_path);
      }
      catch(e){console.log(e)}
      try{
        fs.unlinkSync(file3_path);
      }
      catch(e){console.log(e)}
  }else if(level == 'oligo'){
      try{
        fs.unlinkSync(file3_path);
      }
      catch(e){console.log(e)}

      var out_oligotype_path  = path.join(data_repo_path,'OLIGOTYPE');
      helpers.deleteFolderRecursive(out_oligotype_path)
  }
  res.redirect('/oligotyping/project/'+oligo_code)

})
//
//
//
router.get('/delete/:code', helpers.isLoggedIn, function (req, res) {
  console.log('in oligotyping delete')
  var oligo_code = req.params.code
  console.log('code: '+oligo_code)
  var user_dir_path = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
  var olig_dir = 'oligotyping-'+oligo_code
  var data_repo_path1 = path.join(user_dir_path, olig_dir);
  // path.join(req.CONFIG.PROCESS_DIR,'public','user_projects',req.user.username+'_'+olig_dir+'_'+rando.toString())
  
  console.log('path: '+data_repo_path1)
  helpers.deleteFolderRecursive(data_repo_path1)
  
  
  //var data_repo_path2 = path.join(req.CONFIG.PROCESS_DIR,'public','user_projects',req.user.username+'_'+olig_dir)
  var data_repo_path2 = path.join(req.CONFIG.PROCESS_DIR,'public','user_projects')
  fs.readdirSync(data_repo_path2).forEach(function(dir,index){
        if(dir.includes(olig_dir)){
            var curPath = data_repo_path2 + "/" + dir;
            helpers.deleteFolderRecursive(curPath)
        }
        
  });
  console.log('done')
  //res.send('OK')
  //res.send('done')
  res.redirect('/oligotyping/project_list')
  
});

//
//
//
module.exports = router;
