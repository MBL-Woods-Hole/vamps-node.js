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
      res.redirect('/');
  }
};
