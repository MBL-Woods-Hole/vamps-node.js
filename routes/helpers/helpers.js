var constants = require(app_root + '/public/constants');
var express = require('express');
var router = express.Router();

module.exports = {

  // route middleware to make sure a user is logged in
  isLoggedIn: function (req, res, next) {

      // if user is authenticated in the session, carry on
      if (req.isAuthenticated()) {
        console.log("Hurray! isLoggedIn.req.isAuthenticated");
        return next();
      }
      // if they aren't redirect them to the home page
      console.log("Oops! NOT isLoggedIn.req.isAuthenticated");
      req.flash('loginMessage', 'Please login or register before continuing.');
      res.redirect('/users/login');
  }
  
  
};

/** Benchmarking
* Usage: 
    var helpers = require('../helpers/helpers');

    helpers.start = process.hrtime();
    some code
    helpers.elapsed_time("This is the running time for some code");
*/

module.exports.start = process.hrtime();

module.exports.elapsed_time = function(note){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(module.exports.start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(module.exports.start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
};

var ranks = constants.RANKS;

module.exports.check_if_rank = function(field_name)
{
  // ranks = ["domain","phylum","klass","order","family","genus","species","strain"]
  // console.log("FFF0 field_name = "+ field_name);
  return ranks.indexOf(field_name) > -1;
}
