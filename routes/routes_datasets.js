const express = require('express');
var router = express.Router();


/* GET datasets listing. */
router.get('/', (req, res) => {
  res.send('respond with a dataset resource');
});


module.exports = router;
