var express = require('express');
var router = express.Router();
var config = require('../config/config')
//var helpers = require('./helpers')
var app = express();

/* GET users listing. */
//router.get('/', function(req, res) {
 // res.send('respond with a visualization resource');
//});

router.post('/unit_selection', function(req, res) {
	console.log("Got response: " + res.statusCode);
	console.log(req.body);
	// dataset selection +/- is checked in routes/visualization.js: check_for_no_datasets()
	res.render('visuals/unit_selection', { 	title: 'Unit Selection', 
									body: JSON.stringify(req.body),
									taxonomy: JSON.stringify(config.simpleTaxonomy),
			                        units	: JSON.stringify(config.unitSelect),
			                        "user": get_user(req)
								})
	
});
/* GET visualization page. */
router.get('/', isLoggedIn, function(req, res) {
// {
//     2: {'pname': "BPC_MRB_C", 'datasets':[
//         {"id":244,"ds":"dataset244"}
//     ]},
//     6: {'pname':"SLM_NIH_Bv4v5", 'datasets':[
//         {"id":3,"dname":"1St_121_Stockton"},
//         {"id":6,"dname":"1St_114_Hardinsburg"},
//         {"id":19,"dname":"1St_127_Pendleton"}
//     ]}
// }    
    var db = req.db;
    var qDatasets = "SELECT project, projects.id as pid, dataset, datasets.id as did"
    qDatasets    += " FROM datasets"
    qDatasets    += " JOIN projects ON (projects.id=project_id)"
    var collection = db.query(qDatasets, function (err, rows, fields){
    	if(err)	{
			throw err;
		}else{
			var datasetsByProjectAll = {};
			var projects = []
			var datasets_list = []
			var already_have_project
			datasetsByProjectAll.projects = projects
			for(n=0;n<rows.length;n++){
				//console.log(rows[n].dataset)
				//console.log(rows[n].project)
				pname   = rows[n].project
				pid     = rows[n].pid
				did     = rows[n].did
				dname   = rows[n].dataset
				dataset = {
				    "did"   : did,
				    "dname" : dname
				    }
				project = {
				    "pid"   : pid,
				    "pname" : pname
				    }
				 
				already_have_project = false
				for (var i=0; i<datasetsByProjectAll.projects.length; i++) {
				    if (datasetsByProjectAll.projects[i].pid == pid) {
				        // here we add our dataset to datasetsByProjectAll.projects[i].datasets.push(dataset)
				        datasetsByProjectAll.projects[i].datasets.push(dataset)
				        already_have_project = true
				    }
				}
				if(!already_have_project){
				    // add this dataset to it -- first one	
				    project.datasets = [dataset]
				    datasetsByProjectAll.projects.push(project)
				}	
			}
			
			
			
			                                

			//console.log(JSON.stringify(datasetsByProjectAll));                                                             
			res.render('visuals/index',{ title   : 'Show Datasets!', 
			                             rows    : JSON.stringify(datasetsByProjectAll)	,
			                             "user": get_user(req)		                                
			                            	})
		}
		
    });  
    
  
   
    
});


module.exports = router;

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
function get_user(req){
	if(!req.user || req.user==undefined)
		return ''
  	return req.user  	 	
}

