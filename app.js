// anna's
require('nodetime').profile({
    accountKey: '13bf15a356e62b822df4395f183fe0a83af757f4', 
    appName: 'Node.js VAMPS Application'
  });

var compression = require('compression');
var express = require('express');
//var expose = require('express-expose');
var router = express.Router();
var session = require('express-session');
var path = require('path');
global.app_root = path.resolve(__dirname);

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var passport = require('passport');
var favicon = require('serve-favicon');
var fs = require('fs-extra');
var zlib = require('zlib');
var multer = require('multer');
//var db = require('mysql2');
// without var declaration connection is global
// needed for DATASETS initialization
connection = require('./config/database');
//connection.connect();
var routes = require('./routes/index');  // This grabs ALL_DATASETS from routes/load_all_datasets.js
var users = require('./routes/routes_users');
var user_data = require('./routes/routes_user_data');
var search = require('./routes/routes_search');
var projects = require('./routes/routes_projects');
var datasets = require('./routes/routes_datasets');
//var ALL_DATASETS = require('./routes/load_all_datasets2')(connection);
var visuals = require('./routes/visuals/routes_visualization');
var C = require('./public/constants');

var app = express();
app.set('appName', 'VAMPS');
require('./config/passport')(passport, connection.db); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.set(express.static(__dirname + '/tmp'));
// MIDDLEWARE  <-- must be in correct order:
app.use(favicon( path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser({limit: 1024000000 })); // 1024MB
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(multer({ dest: path.join('user_data',NODE_DATABASE,'tmp') }));  // for multipart uploads: files
app.use(cookieParser());

app.use(compression());
/**
 * maxAge used to cache the content, # msec
 * to "uncache" some pages: http://stackoverflow.com/questions/17407770/express-setting-different-maxage-for-certain-files
 */
app.use(express.static(path.join(__dirname, 'public'), {maxAge: '24h' }));
// app.use(express.static(__dirname + '/public', {maxAge: 900000 }));
// app.use(express.static(path.join(__dirname, '/public')));
app.use('public/javascripts', express.static(path.join(__dirname, 'public', 'javascripts')));
app.use('public/stylesheets', express.static(path.join(__dirname, 'public', 'stylesheets')));

// app.use('views/add_ins', express.static(path.join(__dirname, '/views/add_ins')));
// required for passport
// app.use(session({ secret: 'keyboard cat',  cookie: {maxAge: 900000}})); // session secret
app.use(session({ 
	secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
})); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Make our db accessible to our router
// app.use(function(req, res, next){
//     if(!connection.db) {return next(new Error('no db connection'));}
//     req.db = connection.db;
//     req.C = C;
//     return next();
// });
app.use(function(req, res, next){
	if (connection.db == null) {
	   this.send('We cannot reach the database right now, please try again later.');
	   return;
	 }else{
	    req.db = connection.db;
	    req.C = C;
	    return next();
	}
});
//var hdf5 = require('hdf5').hdf5;
// example of roll-your-own middleware:
// GET: localhost:3000/?id=324
// app.use(function (req, res,next) {
//     console.log('START ');
//     if (req.query.id){
//         console.log('got id '+req.query.id);
//         next();
//     }else if (req.query.name){
//         console.log('got name '+req.query.name);
//         next();
//     }else{
//         next();
//     }
// });

// ROUTES:
app.use('/', routes);
app.use('/users', users);
app.use('/projects', projects);
app.use('/datasets', datasets);
app.use('/visuals', visuals);
app.use('/search', search);
app.use('/user_data', user_data);


// for non-routing pages such as heatmap, counts and bar_charts
app.get('/*', function(req, res, next){
    console.warn(req.params);
    console.warn(req.uri);
    var url = req.params[0];
    // I want to create a page like: counts_table_2014080_13452.html
    // for each link
    if (url === 'visuals/user_viz_data/ctable.html') { // 
        // Yay this is the File A... 
        console.warn("The user file  has been requested");
        router.get('/visuals/user_viz_data/ctable.html',  function(req, res) {
            console.warn('trying to open ctable.html');
        });
    } else {
        // we don't care about any other file, let it download too        
        console.warn("No Route Found");
        next();
    }
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers <-- these middleware go after routes

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    console.log('ENV: Development');
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error.ejs', {
            message: err.message,
            error: err
        });
    });
}
if (app.get('env') === 'production') {
    console.log('ENV: Production');
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.ejs', {
        message: err.message,
        error: {}
    });
});


/**
* Create global objects once upon server startup
*/

var silvaTaxonomy = require('./models/silva_taxonomy');
var all_silva_taxonomy = new silvaTaxonomy();
var CustomTaxa  = require('./routes/helpers/custom_taxa_class');
var TreeModel = require('tree-model');;

// GLOBAL if leave off 'var':
// FORMAT: TaxaCounts[ds_id][rank_name][tax_id] = count
// script: /public/scripts/create_taxcounts_lookup.py
console.log('Loading DATABASE: '+NODE_DATABASE+' (see file config/db-connect-xxx.js)')

// these files are manually created before server startup using the scripts in public/scripts
// var rstream = fs.createReadStream('./public/json/tax_counts--'+NODE_DATABASE+'.json.gz');
// var unzip = zlib.createGunzip();
// var taxcounts =''
// var chunk;
// rstream.pipe(unzip)
// 	.on('data', function (chunk) {
// 		taxcounts += chunk;
//   	})
// 	.on('end', function() {
// 		    console.log('Finished reading TAXCOUNTS');
// 	});
var taxcounts_file = path.join(process.env.PWD,'public','json',NODE_DATABASE+'--taxcounts.json');
AllTaxCounts       = require(taxcounts_file);
console.log('Loading ALL TAXCOUNTS from: '+taxcounts_file);
var meta_file      = path.join(process.env.PWD,'public','json',NODE_DATABASE+'--metadata.json');
AllMetadata        = require(meta_file);



console.log('Loading ALL METADATA from: '+meta_file);




all_silva_taxonomy.get_all_taxa(function(err, results) {
  if (err)
    throw err; // or return an error message, or something
  else
  {
    //console.log("AAA all_silva_taxonomy from app = " + JSON.stringify(results));
    
	//TAXCOUNTS = JSON.parse(taxcounts);
	//console.log('TAXCOUNTS2 '+JSON.stringify(TAXCOUNTS));
	// var small_rows = [ {"domain":"Archaea","phylum":"","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":1,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":13,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"D-F10","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":13,"klass_id":33,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"Group_C3","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":13,"klass_id":52,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"Marine_Benthic_Group_A","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":13,"klass_id":58,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":1,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":1,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":2,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Acidobacteria","order":"Acidobacteriales","family":"Acidobacteriaceae","genus":"","species":"","strain":"","domain_id":2,"phylum_id":2,"klass_id":2,"order_id":7,"family_id":8,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Holophagae","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":2,"klass_id":55,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Holophagae","order":"Holophagales","family":"Holophagaceae","genus":"","species":"","strain":"","domain_id":2,"phylum_id":2,"klass_id":55,"order_id":73,"family_id":138,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":3,"klass_id":5,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"Acidimicrobiales","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":3,"klass_id":5,"order_id":5,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"Acidimicrobiales","family":"Acidimicrobiaceae","genus":"","species":"","strain":"","domain_id":2,"phylum_id":3,"klass_id":5,"order_id":5,"family_id":6,"genus_id":1,"species_id":1,"strain_id":1}];
    // var new_taxonomy = new CustomTaxa(small_rows);
    // uncomment when we want all data:
    new_taxonomy = new CustomTaxa(results);
    // uncomment to print out the object:
    // console.log('000 new_taxonomy = ' + JSON.stringify(new_taxonomy));
    new_taxonomy.make_html_tree_file(new_taxonomy.taxa_tree_dict_map_by_id, new_taxonomy.taxa_tree_dict_map_by_rank["domain"]);    
    //console.log("\nnew_taxonomy.taxa_tree_dict = " + JSON.stringify(new_taxonomy.taxa_tree_dict));
  // for(n in new_taxonomy.taxa_tree_dict){
		//console.log(JSON.stringify(new_taxonomy.taxa_tree_dict[n]))
  // }
    //console.log("\ntaxa_tree_dict_map_by_id = " + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_id));
    


    // console.log('taxa_tree_dict_map_by_db_id_n_rank = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank));
    // console.log('taxa_tree_dict_map_by_rank["phylum"] = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_rank['phylum']));

    // console.log('taxa_tree_dict_map_by_name_n_rank = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_name_n_rank));

    
    //console.log('RRR333 taxa_tree_dict_map_by_db_id_n_rank["435_klass"]["taxon"] = '+JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["435_klass"]));
    
  }
});


//var taxCounts = require('./routes/helpers/create_taxcounts_class');
//new taxCounts();



module.exports = app;

// if (!module.parent) {
//   http.createServer(app).listen(process.env.PORT, function(){
//     console.log("Server listening on port " + app.get('port'));
//   });
// }

if (!module.parent) {
  var server = http.createServer(app);
  cluster(server).listen(process.env.PORT);
}


