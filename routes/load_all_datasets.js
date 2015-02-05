// LOAD_ALL_DATASETS.js
var express = require('express');
var router = express.Router();
//
//
//
var qSelectDatasets = "SELECT project, title, dataset_id as did, project_id as pid, dataset, dataset_description, username, email, institution, first_name, last_name, env_source_name";
qSelectDatasets += " FROM dataset";
qSelectDatasets += " JOIN project USING(project_id)";
qSelectDatasets += " JOIN user on(project.owner_user_id=user.user_id)";  // this will need to be changed when table user_project in incorporated
qSelectDatasets += " JOIN env_sample_source USING(env_sample_source_id)";
qSelectDatasets += " ORDER BY project, dataset";

var qSequenceCounts = "SELECT project_id, dataset_id, SUM(seq_count) as seq_count"; 
qSequenceCounts += " FROM sequence_pdr_info";
qSequenceCounts += " JOIN dataset using(dataset_id)";
qSequenceCounts += " GROUP BY dataset_id";
console.log(qSelectDatasets)
// This connection object is made global in app.js
module.exports.get_datasets = function(callback){
  connection.query(qSelectDatasets, function(err, rows, fields){
    ALL_DATASETS = {};      // GLOBAL
    var pids         = {};
    var titles       = {};
    DATASET_NAME_BY_DID = {};    // GLOBAL
    PROJECT_INFORMATION_BY_PID={}  // GLOBAL
    
      if (err)  {
        throw err;
      } else {
        var datasetsByProject = {};
        ALL_DATASETS.projects = [];
        //datasetsByProject.projects = []
        console.log('GETTING ALL DATASETS FROM DB-3 as ALL_DATASETS');

        for (var i=0; i < rows.length; i++) {
          var project = rows[i].project;
          var did = rows[i].did;
          var dataset = rows[i].dataset;
          var dataset_description = rows[i].dataset_description;
          var pid = rows[i].pid;
          PROJECT_INFORMATION_BY_PID[pid] = {
            "last":rows[i].last_name,
            "first":rows[i].first_name,
            "username":rows[i].username,
            "email":rows[i].email,
            "env_source_name":rows[i].env_source_name,
            "institution":rows[i].institution,
            "project":project,
            "title":rows[i].title,
            "description":rows[i].description
          }

          pids[project] = pid;
          titles[project] = rows[i].title;
          
          DATASET_NAME_BY_DID[did] = dataset
          
          if (project === undefined){ continue; }
          if (project in datasetsByProject){
              datasetsByProject[project].push({ did:did, dname:dataset, ddesc: dataset_description});
          } else {
              datasetsByProject[project] = [{ did:did, dname:dataset, ddesc: dataset_description }];
          }
        }

        // todo: console.log(datasetsByProject.length); datasetsByProject - not an array
        for (var p in datasetsByProject){
          var tmp = {};
          tmp.name = p;
          tmp.pid = pids[p];
          tmp.title = titles[p];
          tmp.datasets = [];
          for (var d in datasetsByProject[p]){
            var ds = datasetsByProject[p][d].dname;
            var dp_did = datasetsByProject[p][d].did;  
            var ddesc = datasetsByProject[p][d].ddesc; 
            tmp.datasets.push({ did:dp_did, dname:ds, ddesc:ddesc });
          }
          ALL_DATASETS.projects.push(tmp);
        }

      }
      callback(ALL_DATASETS);
  });
  
  connection.query(qSequenceCounts, function(err, rows, fields){    
    ALL_DCOUNTS_BY_DID = {};    // GLOBAL  
    ALL_PCOUNTS_BY_PID = {};    // GLOBAL 
    console.log(qSequenceCounts)
      if (err)  {
        throw err;
      } else {
        for (var i=0; i < rows.length; i++) {
          var pid = rows[i].project_id;
          var did = rows[i].dataset_id;
          var count= rows[i].seq_count;
          ALL_DCOUNTS_BY_DID[did] = parseInt(count);
           if(pid in ALL_PCOUNTS_BY_PID){
             ALL_PCOUNTS_BY_PID[pid] += parseInt(count);
           }else{
             ALL_PCOUNTS_BY_PID[pid] = parseInt(count);
           }
        }
      }
      console.log('Done with Counts retrieval')
  });
};

// { projects:
//    [ { name: 'SLM_NIH_Bv6', datasets: [Object] },
//      { name: 'SLM_NIH_v1', datasets: [Object] },
//      { name: 'SLM_NIH_v2', datasets: [Object] },
//      { name: 'KCK_MHB_Bv6', datasets: [Object] },
//      { name: 'SLM_NIH_Bv4v5', datasets: [Object] } ] }

// connection.query(qSelectDatasets, function(err, rows, fields){
//     if (err)  {
//       throw err;
//     } else {

//       for (i in rows){
//         project = rows[i].project
//         did = rows[i].did
//         dataset = rows[i].dataset
//         if (project===undefined){ continue }
//         if (project in DATASETS){
//             global.DATASETS[project].push({ 'did':did,'dname':dataset })
//         } else {
//             global.DATASETS[project] = [{ 'did':did,'dname':dataset }]
//         }
//       }


//     }
//     module.exports = global.DATASETS;
// });








