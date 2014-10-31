// anna's
require('nodetime').profile({
    accountKey: '13bf15a356e62b822df4395f183fe0a83af757f4', 
    appName: 'Node.js VAMPS Application'
  });

var compression = require('compression');
var express = require('express');
var router = express.Router();
var session = require('express-session');
var path = require('path');
global.app_root = path.resolve(__dirname);

var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var passport = require('passport');
var db = require('mysql');
// without var declaration connection is global
// needed for DATASETS initialization
connection = require('./config/database-dev');
//connection.connect();
var routes = require('./routes/index');  // This grabs ALL_DATASETS
var users = require('./routes/users');
var projects = require('./routes/projects');
var datasets = require('./routes/datasets');
//var ALL_DATASETS = require('./routes/load_all_datasets2')(connection);
var visuals = require('./routes/visuals/routes_visualization');
var C = require('./public/constants');

var app = express();
app.set('appName', 'VAMPS');
require('./config/passport')(passport, connection); // pass passport for configuration

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// MIDDLEWARE  <-- must be in correct order:
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser({limit: 1024000000 })); // 1024MB
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

  //app.use(express.session({ cookie: { maxAge: 60000 }}));
 // app.use(flash());
app.use(compression());
/**
 * maxAge used to cache the content, # msec
 * to "uncache" some pages: http://stackoverflow.com/questions/17407770/express-setting-different-maxage-for-certain-files
 */
app.use(express.static(__dirname + '/public', {maxAge: '24h' }));
// app.use(express.static(__dirname + '/public', {maxAge: 900000 }));
// app.use(express.static(path.join(__dirname, '/public')));
app.use('public/javascripts', express.static(path.join(__dirname, '/public/javascripts')));
app.use('public/stylesheets', express.static(path.join(__dirname, '/public/stylesheets')));

// app.use('views/add_ins', express.static(path.join(__dirname, '/views/add_ins')));
// required for passport
// app.use(session({ secret: 'keyboard cat',  cookie: {maxAge: 900000}})); // session secret
app.use(session({ secret: 'keyboard cat'})); // session secret
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// Make our db accessible to our router
app.use(function(req, res, next){
    if(!connection) {return next(new Error('no db connection'));}
    req.db = connection;
    req.C = C;
    return next();
});

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



// for non-routing pages such as heatmap, counts and bar_charts
app.get('/*', function(req, res, next){
    console.warn(req.params);
    console.warn(req.uri);
    var url = req.params[0];
    // I want to create a page like: counts_table_2014080_13452.html
    // for each link
    if (url === 'visuals/user_data/ctable.html') { // 
        // Yay this is the File A... 
        console.warn("The user file  has been requested");
        router.get('/visuals/user_data/ctable.html',  function(req, res) {
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

// GLOBAL if leave off 'var':
// FORMAT: TaxaCounts[ds_id][rank_name][tax_id] = count
// script: /public/scripts/create_taxcounts_lookup.py
TaxaCounts     = require('./public/scripts/tax_counts_lookup.json');
MetadataValues = require('./public/scripts/metadata.json');
//console.log(TaxaCounts)

all_silva_taxonomy.get_all_taxa(function(err, results) {
  if (err)
    throw err; // or return an error message, or something
  else
  {
    // console.log("AAA all_silva_taxonomy from app = " + JSON.stringify(results));
    
// var small_rows = [ {"domain":"Archaea","phylum":"","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":1,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":13,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"D-F10","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":13,"klass_id":33,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"Group_C3","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":13,"klass_id":52,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Archaea","phylum":"Crenarchaeota","klass":"Marine_Benthic_Group_A","order":"","family":"","genus":"","species":"","strain":"","domain_id":1,"phylum_id":13,"klass_id":58,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":1,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":1,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":2,"klass_id":1,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Acidobacteria","order":"Acidobacteriales","family":"Acidobacteriaceae","genus":"","species":"","strain":"","domain_id":2,"phylum_id":2,"klass_id":2,"order_id":7,"family_id":8,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Holophagae","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":2,"klass_id":55,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Acidobacteria","klass":"Holophagae","order":"Holophagales","family":"Holophagaceae","genus":"","species":"","strain":"","domain_id":2,"phylum_id":2,"klass_id":55,"order_id":73,"family_id":138,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":3,"klass_id":5,"order_id":1,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"Acidimicrobiales","family":"","genus":"","species":"","strain":"","domain_id":2,"phylum_id":3,"klass_id":5,"order_id":5,"family_id":1,"genus_id":1,"species_id":1,"strain_id":1},{"domain":"Bacteria","phylum":"Actinobacteria","klass":"Actinobacteria","order":"Acidimicrobiales","family":"Acidimicrobiaceae","genus":"","species":"","strain":"","domain_id":2,"phylum_id":3,"klass_id":5,"order_id":5,"family_id":6,"genus_id":1,"species_id":1,"strain_id":1}];
    // var new_taxonomy = new CustomTaxa(small_rows);
    // uncomment when we want all data:
    new_taxonomy = new CustomTaxa(results);
    // uncomment to print out the object:
    // console.log('000 new_taxonomy = ' + JSON.stringify(new_taxonomy));
    new_taxonomy.make_html_tree_file(new_taxonomy.taxa_tree_dict_map_by_id, new_taxonomy.taxa_tree_dict_map_by_rank["domain"]);    
    //console.log('000 new_taxonomy.taxa_tree_dict = ' + JSON.stringify(new_taxonomy.taxa_tree_dict)+'\ntaxa_tree_dict');
    //console.log('taxa_tree_dict_map_by_id = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_id)+'\nby_id)');
    
    //console.log('taxa_tree_dict_map_by_db_id_n_rank = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank)+'\nby_db_id_n_rank');
    //console.log('taxa_tree_dict_map_by_rank = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_rank)+'\nmap_by_rank');
    //console.log('taxa_tree_dict_map_by_name_n_rank = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_name_n_rank)+'\nby_name_n_rank');
    
    //console.log('RRR333 taxa_tree_dict_map_by_db_id_n_rank["138_family"]["taxon"] = ' + JSON.stringify(new_taxonomy.taxa_tree_dict_map_by_db_id_n_rank["138_family"]["taxon"]));
    
  

  }
});

// var csvUpload = require('./sbin/metadata_upload');
// var csv_filename = path.join(__dirname, 'data/KCK_LSM_Bv6_qii.csv');
// myCSV = new csvUpload(csv_filename);
// console.log("FROM app!");


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

