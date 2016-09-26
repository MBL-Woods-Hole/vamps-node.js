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
//var USER_DATA  = require('./routes_user_data');
//
// 
//
//
//
//
// OLIGOTYPING
//

router.get('/livesearch_taxonomy/:q', helpers.isLoggedIn, function(req, res) {
  //console.log('params>>');
  //console.log(req.params);
  //console.log('<<params');
  console.log('oligo in livesearch taxonomy');
  var q = req.params.q.toLowerCase();
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
  }
   var result = (hint === "") ? ("No Suggestions") : (hint);
   res.send(result);
 });
//
// LIVESEARCH TAX  
//
router.get('/livesearch_taxonomy/:rank/:taxon', helpers.isLoggedIn, function(req, res) {
  console.log('oligo livesearch_taxonomy')
  var selected_taxon = req.params.taxon;
  var selected_rank = req.params.rank;
  var rank_number = req.CONSTS.RANKS.indexOf(selected_rank);
  console.log(req.params);
  var this_item = new_taxonomy.taxa_tree_dict_map_by_name_n_rank[selected_taxon+'_'+selected_rank];
  var tax_str = selected_taxon;

  var item = this_item;
  
  // goes up the tree to get taxon parents:
  while(item.parent_id !== 0){
    item  = new_taxonomy.taxa_tree_dict_map_by_id[item.parent_id];
    tax_str = item.taxon +';'+tax_str;
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


  //if (req.body.retain_data === '1') {
    dataset_ids = JSON.parse(req.body.dataset_ids);
  //} else {
    //dataset_ids = req.body.dataset_ids;
  //}
  console.log('dataset_ids '+dataset_ids);
  if (dataset_ids === undefined || dataset_ids.length === 0) {
      console.log('redirecting back -- no data selected');
      req.flash('nodataMessage', 'Select Some Datasets');
      res.redirect('/visuals/visuals_index');
     return;
  } else {
      // GLOBAL Variable
      chosen_id_name_hash           = COMMON.create_chosen_id_name_hash(dataset_ids);
      console.log('chosen_id_name_hash-->');
      console.log(chosen_id_name_hash);
      console.log(chosen_id_name_hash.ids.length);
      console.log('<--chosen_id_name_hash');

      res.render('oligotyping/oligotyping_taxa_selection', {
              title: 'VAMPS:Oligotyping',
              referer: 'oligotyping1',
              //constants: JSON.stringify(req.CONSTS),
              chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
              //selected_rank:'phylum', // initial condition
              //selected_domains:JSON.stringify(req.CONSTS.DOMAINS.domains), // initial condition
              message: '',
              //failmessage: req.flash('failMessage'),
              user: req.user, hostname: req.CONFIG.hostname
      });
  }
});
router.post('/project_list', helpers.isLoggedIn, function (req, res) {
    console.log('in routes_oligotyping.js /status');
    console.log('req.body: oligo status-->>');
    console.log(req.body);
    console.log('req.body: <<--oligo status');
    var tax_string = req.body.tax_string;
    var tax_obj = JSON.parse(req.body.tax_obj);
    var rank = tax_obj.rank
    console.log('tax_obj:')
    console.log(JSON.stringify(tax_obj, null, 4));

    var sql_dids = (chosen_id_name_hash.ids).join("','")
    q = "SELECT UNCOMPRESS(sequence_comp) as seq, sequence_id, seq_count, project, dataset from sequence_pdr_info\n" 
    q += " join sequence using (sequence_id)\n"
    q += " join silva_taxonomy_info_per_seq using(sequence_id)\n"
    q += " join silva_taxonomy using(silva_taxonomy_id)\n"
    q += " join dataset using (dataset_id)\n"
    q += " join project using (project_id)\n"
    // if(genus) // add genus code
    q += " join family using(family_id)\n"
    q += " where family_id='"+tax_obj.db_id+"'\n"
    
    q += " and dataset_id in('"+sql_dids+"') \n"
    console.log('query',q);
    var dataset_lookup = {}
    var html='';
    var timestamp = +new Date();  // millisecs since the epoch!

    var collection = connection.query(q, function (err, rows, fields) {
      if (err) {
          throw err;
      } else {
        //console.log('rows',rows)
        if(rows.length == 0){
          tax_obj.msg = 'ERROR'
          //res.json(tax_obj)
          var msg = "NO Data Found"
          req.flash('Message', msg)
          //console.log(msg)
          res.render('oligotyping/oligotyping_taxa_selection', {
              title: 'VAMPS:Oligotyping',
              referer: 'oligotyping',
              chosen_id_name_hash: JSON.stringify(chosen_id_name_hash),
              message: req.flash('Message'),
              user: req.user, hostname: req.CONFIG.hostname
          });
          
        }else{
          var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
          var olig_dir = 'oligotyping-'+timestamp
          var data_repository = path.join(user_dir, olig_dir);
          var fasta_file = 'fasta.fa'
          var fasta_file_path = path.join(data_repository, fasta_file);
          var config_file = 'config.ini'
          var config_file_path = path.join(data_repository, config_file);
          var FASTA_SUCCESS_FILE    = path.join(data_repository,'COMPLETED-FASTA')
          fs.ensureDir(data_repository, function (err) {
            if(err){ return console.log(err) } // => null
            fs.chmod(data_repository, '0775', function chmodFile(err) {
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
                    
                    var config_text = '\n[MAIN]\npath='+data_repository+"\n";
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
                    })
                  });
              })
          })
          res.redirect('project_list')
                      
        }
      }
    });
    console.log('Done with fasta step')
});
//
//
//
//
// YOUR PROJECTS
//
router.get('/project_list', helpers.isLoggedIn, function (req, res) {
    //console.log(PROJECT_INFORMATION_BY_PNAME);
    if(req.CONFIG.hostname.substring(0,7) == 'bpcweb8'){
      res.render('oligotyping/your_data', {
        title: 'VAMPS:Data Administration',
        user: req.user, hostname: req.CONFIG.hostname,
        message: req.flash('message','Not coded yet'),
      });
      return;
    }
    var user_dir = path.join(req.CONFIG.USER_FILES_BASE, req.user.username);
    
    var project_info = {};
    var file_info = [];
 
     fs.readdir(user_dir, function readProjectsDir(err, items) {
            if (err) { return console.log(err); }
            project_info = {}
            for (var d in items) {
                var pts = items[d].split('-');
                if (pts[0] === 'oligotyping') {

                    var oligo_code = pts[1];
                    project_info[oligo_code] = {}; 
                    var stat = fs.statSync(path.join(user_dir, items[d]));

                    if (stat.isDirectory()) {
                        // stat.mtime.getTime() is for sorting to list in oreder

                        // need to read config file
                        // check status?? dir strcture: analisis/gast/<ds>
                        var data_repository = path.join(user_dir, items[d]);
                        var config_file = path.join(data_repository, 'config.ini');
                        
                        project_info[oligo_code].fasta_status   = helpers.fileExists(path.join(data_repository, 'COMPLETED-FASTA')) ? 'COMPLETED' : ''
                        project_info[oligo_code].entropy_status = helpers.fileExists(path.join(data_repository, 'COMPLETED-ENTROPY')) ? 'COMPLETED' : ''
                        project_info[oligo_code].oligo_status   = helpers.fileExists(path.join(data_repository, 'COMPLETED-OLIGO')) ? 'COMPLETED' : ''
                        
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
                          console.log('Config file ERROR',data_repository)
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
                  //failmessage : req.flash('failMessage'),
                  message : req.flash('Message'),
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
  var data_repository = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'oligotyping-'+oligo_code);
  var config_file = path.join(data_repository, 'config.ini');
  var config = iniparser.parseSync(config_file);
  rank = config['MAIN']['rank'];

  fasta_status   = helpers.fileExists(path.join(data_repository, 'COMPLETED-FASTA')) ? 'COMPLETED' : ''
  entropy_status = helpers.fileExists(path.join(data_repository, 'COMPLETED-ENTROPY')) ? 'COMPLETED' : ''
  oligo_status   = helpers.fileExists(path.join(data_repository, 'COMPLETED-OLIGO')) ? 'COMPLETED' : ''

  console.log(config)
  console.log(fasta_status,' - ',entropy_status,' - ',oligo_status)
  res.render('oligotyping/oligotyping_project',
                { title: 'Oligotype Project',
                  
                  code : oligo_code,
                  fasta_status   : fasta_status,
                  entropy_status : entropy_status,
                  oligo_status   : oligo_status,
                  
                  directory : config['MAIN']['directory'],
                  rank : config['MAIN']['rank'],
                  family : config['MAIN']['family'],
                  genus : config['MAIN']['genus'],
                  cutoff : config['MAIN']['pynast_cutoff_length'],
                  message : req.flash('Message'),
                  user: req.user, hostname: req.CONFIG.hostname
  });


  
  

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
  var data_repository = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, req.body.directory);
  var config_file = path.join(data_repository, 'config.ini');
  var scriptlog   = path.join(data_repository, 'entropy_shell_script.log');
  var tmpl_file = path.join(data_repository, 'TEMPLATE.tmpl');
  var fasta_file = path.join(data_repository, 'fasta.fa');
  var aligned_file = path.join(data_repository, 'pynast_aligned.fa');
  var min_align_fasta_file = path.join(data_repository, 'minaligned.fa');
  var entropy_log   = path.join(data_repository, 'entropy.log');
  var cutoff = req.body.cutoff
  if(genus == '' || genus == 'none'){
    g = ''
  }else{
    g = '-g '+ genus
  }
  var set_env_cmd = ''
  if(req.CONFIG.site == 'vampsdev'){
      set_env_cmd = 'source "/groups/vampsweb/vampsdev/seqinfobin/vamps_environment.sh'
    }else if(req.CONFIG.site == 'vamps'){
      set_env_cmd = 'source "/groups/vampsweb/vamps/seqinfobin/vamps_environment.sh'
    }
  var cmd_options1 = {
      exec : 'create_GG_alignment_template_from_taxon.py',
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ '-f', family, 
                      g, 
                      req.CONFIG.PATH_TO_OLIGOTYPING_BIN+'/otu_id_to_greengenes.txt', 
                      req.CONFIG.PATH_TO_OLIGOTYPING_BIN+'/gg_97_otus_6oct2010_aligned.fasta.txt', 
                      '-o', tmpl_file
                    ],
  };

  var cmd_options2 = {
      exec: 'pynast',
      scriptPath : '',
      args :       [ '-t', tmpl_file, '-i', fasta_file, '-a', aligned_file, '-l', cutoff],
  };
  var cmd_options3 = {
      exec : 'minalign',
      scriptPath : req.CONFIG.PATH_TO_VIZ_SCRIPTS,
      args :       [ aligned_file, '>', min_align_fasta_file],
  };
  var cmd_options4 = {
      exec : 'entropy-analysis',
      scriptPath : '',
      args :       [ min_align_fasta_file, '--no-display', '>', entropy_log],
  };
  var cmd_list = []
  lst = [set_env_cmd, cmd_options1, cmd_options2, cmd_options3, cmd_options4]
  for(n in lst){
    cmd_list.push(path.join(lst[n].scriptPath, lst[n].exec) + ' ' + lst[n].args.join(' ') +' > '+scriptlog)
  }
  
  
  var script_text = helpers.get_local_script_text('entropy', cmd_list);

  var script_file = 'entropy_script.sh'
  var script_file_path = path.join(data_repository, script_file);
  console.log(script_text)
  fs.writeFile(script_file_path, script_text, function writeEntropyScript(err){
      if(err){ return console.log(err) }
      fs.chmod(script_file_path, '0775', function chmodFile(err) {
          if (err) { return console.log(err);}
            var entropy_process = spawn( script_file_path, {}, {
                               env:{ 'PATH':req.CONFIG.PATH, 'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH },
                               detached: true,
                               stdio:['pipe', 'pipe', 'pipe']
                                 //stdio: [ 'ignore', null, log ]
            });  // stdin, stdout, stderr1

            entropy_process.stdout.on('data', function entropyProcessStdout(data) {
            //console.log('Processing data');
            // data = data.toString().replace(/^\s+|\s+$/g, '');
                  data = data.toString().trim();
                  
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
              
              var minaligned_file = path.join(data_repository,'minaligned.fa-ENTROPY')
              var pdf_file        = path.join(data_repository,'minaligned.fa-ENTROPY.pdf')
              var ENTROPY_SUCCESS_FILE    = path.join(data_repository,'COMPLETED-ENTROPY')
              fs.stat(minaligned_file, function checkFilePresence(err,stats){
                if(err){return console.log(err) }
                if (stats.isFile()) {
                  fs.stat(pdf_file, function checkFilePresence(err,stats){
                    if(err){return console.log(err) }
                    if (stats.isFile()) {
                      status = 'entropy_status=COMPLETE\n'
                    }else{
                      status = 'entropy_status=FAIL\n'
                    }
                    //fs.appendFile(config_file, status, function (err) {if(err){return console.log(err) } });
                    fs.closeSync(fs.openSync(ENTROPY_SUCCESS_FILE, 'w'));
                    res.redirect('/oligotyping/project/'+oligo_code)
                    return
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
router.post('/oligo/:code', helpers.isLoggedIn, function (req, res) {
  console.log('in oligo - oligo-->>')
  console.log(req.body);
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
  
 
  var data_repository = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, req.body.directory);
  var config_file = path.join(data_repository, 'config.ini');
  var scriptlog = path.join(data_repository, 'oligotype_shell_script.log');
  //var tmpl_file = path.join(data_repository, 'TEMPLATE.tmpl');
  //var fasta_file = path.join(data_repository, 'fasta.fa');
  //var aligned_file = path.join(data_repository, 'pynast_aligned.fa');
  var min_align_fasta_file = path.join(data_repository, 'minaligned.fa');
  var entropy_file = path.join(data_repository, 'minaligned.fa-ENTROPY');
  //var entropy_log   = path.join(data_repository, 'entropy.log');
  var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
  var out_dir  = req.user.username+'_OLIGOTYPING_'+oligo_code
  var out_oligotype_path  = path.join(pwd,'public','oligotyping','projects', out_dir); 
  var page_title = '"('+family+')-'+req.body.directory+'"'
  //var cutoff = req.body.cutoff
  if(genus != 'none'){
    g = '-g '+ genus
  }else{
    g = ''
  }
  var cmd_options = {
      exec : path.join(req.CONFIG.PATH_TO_NODE_SCRIPTS,'oligotype_start'),
      scriptPath : '',
      args :       [ min_align_fasta_file, entropy_file,
                    '--skip-check-input-file', 
                    '-o', out_oligotype_path, 
                    '-A', MIN_ACTUAL_ABUNDANCE, 
                    '-M', MIN_SUBSTANTIVE_ABUNDANCE,  
                    '-a', MIN_PERCENT_ABUNDANCE, 
                    '-s', MIN_NUMBER_OF_SAMPLES, 
                    '-t', '__', 
                    '--project', page_title
                    ]
  };
  cmd_options.args = cmd_options.args.concat(appendC)
  var cmd_list = []
  lst = [cmd_options]
  for(n in lst){
    cmd_list.push(path.join(lst[n].scriptPath, lst[n].exec) + ' ' + lst[n].args.join(' ') +' > '+scriptlog)
  }
  
  
  var script_text = helpers.get_local_script_text( 'oligo', cmd_list);
  var script_file = 'oligo_script.sh'
  var script_file_path = path.join(data_repository, script_file);
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
                  //console.log(data)
                  
            });
            oligo_process.on('close', function entropyProcessOnClose(close_code) {

              console.log('Finished Oligotype Process Script')
              // check for files:
              //minaligned.fa-ENTROPY and minaligned.fa-ENTROPY.pdf
              // if present then update config file
              
              //var minaligned_file = path.join(data_repository,'minaligned.fa-ENTROPY')
              //var pdf_file        = path.join(data_repository,'minaligned.fa-ENTROPY.pdf')
              var OLIGO_SUCCESS_FILE    = path.join(data_repository,'COMPLETED-OLIGO')
              fs.stat(out_oligotype_path, function checkDirPresence(err,stats){
                if(err){return console.log(err) }
                if (stats.isDirectory()) {
                    status = 'oligo_status=COMPLETE\n'
                    //fs.appendFile(config_file, status, function (err) {if(err){return console.log(err) } });
                    fs.closeSync(fs.openSync(OLIGO_SUCCESS_FILE, 'w'));
                    
                    console.log('redirecting back to project page')
                    res.redirect('/oligotyping/project/'+oligo_code)
                    // var rando = helpers.getRandomInt(10000,99999)
                    // var link = "/oligotyping/projects/"+req.user.username+"_OLIGOTYPING_"+oligo_code+"/HTML-OUTPUT/index.html?rando="+rando.toString()
                    // var html = "** <a href='"+link+"' target='_blank'>Open HTML</a> **"
                    // console.log(html)           
                    // res.send(html); 
                }else{
                  status = 'oligo_status=FAIL\n'
                  //fs.appendFile(config_file, status, function (err) {if(err){return console.log(err) } });
                  res.send('ERROR'); 
                }
                
                
              })

            });
      });

  });
  

});
router.get('/rewind/:code/:level', helpers.isLoggedIn, function (req, res) {
  console.log('in oligo - rewind')
  var oligo_code = req.params.code
  var level = req.params.level
  var data_repository = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'oligotyping-'+oligo_code);

  console.log(oligo_code)
  console.log(level)
  var file1_path = path.join(data_repository, 'COMPLETED-FASTA');
  var file2_path = path.join(data_repository, 'COMPLETED-ENTROPY');
  var file3_path = path.join(data_repository, 'COMPLETED-OLIGO');
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
      var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
      var out_oligotype_path  = path.join(pwd,'public','oligotyping','projects', req.user.username+'_OLIGOTYPING_'+oligo_code); 
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
  var pwd = process.env.PWD || req.CONFIG.PROCESS_DIR;
  var data_repository = path.join(req.CONFIG.USER_FILES_BASE, req.user.username, 'oligotyping-'+oligo_code);
  var out_oligotype_path  = path.join(pwd,'public','oligotyping','projects', req.user.username+'_OLIGOTYPING_'+oligo_code); 
  console.log(data_repository)
  helpers.deleteFolderRecursive(data_repository)
  helpers.deleteFolderRecursive(out_oligotype_path)
  res.redirect('your_projects')
  //res.send('done')
});
// router.post('/go', helpers.isLoggedIn, function (req, res) {
//   console.log('in go')
//   var code = req.body.code
//   var html = "** <a href='/tmp/projects/"+req.user.username+"_OLIGOTYPING_"+code+"/HTML-OUTPUT/index' target='_blank'>Open Emperor</a> **"
//   console.log(html)           

//   res.send(html); 
//   return;
// });

//
//
//
module.exports = router;