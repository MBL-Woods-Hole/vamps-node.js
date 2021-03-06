const Submission = require(app_root + '/models/submission');
const helpers    = require(app_root + '/routes/helpers/helpers');
const C		  = require(app_root + '/public/constants');

// Display list of all Submissions.
// exports.submission_list = function (req, res) {
//   res.send('NOT IMPLEMENTED: Submission list');
// };

exports.get_pi_list = function () {
  console.log("FROM Controller");
  var pi_list = [];

  for (var i in C.ALL_USERS_BY_UID) {
    pi_list.push({'PI': C.ALL_USERS_BY_UID[i].last_name + ' ' + C.ALL_USERS_BY_UID[i].first_name, 'pid': i});

  }

  pi_list.sort(function sortByAlpha(a, b) {
    return helpers.compareStrings_alpha(a.PI, b.PI);
  });

  return pi_list;
};

