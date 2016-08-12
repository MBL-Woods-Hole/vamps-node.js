process.env.NODE_ENV = 'testing'
var async = require('async'),
    request = require('supertest'),
    should = require('should'),
    app = require('../app'),
    init = require('./init')
var express = require('express');
var passport = require('passport');
var helpers = require('../routes/helpers/helpers');
var passportStub = require('passport-stub');
var supertest = require('supertest');
var util = require('util');
// console.log(util.inspect(app.testuser, false, null));

// var request = require('superagent');
var expect = require('expect.js');
var server = supertest.agent("http://localhost:3000");
// app.use(express.bodyParser()); // need this to see the body in req object

// describe('Suite one', function(){
//  it (function(done){
//    request.post('localhost:8080').end(function(res){
//     expect(res).to.exist;
//     expect(res.status).to.equal(200);
//     expect(res.body).to.contain('world');
//     done();
//    });
//   });
// });
// it('throwns a TypeError', function () {
//     should.throws(target, TypeError);
// });
//

// describe("SAMPLE unit test",function(){
//
//   // #1 should return home page
//
//   it("should have text",function(done){
//
// // should  = require('should')
// // request = require('supertest')
// // app     = require('../../app')
// //
// // describe 'authentication', ->
// //   describe 'POST /sessions', ->
// //     describe 'success', ->
// //       it 'redirects to the right path', (done) ->
// //         request(app)
// //           .post('/sessions')
// //           .send(user: 'username', password: 'password')
// //           .end (err, res) ->
// //             res.header['location'].should.include('/home')
// //             done()
//     // calling home page api
//     server
//     .get("/")
//     .expect("Content-type", /json/)
//     .expect(200) // THis is HTTP response
//     .end(function(err, res){
//       // console.log("YYY res");
//       // console.log(util.inspect(res, false, null));
//       // HTTP status should be 200
//       // res.status.should.equal(200);
//
//       // console.log("222 res");
//       // console.log(util.inspect(res.text, false, null));
//       // res.text.should.includes("FFFfalse");
//       // res.text.should.match("FFFfalse");
//       res.text.should.containEql('Susan Huse');
//       res.text.should.not.containEql('FFFfalse');
//
//
//
//       // Error key should be false.
//       // console.log("RRR res.body");
//       // console.log(util.inspect(res.body, false, null));
//       // res.body.error.should.equal(false);
//       done();
//     });
//   });
//
//
//   // it("should have text",function(done){
//   //   server
//   //   .get("/user_data/your_data")
//   //   .expect("Content-type", /json/)
//   //   .expect(200) // THis is HTTP response
//   //   .end(function(err, res){
//   //     console.log("YYY res");
//   //     console.log(util.inspect(res, false, null));
//   //     // console.log("222 res");
//   //     // console.log(util.inspect(res.text, false, null));
//   //     res.text.should.containEql('Data Administration');
//   //     done();
//   //   });
//   // });
//
//
//
// });
//

describe('<<< Data Import Selection page functionality >>>', function(){
    beforeEach(function() {
      passportStub.logout();
    });

    before(function () {
        test_name_hash = {}
        test_name_hash.name = []
        test_name_hash.ids  = []
        test_selection_obj  = {}

        connection = require('../config/database-test');
        passportStub.install(app);
        console.log('Logging in with username:', app.testuser.user, ' and password:', app.testuser.pass);
        passportStub.login({
          username: app.testuser.user, password: app.testuser.pass
        });
        //this.timeout(10000);
        // done();
    });

    it('responds with 200 when logged in', function(done) {
      passportStub.login({
        username: 'TEST', password: 'TEST'
      });
      req = request(app);
      
      req
        .get('/users/profile')
        .expect(200)
        .end(function (err, res) {
          res.text.should.containEql('Profile Page');
          res.status.should.eql(200);
          res.text.should.containEql('TEST');
          done();
        });

      // passportStub.logout();
    });
  
  it('should not allow to submit a project if not logged in', function(done){
    request(app)
    .get('/user_data/import_choices')
    .expect("Content-type", /json/)
    .end(function(err, res){
      res.status.should.eql(302);
      res.text.should.not.containEql('Data Administration');
      res.text.should.eql('Found. Redirecting to /users/login');
      done();
    });
  });
  
  it("should have a correct title and buttons on your_data",function(done){
    server
    .get("/user_data/your_data")
    .expect("Content-type", /json/)
    .expect(200) // THis is HTTP response
    .end(function(err, res){
      // console.log("YYY res");
      // console.log(util.inspect(res, false, null));
      // console.log("222 res");
      // console.log(util.inspect(res.text, false, null));
      res.status.should.eql(200);
      res.text.should.containEql('Data Administration');
      res.text.should.containEql('Import Data');
      res.text.should.containEql('Your Projects');
      done();
    });
  });
  
  it("should have a correct title and buttons on import_choices if logged in", function(done){
    passportStub.login({
      username: 'TEST', password: 'TEST'
    });
    req = request(app);
    
    req
      .get('/users/profile')
      .expect(200)
      .end(function (err, res) {
        // console.log("===2===");
        // console.log(res);
        // console.log("===22===");
        res.text.should.containEql('Profile Page');
        res.text.should.containEql('TEST');
        
        server
        .get('/user_data/import_choices')
        .expect("Content-type", /json/)
        .end(function(err, res){
          res.status.should.eql(302);
          console.log("YYY res");
          console.log(util.inspect(res, false, null));
          res.text.should.containEql('DDDRRRR');
          res.text.should.containEql('Data Import Selection');
        });
        
        // done();
      });
      // done();

  });
  
  //     passportStub.install(app);
  //     console.log('Logging in with username:', app.testuser.user, ' and password:', app.testuser.pass);
  //     passportStub.login({
  //       username: app.testuser.user, password: app.testuser.pass
  //     });


});
  
//     beforeEach(function() {
//       passportStub.logout();
//     });
//
//     before(function (done) {
//         test_name_hash = {}
//         test_name_hash.name = []
//         test_name_hash.ids  = []
//         test_selection_obj  = {}
//
//         connection = require('../config/database-test');
//
//         // login with passport-stub
//         passportStub.install(app);
//         console.log('Logging in with username:', app.testuser.user, ' and password:', app.testuser.pass);
//         passportStub.login({
//           username: app.testuser.user, password: app.testuser.pass
//         });
//         //this.timeout(10000);
//         req = request(app);
//
//         done();
//     });
//
//
//
//
//   it('should not allow to submit a project if not logged in', function(done) {
//     // Data Administration
// //     var formElem = document.forms[0];
// //     var signupButton = document.getElementByClass('panel-heading');
// // // <a class="btn btn-sm btn-primary" href="/user_data/import_choices">Import Data</a>
// //     console.log("LLL1");
// //     console.log(util.inspect(formElem, false, null));
// //     console.log("LLL2");
// //     console.log(util.inspect(signupButton, false, null));
// //     // <p class="title">Data Administration</p>
// //
//
// // it('should respond with redirect on post', function(done) {
// //     request(app)
// //       .post('/api/members')
// //       .send({"participant":{"nuid":"98ASDF988SDF89SDF89989SDF9898"}})
// //       .expect(200)
// //       .expect('Content-Type', /json/)
// //       .end(function(err, res) {
// //         if (err) done(err);
// //         res.body.should.have.property('participant');
// //         res.body.participant.should.have.property('nuid', '98ASDF988SDF89SDF89989SDF9898');
// //         done();
// //       });
// //   });
// //
//     req
//     .get('/user_data/your_data')
//     .expect(555)
//     // .get('/user_data/import_choices')
//     // .expect(555)
//     .end(function (err, res) {
//       console.log("LLL res.text");
//       // console.log(util.inspect(signupButton.innerHTML, false, null));
//       // console.log(util.inspect(res.text, false, null));
//       res.status.should.eql(555);
//
//       expect(res.body).to.contain('world111');
//       res.text.should.include("UUUUUUUU");
//       res.header.location.should.containEql('your_data');
//       console.log("HHH res.header: ")
//       console.log(util.inspect(res.header, false, null));
//       // expect(res.text).to.equal("<p class=\'title\'>Data Administration111</p>");
//       done();
//     });
//     done();
//   });
//
//   it('should not allow to submit a project if logged in as a gest');
//
//   it('should show buttons on GET /user_data/your_data 304', function(done) {
//     // Data Administration
//     done();
//   });
//
//   it('should show choices on GET /user_data/import_choices 304', function(done) {
//     // Data Import Selection
//     done();
//   });
//
//   it('should show Import Simple (single dataset) Form on POST /user_data/upload_data 302', function(done) {
//     // Import Data
//     done();
//   });
//
//   it('should show "That A project name is required." if upload failed in ProjectNameGiven', function(done) {
//     // GET /user_data/your_data 304
//     // Import Data
//     //
//     done();
//   });
//
//   it('should show "A fasta file is required." if upload failed in FastaExists', function(done) {
//     // Import Data
//     //  POST /user_data/upload_data 302
//     done();
//   });
//
//   it('should show "A metadata csv file is required." if upload failed in MetadataFileExists', function(done) {
//     // Import Data
//     //  POST /user_data/upload_data 302
//     done();
//   });
//
//   it('should show "That project name is already taken." if upload failed in FilePathExists', function(done) {
//     // Import Data
//     //  POST /user_data/upload_data 302
//     done();
//   });
//
//   it('should show "Upload in Progress: \'test_gast_project\'" on POST /user_data/upload_data 200 if success', function(done) {
//     // Data Import Selection
//     done();
//   });
//
//   it('should insert into db status = "OK", message = "Upload Started"', function(done) {
//     // Data Import Selection
//     // GET /user_data/import_data?import_type=simple_fasta 200
//     done();
//   });
//
//
//   it('should update db with status = "LOADED", message = "Project is loaded --without tax assignments"', function(done) {
//     // Data Import Selection
//     // GET /user_data/import_data?import_type=simple_fasta 200
//     done();
//   });
//
//   it('should say if the file is compressed or not');
//
//
//   // it('should return 200 when user is logged in', function(done) {
//   //
//   //   var app = express();
//   //   app.use(passport.initialize());
//   //   app.use(passport.session());
//   //   app.use(function(req, res, next) {
//   //     req.isAuthenticated = function() {
//   //       return true;
//   //     };
//   //     req.user = {};
//   //     next();
//   //   });
//   //   app.get('/', function(req, res){
//   //     if (!req.user || !req.isAuthenticated()){
//   //       return res.send(403);
//   //     }
//   //
//   //     res.status(200).end()
//   //     // res.send(200);
//   //   });
//   //
//   //   request(app)
//   //     .get('/')
//   //     .expect(200)
//   //     .end(done);
//   //
//   // });
//
// });
