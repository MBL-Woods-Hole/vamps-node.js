var db = require('mysql');

var connection = db.createConnection({
  host     : 'localhost',
  user     : 'ruby',
  password : 'ruby',
  database : 'vamps_rails'
});
connection.connect();
module.exports = connection;