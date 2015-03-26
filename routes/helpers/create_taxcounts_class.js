/*
 * TaxCounts = create_taxcounts_class.js
 */

/*jshint multistr: true */

var constants = require(app_root + '/public/constants');
var helpers = require('./helpers');

// Private
function make_dataset_seq_tax_dict()
{
  helpers.start = process.hrtime();     
  
  var dataset_seq_tax_dict = {};
  console.log("Started make_dataset_seq_tax_dict");
  
  var query = connection.db.query('SELECT * \
    FROM taxa_counts_temp \
  ');

  query.on('error', function(err) {
      throw err;
  });

  // query.on('fields', function(fields) {
  //   console.log("SSS1 fields");
  //     console.log(fields);
  // });

  // query.on('result', function(row) {
  //   console.log("SSS2 fields");
  //     console.log(row);
  // });
  
  query.on('result', function(row) {
      connection.db.pause();
      //===
      // console.log("HHH1");
      // console.log("dataset_seq_tax_obj = " + JSON.stringify(dataset_seq_tax_obj));  
      // for (var i=0, len = dataset_seq_tax_obj.length; i < len; i++)
      // {
      // 
      //  in_obj = dataset_seq_tax_obj[i];
        // console.log("\n=======\nTTT1 dataset_seq_tax_obj[i] = " + JSON.stringify(in_obj));
        in_obj = row;
        dataset_id = parseInt(in_obj["dataset_id"]);
        count = in_obj["seq_count"]

        // console.log("NNN1 in_obj[dataset_id] = dataset_id = " + JSON.stringify(dataset_id));
        init_dataset_seq_tax_dict(dataset_seq_tax_dict);
        rank_attr = ""
        // helpers.start = process.hrtime();     

        for (var field_name in in_obj)
        {

           var is_rank = helpers.check_if_rank(field_name.slice(0,-3));
           if (is_rank)
           {
             rank_attr += ("_" + in_obj[field_name]);
             count_taxa(dataset_seq_tax_dict);
           }       
         }
       // }
       // helpers.elapsed_time("This is the running time for count_taxa");         

      
      //===
      
      connection.db.resume();
      // console.log("DDD3 dataset_seq_tax_dict = " + JSON.stringify(dataset_seq_tax_dict));
      
  });
  // console.log("DDD5 dataset_seq_tax_dict = " + JSON.stringify(dataset_seq_tax_dict));
  
  query.on('end', function(err) {
    if (err) throw err;
    // console.log("DDD6 dataset_seq_tax_dict = " + JSON.stringify(dataset_seq_tax_dict));
    helpers.elapsed_time("This is the running time for make_dataset_seq_tax_dict");         
    helpers.start = process.hrtime();     
    helpers.write_to_file(file_name, JSON.stringify(dataset_seq_tax_dict));
    helpers.elapsed_time("This is the running time for write_to_file");         
    return dataset_seq_tax_dict;
    
  });  
}


function count_taxa(dataset_seq_tax_dict)
{
  try 
  {
    if (dataset_seq_tax_dict[dataset_id][rank_attr] > 0)
    {
      dataset_seq_tax_dict[dataset_id][rank_attr] = dataset_seq_tax_dict[dataset_id][rank_attr] + count;
    }
    else
    {
      dataset_seq_tax_dict[dataset_id][rank_attr] = count;             
    }    
  }
  catch (e) 
  {
    console.log(e);
  }
  // finally 
  // {
  //   console.log("entering and leaving the finally block");
  // }
  return dataset_seq_tax_dict;
}

function init_dataset_seq_tax_dict(dataset_seq_tax_dict)
{
  if (!(dataset_seq_tax_dict[dataset_id]))
  {
    dataset_seq_tax_dict[dataset_id] = {};
  }
  return dataset_seq_tax_dict
}

// Public
module.exports = TaxCounts;

function TaxCounts() {
  helpers.start = process.hrtime();
  file_name = "public/json/dataset_seq_tax_dict.json"
  helpers.clear_file(file_name);
  
  make_dataset_seq_tax_dict();

}

