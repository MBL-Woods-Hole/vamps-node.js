
var mysql = require('mysql2');
var fs    = require('fs-extra');
var path  = require('path');
var CONFIG = require('./config')
//JSON.minify = JSON.minify || require("node-json-minify");

//var config_file = JSON.parse(fs.readFileSync('./config/db-connection.js', {encoding:'utf8'}));
var db_config_file = './config/db-connection.js';
eval(fs.readFileSync(db_config_file).toString());
console.log('DATABASE: '+NODE_DATABASE);

var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : db_config.host,
    user     : db_config.user,
    password : db_config.password,
	  socketPath : db_config.socketPath,
    database : NODE_DATABASE,
	  debug    :  false
});


fs.ensureDir(CONFIG.USER_FILES_BASE, function (err) {
  			console.log(err) // => null
  			// dir has now been created, including the directory it is to be placed in
})

// console.log(pool);
exports.pool = pool;
// function handle_database(req,res) {
   
//     pool.getConnection(function(err, connection){

//         if (err) {
//           connection.release();
//           res.json({"code" : 100, "status" : "Error in connection database"});
//           return;
//         }  

//         console.log('connected as id ' + connection.threadId);
       
//         connection.query("select * from user",function(err,rows){
//             connection.release();
//             if(!err) {
//                 res.json(rows);
//             }          
//         });

//         connection.on('error', function(err) {      
//               res.json({"code" : 100, "status" : "Error in connection database"});
//               return;    
//         });
//   });
// }



// Generated by LiveScript 1.2.0   https://github.com/felixge/node-mysql/issues/761
// Edited: replaced all "db" with "exports.db"
// (function(){
//    var handleDisconnect,mysql, this$ = this;
//    var mysql = require('mysql2');
//    var fs = require('fs-extra');
//    var config_file = 'config/db-connection.js';
//    eval(fs.readFileSync(config_file).toString());
//    exports.db = null;
//    handleDisconnect = function(){
//      console.log('Trying to Connect...');
// 	    exports.db = mysql.createConnection(db_config);
//      exports.db.connect(function(err){
// 	    if (err != null) {
//          console.log('Error connecting to mysql:', err);
//          exports.db = null;
//          return setTimeout(handleDisconnect, 2000);
//        }else{
//        	console.log('DATABASE: '+db_config.database+' (see file '+config_file+')')
//         console.log('Connected!');
//        }
//      });
//      return exports.db.on('error', function(err){
//        console.log('Database error:', err);
//        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//           exports.db = null;
// 		      console.log('Found error PROTOCOL_CONNECTION_LOST -- restarting');
//           return handleDisconnect();
//        } else {
//          return process.exit(1);
//        }
//      });
//    };
//    handleDisconnect();

// }).call(this);
