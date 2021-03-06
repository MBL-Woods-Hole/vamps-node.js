/* jshint multistr: true */

const C = require(app_root + '/public/constants');

//let domains = ["Archaea","Bacteria","Eukarya","Organelle","Unknown"]
let taxa_query_pt1 = "SELECT DISTINCT domain, phylum, klass, `order`, family, genus, species, strain, \
 domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id \
 FROM ";

 let silva_query_pt2 = " JOIN domain AS dom USING(domain_id) \
 JOIN phylum AS phy USING(phylum_id) \
 JOIN klass AS kla USING(klass_id) \
 JOIN `order` AS ord USING(order_id) \
 JOIN family AS fam USING(family_id) \
 JOIN genus AS gen USING(genus_id) \
 JOIN species AS spe USING(species_id) \
 JOIN strain AS str USING(strain_id)";

 //let sqldomains = (domains).join("','")
 let sqldomains = (C.UNITSELECT.silva119_custom.domains).join("','")
 silva_query_pt2 += " WHERE domain in ('"+sqldomains+"')";
 
console.log('running custom tax query short-2');
console.log(silva_query_pt2);
console.log('SILVA: running dataset_taxa_counts query from models/silva_taxonomy.js');

module.exports = silvaTaxonomy;

function silvaTaxonomy() {
}

silvaTaxonomy.prototype.get_all_taxa = function(callback) 
{
  let query = taxa_query_pt1+'silva_taxonomy'+silva_query_pt2
  //var query = taxa_query_pt1+'taxonomy'+taxa_query_pt2
  //console.log('SILVA Taxonomy: '+query)
    DBConn.query(query, function (err, rows, fields) {
    callback(err, rows);
  });
};
