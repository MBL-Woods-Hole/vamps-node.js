var path = require("path");

var constants_metadata = {};

// --- fields ---
constants_metadata.REQ_METADATA_FIELDS      = [
  "collection_date",  // format?? yyyy-mm-dd
  "geo_loc_name",     // name of country or longhurst zone
  "dna_region",       // v6, v4v5 v6v4 .... (from mysql table)
  "domain",           // Bacteria, Archaea or Eukarya (from mysql table)
  "env_biome",
  "env_feature",
  "env_material",
  "env_package",      // (from mysql table)
  "target_gene",      // 16s or 18s (from mysql table)
  "latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
  "longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
  "sequencing_platform",
  "adapter_sequence",
  "illumina_index",
  "primer_suite",
//  "forward_primer",
//  "reverse_primer",
  "run"
];

constants_metadata.REQ_METADATA_FIELDS_wIDs = ["geo_loc_name",     // name of country or longhurst zone
  "dna_region",       // v6, v4v5 v6v4 .... (from mysql table)
  "domain",           // Bacteria, Archaea or Eukarya (from mysql table)
  "env_biome",
  "env_feature",
  "env_material",
  "env_package",      // (from mysql table)
  "target_gene",      // 16s or 18s (from mysql table)
  "sequencing_platform",
  "adapter_sequence",
  "illumina_index",
  "primer_suite",
  // "forward_primer",
  // "reverse_primer",
  "run"
];

constants_metadata.PROJECT_INFO_FIELDS = [
  // "dataset",
  // "dataset_description",
  // "dataset_id",
  "first_name",
  "institution",
  "last_name",
  "pi_email",
  "pi_name",
  "project",
  // "project_abstract",
  "project_title",
  "public",
  // "reference",
  "username"
];

constants_metadata.METADATA_NAMES_ADD = [
  // "dataset",
  "dataset_id",
  "project_abstract"
];

constants_metadata.METADATA_NAMES_SUBSTRACT = [
  "dataset_description",
  "primer_suite",
  "project_abstract",
  "reference"
];

constants_metadata.FIELDS_BY_ENV = {
  "air": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*altitude", "*env_broad_scale", "*env_local_scale", "*env_medium", "*geo_loc_name",
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "elevation", "temperature", "description"],

  "built_environment": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*abs_air_humidity",
    "*temperature", // air_temp
    "*build_occup_type", "*building_setting",
    "*carb_dioxide", // carbon_dioxide?
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*env_broad_scale", "*env_local_scale", "description", "*env_medium", "*filter_type", "*geo_loc_name", "*heat_cool_type", "*indoor_space", "*light_type", "*occup_samp", "*occupant_dens_samp", "*organism_count", "*rel_air_humidity", "*space_typ_state", "*typ_occupant_dens", "*ventilation_type"],

  "human_associated": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*env_broad_scale", "*env_local_scale", "*env_medium", "*geo_loc_name", "*host",
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "description"],

  "human_gut": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*env_broad_scale", "*env_local_scale", "*env_medium", "*geo_loc_name", "*host",
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "temperature", "description"],

  "human_oral": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*env_broad_scale", "*env_local_scale", "*env_medium", "*geo_loc_name", "*host",
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "temperature", "description"],

  "human_skin": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*env_broad_scale", "*env_local_scale", "*env_medium", "*geo_loc_name", "*host",
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "temperature", "description"],

  "human_vaginal": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*env_broad_scale", "*env_local_scale", "*env_medium", "*geo_loc_name", "*host",
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "temperature", "description"],

  "microbial_mat_biofilm": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*depth", "*elev", "*env_broad_scale", "*env_local_scale", "*env_medium", "*geo_loc_name",
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "ph", "temperature", "description"],

  "miscellaneous_natural_or_artificial_environment": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*env_broad_scale", "*env_local_scale", "*env_medium", "*geo_loc_name",
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "depth", "elevation", "isolation_source", "ph", "temperature", "description"],

  "plant_associated": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*env_broad_scale", "*env_local_scale", "*env_medium", "*geo_loc_name", "*host",
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "depth", "elevation", "host_taxid", "plant_body_site", "temperature", "description"],

  "sediment": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*depth", "*elev", "*env_broad_scale", "*env_local_scale", "*env_medium", "*geo_loc_name",
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "ph", "temperature", "description"],

  "soil": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*depth", "*elev", "*env_broad_scale", "*env_local_scale", "*env_medium", "*geo_loc_name",
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "ph", "description"],

  "wastewater_sludge": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*env_broad_scale", "*env_local_scale", "*env_medium", "*geo_loc_name",
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "depth", "ph", "temperature", "description"],

  "water": ["*sample_name", "sample_title", "bioproject_accession", "*organism", "*collection_date", "*depth", "*env_broad_scale", "*env_local_scale", "*env_medium", "*geo_loc_name",
    "*latitude",         // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "*longitude",        // decimal degrees  (https://en.wikipedia.org/wiki/Decimal_degrees)
    "elevation", "ph", "temperature", "tot_depth_water_col", "description"],

};

// --- fields for forms ---
// -- 1 initial form (project) --
constants_metadata.METADATA_NEW_FORM_FIELDS = [
  "d_region",
  "full_name",
  "funding_code",
  "pi_email",
  "pi_id_name",
  "pi_name",
  "pi_name_reversed",
  "project_description",
  "project_name",
  "project_name1",
  "project_name2",
  "project_name3",
  "project_title",
  "reference",
  "samples_number",
];

// -- 2 form for datasets --
constants_metadata.METADATA_FORM_REQUIRED_FIELDS = ["adapter_sequence",
  "collection_date",
  "conductivity",
  "dataset",
  "dataset_description",
  "dna_extraction_meth",
  "dna_quantitation",
  "dna_region",
  "domain",
  "elevation",
  "env_biome",
  "env_feature",
  "env_material",
  "env_package",
  "forward_primer",
  "geo_loc_name_continental",
  "geo_loc_name_marine",
  "illumina_index",
  "investigation_type",
  "latitude",
  "longitude",
  "ph",
  "project",
  "reverse_primer",
  "run",
  "sample_concentration",
  "sample_name",
  "sample_type",
  "sequencing_meth",
  "target_gene",
  "temperature",
  "tube_label",
  "user_sample_name"
];

constants_metadata.ORDERED_METADATA_NAMES_OBJ = {
  "Please fill in": ["", "Please fill in", "", ""],
  "sample_num": ["sample_num", "Sample Number", "MBL Supplied", ""],
  "dataset_description": ["dataset_description", "Dataset description", "User Supplied", ""],
  "tube_label": ["tube_label", "Tube label", "User Supplied", ""],
  "sample_concentration": ["sample_concentration", "Sample concentration", "User Supplied", "ng/ul"],
  // old part
  "structured comment name": ["structured comment name", "Parameter", "", ""],
  "General": ["", "General", "", ""],
  "sample_name": ["sample_name", "Sample ID (user sample name)", "User supplied", ""],
  "dataset": ["dataset", "VAMPS dataset name", "MBL Supplied", ""],
  "geo_loc_name_continental": ["geo_loc_name_continental", "Country (if not international waters)", "User Supplied", ""],
  "geo_loc_name_marine": ["geo_loc_name_marine", "Longhurst Zone (if marine)", "User Supplied", ""],
  "MBL generated laboratory metadata": ["", "MBL generated laboratory metadata", "", ""],
  "domain": ["domain", "Domain", "MBL Supplied", ""],
  "target_gene": ["target_gene", "Target gene name", "MBL Supplied", "16S rRNA, mcrA, etc"],
  "dna_region": ["dna_region", "DNA region", "MBL Supplied", ""],
  "sequencing_platform": ["sequencing_platform", "Sequencing method", "MBL Supplied", ""],
  "forward_primer": ["forward_primer", "Forward PCR Primer", "MBL Supplied", ""],
  "reverse_primer": ["reverse_primer", "Reverse PCR Primer", "MBL Supplied", ""],
  "adapt_3letter": ["adapt_3letter", "Adapter name 3 letters", "MBL Supplied", ""],
  "illumina_index": ["illumina_index", "Index sequence (for Illumina)", "MBL Supplied", ""],
  "adapter_sequence": ["adapter_sequence", "Adapter sequence", "MBL Supplied", ""],
  "run": ["run", "Sequencing run date", "MBL Supplied", "YYYY-MM-DD"],
  "User supplied metadata": ["", "User supplied metadata", "", ""],
  "env_package": ["env_package", "Environmental Package", "User supplied", ""],
  "investigation_type": ["investigation_type", "Investigation Type", "User supplied", ""],
  "sample_type": ["sample_type", "Sample Type", "User supplied", ""],
  "collection_date": ["collection_date", "Sample collection date", "User supplied", "YYYY-MM-DD"],
  "latitude": ["latitude", "Latitude (±90°)", "User supplied", "decimal degrees ±90°"],
  "longitude": ["longitude", "Longitude (±180°)", "User supplied", "decimal degrees ±180°"],
  "env_biome": ["env_biome", "Environmental Biome - Primary", "User supplied", ""],
  "biome_secondary": ["biome_secondary", "Environmental Biome - Secondary", "User supplied", ""],
  "env_feature": ["env_feature", "Environmental Feature - Primary", "User supplied", ""],
  "feature_secondary": ["feature_secondary", "Environmental Feature - Secondary", "User supplied", ""],
  "env_material": ["env_material", "Environmental Material - Primary", "User supplied", ""],
  "material_secondary": ["material_secondary", "Environmental Material - Secondary", "User supplied", ""],
  "Enter depth values in one or more categories": ["", "Enter depth values in one or more categories", "", ""],
  "depth_subseafloor": ["depth_subseafloor", "Depth below seafloor", "User supplied", "mbsf"],
  "depth_subterrestrial": ["depth_subterrestrial", "Depth below terrestrial surface", "User supplied", "meter"],
  "tot_depth_water_col": ["tot_depth_water_col", "Water column depth", "User supplied", "meter"],
  "elevation": ["elevation", "Elevation (if terrestrial)", "User supplied", "meter"],
  "dna_extraction_meth": ["dna_extraction_meth", "DNA Extraction", "User supplied", ""],
  "dna_quantitation": ["dna_quantitation", "DNA Quantitation", "User supplied", ""],
  "Enter either volume or mass": ["", "Enter either volume or mass", "", ""],
  "sample_size_vol": ["sample_size_vol", "Sample Size (volume)", "User supplied", "liter"],
  "sample_size_mass": ["sample_size_mass", "Sample Size (mass)", "User supplied", "gram"],
  "sample_collection_device": ["sample_collection_device", "Sample collection device", "User supplied", ""],
  "formation_name": ["formation_name", "Formation name", "User supplied", ""],
  "Sample handling": ["", "Sample handling", "", ""],
  "samp_store_dur": ["samp_store_dur", "Storage duration", "User supplied", "days"],
  "samp_store_temp": ["samp_store_temp", "Storage temperature", "User supplied", "degrees celsius"],
  "isol_growth_cond": ["isol_growth_cond", "Isolation and growth condition (reference)", "User supplied", "PMID, DOI or URL"],
  "Non-biological": ["", "Non-biological", "", ""],
  "ph": ["ph", "pH", "User supplied", ""],
  "temperature": ["temperature", "Temperature", "User supplied", "degrees celsius"],
  "conductivity": ["conductivity", "Conductivity", "User supplied", "mS/cm"],
  "resistivity": ["resistivity", "Resistivity", "", "ohm-meter"],
  "salinity": ["salinity", "Salinity", "", "PSU"],
  "pressure": ["pressure", "Pressure", "", "bar"],
  "redox_state": ["redox_state", "Redox state", "", ""],
  "redox_potential": ["redox_potential", "Redox potential", "", "millivolt"],
  "diss_oxygen": ["diss_oxygen", "Dissolved oxygen", "", "µmol/kg"],
  "diss_hydrogen": ["diss_hydrogen", "Dissolved hydrogen", "", "µmol/kg"],
  "diss_org_carb": ["diss_org_carb", "Dissolved organic carbon", "", "µmol/kg"],
  "diss_inorg_carb": ["diss_inorg_carb", "Dissolved inorganic carbon", "", "µmol/kg"],
  "tot_org_carb": ["tot_org_carb", "Total organic carbon", "", "percent"],
  "npoc": ["npoc", "Non-purgeable organic carbon", "", "µmol/kg"],
  "tot_inorg_carb": ["tot_inorg_carb", "Total inorganic carbon", "", "percent"],
  "tot_carb": ["tot_carb", "Total carbon", "", "percent"],
  "carbonate": ["carbonate", "Carbonate", "", "µmol/kg"],
  "bicarbonate": ["bicarbonate", "Bicarbonate", "", "µmol/kg"],
  "silicate": ["silicate", "Silicate", "", "µmol/kg"],
  "del180_water": ["del180_water", "Delta 180 of water", "", "parts per mil"],
  "part_org_carbon_del13c": ["part_org_carbon_del13c", "Delta 13C for particulate organic carbon", "", "parts per mil"],
  "diss_inorg_carbon_del13c": ["diss_inorg_carbon_del13c", "Delta 13C for dissolved inorganic carbon", "", "parts per mil"],
  "methane_del13c": ["methane_del13c", "Delta 13C for methane", "", "parts per mil"],
  "alkalinity": ["alkalinity", "Alkalinity", "", "meq/L"],
  "calcium": ["calcium", "Calcium", "", "µmol/kg"],
  "sodium": ["sodium", "Sodium", "", "µmol/kg"],
  "ammonium": ["ammonium", "Ammonium", "", "µmol/kg"],
  "nitrate": ["nitrate", "Nitrate", "", "µmol/kg"],
  "nitrite": ["nitrite", "Nitrite", "", "µmol/kg"],
  "nitrogen_tot": ["nitrogen_tot", "Total nitrogen", "", "µmol/kg"],
  "org_carb_nitro_ratio": ["org_carb_nitro_ratio", "Carbon nitrogen ratio", "", ""],
  "sulfate": ["sulfate", "Sulfate", "", "µmol/kg"],
  "sulfide": ["sulfide", "Sulfide", "", "µmol/kg"],
  "sulfur_tot": ["sulfur_tot", "Total sulfur", "", "µmol/kg"],
  "chloride": ["chloride", "Chloride", "", "µmol/kg"],
  "phosphate": ["phosphate", "Phosphate", "", "µmol/kg"],
  "potassium": ["potassium", "Potassium", "", "µmol/kg"],
  "iron": ["iron", "Total iron", "", "µmol/kg"],
  "iron_ii": ["iron_ii", "Iron II", "", "µmol/kg"],
  "iron_iii": ["iron_iii", "Iron III", "", "µmol/kg"],
  "magnesium": ["magnesium", "Magnesium", "", "µmol/kg"],
  "manganese": ["manganese", "Manganese", "", "µmol/kg"],
  "methane": ["methane", "Methane", "", "µmol/kg"],
  "noble_gas_chemistry": ["noble_gas_chemistry", "Noble gas chemistry", "", ""],
  "trace_element_geochem": ["trace_element_geochem", "Trace element geochemistry", "", ""],
  "porosity": ["porosity", "Porosity", "", "percent"],
  "rock_age": ["rock_age", "Sediment or rock age", "", "millions of years (Ma)"],
  "water_age": ["water_age", "Water age", "", "thousands of years (ka)"],
  "Biological": ["", "Biological", "", ""],
  "microbial_biomass_microscopic": ["microbial_biomass_microscopic", "Microbial biomass - total cell counts", "", "cells/g"],
  "n_acid_for_cell_cnt": ["n_acid_for_cell_cnt", "NA dyes used for total cell counts", "", ""],
  "microbial_biomass_fish": ["microbial_biomass_fish", "FISH-based cell counts", "", "cells/g"],
  "fish_probe_name": ["fish_probe_name", "Name of FISH probe", "", ""],
  "fish_probe_seq": ["fish_probe_seq", "Sequence of FISH probe", "", ""],
  "intact_polar_lipid": ["intact_polar_lipid", "Intact polar lipid", "", "pg/g"],
  "microbial_biomass_qpcr": ["microbial_biomass_qpcr", "qPCR and primers used", "", "gene copies"],
  "biomass_wet_weight": ["biomass_wet_weight", "Biomass - wet weight", "", "gram"],
  "biomass_dry_weight": ["biomass_dry_weight", "Biomass - dry weight", "", "gram"],
  "plate_counts": ["plate_counts", "Plate counts - colony forming", "", "CFU/ml"],
  "functional_gene_assays": ["functional_gene_assays", "functional gene assays", "", ""],
  "clone_library_results": ["clone_library_results", "clone library results", "", ""],
  "enzyme_activities": ["enzyme_activities", "enzyme activities", "", ""],
  "User-added": ["", "User-added", "", ""]
};

// duplicate in metadata.js!
constants_metadata.ORDERED_METADATA_NAMES = [
  ["structured comment name", "Parameter", "", ""], //MBL Supplied or Optional
  ["", "General", "", ""],
  // ["project","VAMPS project name","MBL Supplied", ""],
  ["sample_name", "Sample ID (user sample name)", "User supplied", ""],
  ["dataset", "VAMPS dataset name", "MBL Supplied", ""],
  ["geo_loc_name_continental", "Country (if not international waters)", "User Supplied", ""],
  ["geo_loc_name_marine", "Longhurst Zone (if marine)", "User Supplied", ""],
  ["", "MBL generated laboratory metadata", "", ""],
  ["domain", "Domain", "MBL Supplied", ""],
  ["target_gene", "Target gene name", "MBL Supplied", "16S rRNA, mcrA, etc"],
  ["dna_region", "DNA region", "MBL Supplied", ""],
  // was sequencing_meth
  ["sequencing_platform", "Sequencing method", "MBL Supplied", ""],
  ["forward_primer", "Forward PCR Primer", "MBL Supplied", ""],
  ["reverse_primer", "Reverse PCR Primer", "MBL Supplied", ""],
  ["adapt_3letter", "Adapter name 3 letters", "MBL Supplied", ""],
  ["illumina_index", "Index sequence (for Illumina)", "MBL Supplied", ""],
  ["adapter_sequence", "Adapter sequence", "MBL Supplied", ""],
  ["run", "Sequencing run date", "MBL Supplied", "YYYY-MM-DD"],
  ["", "User supplied metadata", "", ""],
  ["env_package", "Environmental Package", "User supplied", ""],
  ["investigation_type", "Investigation Type", "User supplied", ""],
  ["sample_type", "Sample Type", "User supplied", ""],
  ["collection_date", "Sample collection date", "User supplied", "YYYY-MM-DD"],
  ["latitude", "Latitude (±90°)", "User supplied", "decimal degrees ±90°"],
  ["longitude", "Longitude (±180°)", "User supplied", "decimal degrees ±180°"],
  ["env_biome", "Environmental Biome - Primary", "User supplied", ""],
  ["biome_secondary", "Environmental Biome - Secondary", "User supplied", ""],
  ["env_feature", "Environmental Feature - Primary", "User supplied", ""],
  ["feature_secondary", "Environmental Feature - Secondary", "User supplied", ""],
  ["env_material", "Environmental Material - Primary", "User supplied", ""],
  ["material_secondary", "Environmental Material - Secondary", "User supplied", ""],
  ["", "Enter depth values in one or more categories", "", ""],
  ["depth_subseafloor", "Depth below seafloor", "User supplied", "mbsf"],
  ["depth_subterrestrial", "Depth below terrestrial surface", "User supplied", "meter"],
  // ["depth_in_core","Depth within core","User supplied", "cm"],
  ["tot_depth_water_col", "Water column depth", "User supplied", "meter"],
  ["elevation", "Elevation (if terrestrial)", "User supplied", "meter"],
  ["dna_extraction_meth", "DNA Extraction", "User supplied", ""],
  ["dna_quantitation", "DNA Quantitation", "User supplied", ""],
  ["", "Enter either volume or mass", "", ""],
  ["sample_size_vol", "Sample Size (volume)", "User supplied", "liter"],
  ["sample_size_mass", "Sample Size (mass)", "User supplied", "gram"],
  ["sample_collection_device", "Sample collection device", "User supplied", ""],
  ["formation_name", "Formation name", "User supplied", ""],
  ["", "Sample handling", "", ""],
  ["samp_store_dur", "Storage duration", "User supplied", "days"],
  ["samp_store_temp", "Storage temperature", "User supplied", "degrees celsius"],
  ["isol_growth_cond", "Isolation and growth condition (reference)", "User supplied", "PMID, DOI or URL"],
  ["", "Non-biological", "", ""],
  ["ph", "pH", "User supplied", ""],
  ["temperature", "Temperature", "User supplied", "degrees celsius"],
  ["conductivity", "Conductivity", "User supplied", "mS/cm"],
  ["resistivity", "Resistivity", "", "ohm-meter"],
  ["salinity", "Salinity", "", "PSU"],
  //It is measured in unit of PSU (Practical Salinity Unit), which is a unit based on the properties of sea water conductivity. It is equivalent to per thousand or (o/00) or to  g/kg.
  ["pressure", "Pressure", "", "bar"],
  ["redox_state", "Redox state", "", ""],
  ["redox_potential", "Redox potential", "", "millivolt"],
  ["diss_oxygen", "Dissolved oxygen", "", "µmol/kg"],
  ["diss_hydrogen", "Dissolved hydrogen", "", "µmol/kg"],
  ["diss_org_carb", "Dissolved organic carbon", "", "µmol/kg"],
  ["diss_inorg_carb", "Dissolved inorganic carbon", "", "µmol/kg"],
  ["tot_org_carb", "Total organic carbon", "", "percent"],
  ["npoc", "Non-purgeable organic carbon", "", "µmol/kg"],
  ["tot_inorg_carb", "Total inorganic carbon", "", "percent"],
  ["tot_carb", "Total carbon", "", "percent"],
  ["carbonate", "Carbonate", "", "µmol/kg"],
  ["bicarbonate", "Bicarbonate", "", "µmol/kg"],
  ["silicate", "Silicate", "", "µmol/kg"],
  ["del180_water", "Delta 180 of water", "", "parts per mil"],
  ["part_org_carbon_del13c", "Delta 13C for particulate organic carbon", "", "parts per mil"],
  ["diss_inorg_carbon_del13c", "Delta 13C for dissolved inorganic carbon", "", "parts per mil"],
  ["methane_del13c", "Delta 13C for methane", "", "parts per mil"],
  ["alkalinity", "Alkalinity", "", "meq/L"],
  ["calcium", "Calcium", "", "µmol/kg"],
  ["sodium", "Sodium", "", "µmol/kg"],
  ["ammonium", "Ammonium", "", "µmol/kg"],
  ["nitrate", "Nitrate", "", "µmol/kg"],
  ["nitrite", "Nitrite", "", "µmol/kg"],
  ["nitrogen_tot", "Total nitrogen", "", "µmol/kg"],
  ["org_carb_nitro_ratio", "Carbon nitrogen ratio", "", ""],
  ["sulfate", "Sulfate", "", "µmol/kg"],
  ["sulfide", "Sulfide", "", "µmol/kg"],
  ["sulfur_tot", "Total sulfur", "", "µmol/kg"],
  ["chloride", "Chloride", "", "µmol/kg"],
  ["phosphate", "Phosphate", "", "µmol/kg"],
  ["potassium", "Potassium", "", "µmol/kg"],
  ["iron", "Total iron", "", "µmol/kg"],
  ["iron_ii", "Iron II", "", "µmol/kg"],
  ["iron_iii", "Iron III", "", "µmol/kg"],
  ["magnesium", "Magnesium", "", "µmol/kg"],
  ["manganese", "Manganese", "", "µmol/kg"],
  ["methane", "Methane", "", "µmol/kg"],
  ["noble_gas_chemistry", "Noble gas chemistry", "", ""],
  ["trace_element_geochem", "Trace element geochemistry", "", ""],
  ["porosity", "Porosity", "", "percent"],
  ["rock_age", "Sediment or rock age", "", "millions of years (Ma)"],
  ["water_age", "Water age", "", "thousands of years (ka)"],
  ["", "Biological", "", ""],
  ["microbial_biomass_microscopic", "Microbial biomass - total cell counts", "", "cells/g"],
  ["n_acid_for_cell_cnt", "NA dyes used for total cell counts", "", ""],
  ["microbial_biomass_fish", "FISH-based cell counts", "", "cells/g"],
  ["fish_probe_name", "Name of FISH probe", "", ""],
  ["fish_probe_seq", "Sequence of FISH probe", "", ""],
  ["intact_polar_lipid", "Intact polar lipid", "", "pg/g"],
  ["microbial_biomass_qpcr", "qPCR and primers used", "", "gene copies"],
  // ["microbial_biomass_platecounts","Microbial biomass - plate counts - cell numbers","", ""],
  // ["microbial_biomass_avg_cell_number","Microbial biomass - other","", ""],
  ["biomass_wet_weight", "Biomass - wet weight", "", "gram"],
  ["biomass_dry_weight", "Biomass - dry weight", "", "gram"],
  ["plate_counts", "Plate counts - colony forming", "", "CFU/ml"],
  ["functional_gene_assays", "functional gene assays", "", ""],
  ["clone_library_results", "clone library results", "", ""],
  ["enzyme_activities", "enzyme activities", "", ""],
  ["", "User-added", "", ""]
];

constants_metadata.ORDERED_METADATA_DIVIDERS = ["Biological",
  "Enter depth values in one or more categories",
  "Enter either volume or mass",
  "General",
  "MBL generated laboratory metadata",
  "Please fill in",
  "Non-biological",
  "Parameter",
  "Sample handling",
  "User supplied metadata",
  "User-added"
];

// --- fields for CSV files (3) ---
// 1
constants_metadata.METADATA_FIELDS_FOR_PIPELINE_PROCESSING_INPUT_CSV = ["adaptor",
  "amp_operator",
  "barcode",
  "barcode_index",
  "data_owner",
  "dataset",
  "dataset_description",
  "dna_region",
  "email",
  "env_sample_source_id",
  "first_name",
  "funding",
  "insert_size",
  "institution",
  "lane",
  "last_name",
  "overlap",
  "platform",
  "primer_suite",
  "project",
  "project_description",
  "project_title",
  "read_length",
  "run",
  "run_key",
  "seq_operator",
  "tubelabel"
];

// 2
constants_metadata.METADATA_EMPTY_TEMPLATE_CSV = [["structured_comment_name","Metadata name"],
  ["","","Information by project"],
  ["project_title","Title of Project"],
  ["project","VAMPS project name"],
  ["pi_name","PI Name"],
  ["pi_email","PI email address"],
  ["project_abstract","Project abstract"],
  ["reference","References for selected manuscripts published that describe the location"],
  ["","","Information by sample (dataset)"],
  ["sample_num","Sample Number",1],
  ["sample_name","Sample ID (user sample name)"],
  ["dataset_description","Dataset description"],
  ["tube_label","Tube label"],
  ["sample_concentration","Sample concentration"],
  ["dna_quantitation","DNA Quantitation"],
  ["env_package","Environmental Package"],
  ["dataset","VAMPS dataset name"],
  ["geo_loc_name_continental","Country (if not international waters)"],
  ["geo_loc_name_marine","Longhurst Zone (if marine)"],
  ["domain","Domain"],
  ["target_gene","Target gene name"],
  ["dna_region","DNA region"],
  ["sequencing_platform","Sequencing method"],
  ["forward_primer","Forward PCR Primer"],
  ["reverse_primer","Reverse PCR Primer"],
  ["illumina_index","Index sequence (for Illumina)"],
  ["adapter_sequence","Adapter sequence"],
  ["run","Sequencing run date"],
  ["investigation_type","Investigation Type"],
  ["sample_type","Sample Type"],
  ["collection_date","Sample collection date"],
  ["latitude","Latitude (±90°)"],
  ["longitude","Longitude (±180°)"],
  ["env_biome","Environmental Biome - Primary"],
  ["biome_secondary","Environmental Biome - Secondary"],
  ["env_feature","Environmental Feature - Primary"],
  ["feature_secondary","Environmental Feature - Secondary"],
  ["env_material","Environmental Material - Primary"],
  ["material_secondary","Environmental Material - Secondary"],
  ["depth_subseafloor","Depth below seafloor"],
  ["depth_subterrestrial","Depth below terrestrial surface"],
  ["tot_depth_water_col","Water column depth"],
  ["elevation","Elevation (if terrestrial)"],
  ["dna_extraction_meth","DNA Extraction"],
  ["sample_size_vol","Sample Size (volume)"],
  ["sample_size_mass","Sample Size (mass)"],
  ["sample_collection_device","Sample collection device"],
  ["formation_name","Formation name"],
  ["samp_store_dur","Storage duration"],
  ["samp_store_temp","Storage temperature"],
  ["isol_growth_cond","Isolation and growth condition (reference)"],
  ["ph","pH"],
  ["temperature","Temperature"],
  ["conductivity","Conductivity"],
  ["resistivity","Resistivity"],
  ["salinity","Salinity"],
  ["pressure","Pressure"],
  ["redox_state","Redox state"],
  ["redox_potential","Redox potential"],
  ["diss_oxygen","Dissolved oxygen"],
  ["diss_hydrogen","Dissolved hydrogen"],
  ["diss_org_carb","Dissolved organic carbon"],
  ["diss_inorg_carb","Dissolved inorganic carbon"],
  ["tot_org_carb","Total organic carbon"],
  ["npoc","Non-purgeable organic carbon"],
  ["tot_inorg_carb","Total inorganic carbon"],
  ["tot_carb","Total carbon"],
  ["carbonate","Carbonate"],
  ["bicarbonate","Bicarbonate"],
  ["silicate","Silicate"],
  ["del180_water","Delta 180 of water"],
  ["part_org_carbon_del13c","Delta 13C for particulate organic carbon"],
  ["diss_inorg_carbon_del13c","Delta 13C for dissolved inorganic carbon"],
  ["methane_del13c","Delta 13C for methane"],
  ["alkalinity","Alkalinity"],
  ["calcium","Calcium"],
  ["sodium","Sodium"],
  ["ammonium","Ammonium"],
  ["nitrate","Nitrate"],
  ["nitrite","Nitrite"],
  ["nitrogen_tot","Total nitrogen"],
  ["org_carb_nitro_ratio","Carbon nitrogen ratio"],
  ["sulfate","Sulfate"],
  ["sulfide","Sulfide"],
  ["sulfur_tot","Total sulfur"],
  ["chloride","Chloride"],
  ["phosphate","Phosphate"],
  ["potassium","Potassium"],
  ["iron","Total iron"],
  ["iron_ii","Iron II"],
  ["iron_iii","Iron III"],
  ["magnesium","Magnesium"],
  ["manganese","Manganese"],
  ["methane","Methane"],
  ["noble_gas_chemistry","Noble gas chemistry"],
  ["trace_element_geochem","Trace element geochemistry"],
  ["porosity","Porosity"],
  ["rock_age","Sediment or rock age"],
  ["water_age","Water age"],
  ["microbial_biomass_microscopic","Microbial biomass - total cell counts"],
  ["n_acid_for_cell_cnt","NA dyes used for total cell counts"],
  ["microbial_biomass_fish","FISH-based cell counts"],
  ["fish_probe_name","Name of FISH probe"],
  ["fish_probe_seq","Sequence of FISH probe"],
  ["intact_polar_lipid","Intact polar lipid"],
  ["microbial_biomass_qpcr","qPCR and primers used"],
  ["biomass_wet_weight","Biomass - wet weight"],
  ["biomass_dry_weight","Biomass - dry weight"],
  ["plate_counts","Plate counts - colony forming"],
  ["functional_gene_assays","functional gene assays"],
  ["clone_library_results","clone library results"],
  ["enzyme_activities","enzyme activities"]
];

// 3 created from form
constants_metadata.METADATA_CSV_FROM_FORM = ["npoc", "access_point_type", "adapter_sequence", "alkalinity", "ammonium", "bicarbonate", "env_biome", "biome_secondary", "calcium", "carbonate", "chloride", "clone_library_results", "collection_date", "conductivity", "dataset", "dataset_description", "dataset_id", "del180_water", "depth_in_core", "depth_subseafloor", "depth_subterrestrial", "diss_hydrogen", "diss_inorg_carb", "diss_inorg_carbon_del13c", "diss_org_carb", "diss_oxygen", "dna_extraction_meth", "dna_quantitation", "dna_region", "domain", "elevation", "env_package", "enzyme_activities", "env_feature", "fish_probe_name", "fish_probe_seq", "feature_secondary", "formation_name", "forward_primer", "functional_gene_assays", "geo_loc_name_continental", "geo_loc_name_marine", "illumina_index", "intact_polar_lipid", "investigation_type", "iron", "iron_ii", "iron_iii", "isol_growth_cond", "latitude", "longitude", "magnesium", "manganese", "env_material", "material_secondary", "methane", "methane_del13c", "microbial_biomass_fish", "microbial_biomass_microscopic", "microbial_biomass_qpcr", "nitrate", "nitrite", "nitrogen_tot", "noble_gas_chemistry", "org_carb_nitro_ratio", "ph", "part_org_carbon_del13c", "phosphate", "pi_email", "pi_name", "plate_counts", "porosity", "potassium", "pressure", "project", "project_abstract", "project_title", "redox_potential", "redox_state", "reference", "resistivity", "reverse_primer", "rock_age", "run", "salinity", "sample_collection_device", "samp_store_dur", "samp_store_temp", "sample_name", "sample_size_mass", "sample_size_vol", "sample_type", "sequencing_meth", "silicate", "sodium", "sulfate", "sulfide", "sulfur_tot", "target_gene", "temperature", "tot_carb", "tot_depth_water_col", "tot_inorg_carb", "tot_org_carb", "trace_element_geochem", "water_age", "first_name", "institution", "last_name", "public", "username", "95percenct_ci_cellspermilliliter", "API Gravity", "APPX_age_Ma", "Acetate", "Ammonium", "Archaeal/Bacteria", "B_OH_4-", "Ba+2 _ppm_", "Bottom_Hole_Latitude", "Bottom_Hole_Longitude", "Br-", "Butyrate", "CO3-2", "Ca+2", "Cl-", "Cu+2", "DNA_Yield_ml_or_g", "DNA_quants", "Date", "Depth_Below_SeaFloor", "Depth_Below_SeaSurface", "Depth_Interval", "Depth_mbsf", "Dive Number or Well Name", "Formate", "GOR Single Stage Flash if available _SCF", "Glycolate", "HCO3-", "Hero Taxa-4", "Hero Taxa-5", "I-", "Item", "K+", "Location", "MBL_dna_region", "MBL_platform", "MBL_run", "MVCO_event_number", "Matrix", "Mg+2", "Mn+2", "Na+", "Ni+2", "Nitrate_nitrite", "Notes", "Oil Related Hit-1", "Oil Related Hit-2", "Oil Related Hit-3", "Pb+2", "Phosphate", "Pressure Mpa", "Pressure_Mpa", "Priority", "Propionate", "Read Count-1", "Read Count-2", "Read Count-3", "Read Count-4", "Read Count-5", "S-2", "SO4-2", "Salinity", "Sample", "Sample Depth mbsf", "Sample Type", "Sample_Number", "Si+4", "Silicate", "Site_Name", "Sr+2", "TVD_Below_SeaFloor", "Temperature", "Temperature_C_", "V+2", "Valerate", "Water Depth m", "Water_Depth", "Zn+2", "a260_280", "a260_280_2", "absolute_depth_beta", "acetate", "achnanthes_sp", "acid_neutr_cap", "actinoptychus_senarius", "ag", "age", "age_in_years", "air_temperature", "airflowvelocitympersec", "al", "alexandrium_fundyense", "alexandrium_ostenfeldii", "alkaline_phospatase_activity", "alkaline_phospatase_km", "alkaline_phospatase_vmax", "alpha glucosidase activity", "alpha_glucosidase_activity", "alt_elev", "altitude", "aminopeptidase activity", "aminopeptidase_activity", "aminopeptidase_average", "aminopeptidase_se", "ammonium_nh4", "amount or size of sa", "amphidinium_sp", "amylax_triacantha", "anabaeana_sp", "aphanizomenon_sp", "app_oxygen_utilization", "apparent_oxygen_utilization", "arc_lib_reads_seqd", "arch_production", "area", "argon", "arsenic", "as", "asterionellopsis_glacialis", "atm_press", "au", "b", "ba", "bac_lib_reads_seqd", "bact_cell_count", "bact_cell_count_micro", "bact_cell_count_se", "bact_production", "bact_production_unfiltered", "bacteria", "bacterial abundance", "bacterial production", "bacterial production from unfiltered sample", "bacterial_carbon_average", "bacterial_carbon_se", "bacterialcellsperm3", "bafc", "barcode", "barcode_index", "batch_no", "be", "benzene", "beta glucosidase activity", "beta_glucosidase_activity", "beta_glucosidase_average", "beta_glucosidase_se", "bi", "borehole_depth", "boron", "br", "brachionus_sp_", "butane", "c", "c14", "c37:2", "c37:3", "c37:4", "c37total", "ca", "calcium_carbonate", "calcium_carbonate_caco3", "calcium_mg/l_", "calcium_ppm_", "calfid", "carb_dioxide", "carbon_14", "carbon_dioxide", "carotenoids", "cbafc", "cd", "ce", "cell_high_dna", "cells", "center_name", "center_project_name", "centric_diatoms", "cerataulina_pelagica", "ceratium_fusus", "ceratium_kofoidii", "ceratium_lineatum", "ceratium_longipes", "ceratium_tripos", "chaetoceros_compressus", "chaetoceros_convolutus", "chaetoceros_debilis", "chaetoceros_decipiens", "chaetoceros_lorenzianus", "chaetoceros_simplex", "chaetoceros_socialis", "chaetoceros_sp", "chatonella_sp", "chitinase_average", "chitinase_se", "chl-a", "chla", "chla-mg/l", "chloride_mg/l_", "chlorophyll", "chlorophyll__ctd_", "chlorophyll_a", "chlorophyll_plus_phaeopigments", "chlorophyll_total", "chlorophyllide-a", "cl", "clay_inf4_micron", "co", "collection date", "collection_time", "core_depth__1-2_cm_-_cold_sediment", "core_depth__1-2_cm_-_orange_mat", "core_depth__1-2_cm__cold_sediment", "core_depth__1-2_cm__orange_mat", "corethron_criophilum", "coscinodiscus_sp", "cr", "cs", "ctd oxygen", "ctd pressure", "ctd temperature", "ctd transmission", "ctdoxy", "ctdprs", "ctdsal", "ctdtmp", "cu", "cyanobacteria_cyto", "cylindrotheca_closterium", "dactyliosolen_fragilissimus", "date", "decimal_time", "del18o_water", "density", "density_gamma_epsilon", "density_gamma_theta", "depth", "depth_category", "depth_end", "depth_start", "detonula_confervacea", "dgge_richness", "diatoms", "dictyocha_fibula", "dictyocha_speculum", "dinobryon_sp", "dinoflagellate_cells", "dinophysis_acuminata", "dinophysis_acuta", "dinophysis_norvegica", "dinosphysis_sp", "diss_inorg_carbon", "diss_inorg_nitro", "diss_org_nitro", "diss_org_phosp", "diss_oxygen_mg/l_", "dissolved_inorganic_carbon", "dissolved_iron_fe_ii", "dissolved_organic_carbon", "dissolved_organic_nitrogen", "dissolved_organic_phosphorus", "dissolved_oxygen2", "dissolved_oxygen_ctd", "distance_from_shore", "ditylum_brightwellii", "dna_extracted", "doc", "dry_dna", "dy", "ebria_tripartita", "electron_transport_system__potential_respiration_", "emp_status", "environmental packag", "er", "ethane", "eu", "eucampia_zodiacus", "eucaryotic phytoplankton cells", "eucaryotic picoplankton cells", "euglenophyceae", "euk_cell_count", "euk_lib_reads_seqd", "exact_depth", "experimen_location", "experiment_center", "experiment_design_description", "experiment_title", "experimental factor", "fecal_coliform", "flagel_cell_count", "fluor", "fluorescence", "fluoride", "fluoroprobe_chlorophytes", "fluoroprobe_cryptophytes", "fluoroprobe_cyanobacteria", "fluoroprobe_diatoms", "fphaeo-a chch", "fragment_size", "fwd_primer", "ga", "gamma_epsilon", "gamma_theta", "gd", "ge", "geographic location", "gonyaulax_digitale", "gonyaulax_spinifera", "grain_size_125-63_micron", "grain_size_250-125_micron", "grain_size_500-250_micron", "grain_size_sup500_micron", "gravel", "guinardia_delicatula", "guinardia_flaccida", "guinardia_striata", "gymnodinium_sp", "gyrodinium_sp", "gyrosigma_fasciola", "gyrosigma_tennuissimum", "helicostomella_sp_", "helicotheca_tamesis", "heterocapsa_triquetra", "heterotrophic bacteria", "hf", "hg", "hna", "ho", "hplc-19-but", "hplc-19-hex", "hplc-allox", "hplc-chl-b", "hplc-chl-c2", "hplc-chlorophyllide-a", "hplc-dvchl-a", "hplc-peridinin", "hplc-phaeophorb-a", "hplc-phaeophyt-a", "hplc-prasin", "humidity", "hydrogen", "hydrogen_sulfide", "hydrogen_sulfide_h2s", "i", "i_butane", "illumina_technology", "in", "instrument_model", "investigation type", "ir", "iron_II_dissolved", "iron_II_total", "iron_fe", "irradiance", "isobutane", "la", "lat_lon", "lauderia_annulata", "leptocylindrus_danicus", "leptocylindrus_minimus", "leucine", "leucine-aminopeptidase_activity", "leucine-aminopeptidase_km", "leucine-aminopeptidase_vmax", "li", "lib_reads_seqd", "library construction", "library reads sequen", "library_construction_protocol", "licmophora_abbreviata", "light_ext_coeff", "linker", "lipase_average", "lipase_se", "lithium", "lithology", "litostomatea", "local_time", "lter_station_name", "lu", "magnesium_ppm_", "manganese_mn", "manganese_ug/l_", "melosira_sp", "methane _bottom water_", "methane oxidation depth integrated 0-10", "methane_ch4", "methane_oxidation_rate", "methane_turnover", "microbial biomass _average cell numbers_", "microbial_biomass_avg_cell_number", "microbial_biomass_for_dna_extract", "microbial_biomass_intactpolarlipid", "microbial_biomass_platecounts", "microbial_biomass_std_deviation", "microeukaryote_cells__>_5_micrometers_", "minuscula_bipes", "ml_or_g", "mo", "mud_average", "mud_sd", "myrionecta_rubrum", "n_butane", "nanodrop", "nanodrop_2", "navicula_sp_", "nb", "nd", "nh4", "nh4um/l", "ni", "nitrate + nitrite nitrogen_no3-n_", "nitrate _no3_", "nitrate+nitrate", "nitrate__no3__and_nitrite__no2_", "nitrate_no3", "nitrate_no3_nitrite_no2", "nitrate_nodc_annual", "nitrate_nodc_monthly", "nitrite _no2_", "nitrite_no2", "nitrite_plus_nitrate", "nitrogen", "nitrogen_minus_nitrite", "no2no3", "non_thecate_dinoflagellate_", "non_thecate_dinoflagellates", "nucleic acid extract", "o2_seapoint", "odontella_sinensis", "odontells_regia", "only gcs: methane oxidation rate at dna", "only gcs: sulfate reduction rate at dna", "optical back scatter", "optical_back_scatter", "organism_count", "os", "oxygen", "oxygen_pct", "p", "pH", "par_irradiance", "part_carb", "part_carb_ug/l_", "part_nitro", "part_nitro_ug/l_", "part_org_carb", "part_org_carv", "part_org_nitro", "part_phosp", "pb", "pcr conditions", "pcr primers", "pcr_primers", "pd", "pennate_diatoms", "pentane", "perc_core_recovered", "percent_oxygen", "ph_of_mud_pool", "phaeocystis_spp", "phaeophytine_a", "phaeopigments", "phosphatase activity", "phosphatase_activity", "phosphatase_average", "phosphatase_se", "phosphate_po4", "physical_specimen_remaining", "picoeukaryotes", "plate counts on m3-ch3oh", "plate counts on m3-nh4cl+vitamines", "plate counts on marine agar", "platform", "pleurosigma/gyrosigma", "pleurosigma_angulatum", "pleurosigma_angulatum_var_strigosa", "po4", "po4ug/l", "poc", "poc-mg/m3", "pon", "potassium_ppm_", "potential_acetate_methanogenesis", "potential_bicarbonate_methanogenesis", "potential_sulphate_reduction", "pr", "precipitation", "primer", "primerSuite", "prochlorococcus", "project name", "propane", "prorocentrum_micans", "prorocentrum_minimum", "protoperidinium_brevipes", "protoperidinium_sp", "pseudo-nitschia_seriata-group", "pseudo-nitzschia_delicatissima_group", "pseudo-nitzschia_sp", "pseudo-nitzschia_sp_", "pseudoanabaeana_sp", "pt", "quality assurance / quality control meth", "quality_method", "rb", "re", "rel_to_oxygen", "relevant electronic", "relevant standard op", "rev_primer", "rh", "rhizoselenia_hebetata", "rhizoselenia_setigera", "ru", "run_center", "run_date", "run_key", "run_prefix", "s", "sal", "salinity_at_bottom", "salinity_ppt", "samp_size", "sample collection de", "sample_center", "sample_volume", "sample_weight", "sampleid", "sampling_date", "sand", "sand_average", "sand_sd", "sb", "sc", "scrippsiella_sp_", "scrippsiella_trochoidea", "se", "secchi", "secchi_depth", "sediment_chlorophyll_a_average", "sediment_depth_end", "sediment_depth_start", "sediment_phaeopigments_average", "seq_count", "sequence quality che", "shannon_index", "si", "sigma-theta", "silicate _sio4_", "silicate__sio2_", "silicate_sio4", "silicon", "silt_4-63_micron", "silt_clay", "skeletonema_costatum", "sm", "sn", "sodium_mg/l_", "sodium_ppm_", "soil_ch4_flux", "soil_co2_flux", "specific_conductance", "sr", "string_depth", "study_center", "sulfate reduction depth integrated 0-10", "sulfate_so4", "sulfide_s2", "suspend_sediment", "synechococcus", "ta", "target gene", "target subfragment", "target_depth", "target_subfragment", "tb", "tds", "te", "temp", "temperature_at_the_time_of_sampling", "temperature_avg", "temperature_bottom", "temperature_ctd", "temperature_maximum", "temperature_nodc_annual", "th", "thalassiosira_august-lineata", "thalassiosira_gravida", "thalassiosira_nordenskioeldii", "thalassiosira_sp", "thaloassionema_nitzschioides", "thecate_dinoflagellates", "thecate_dinoflagellates_lt_20_micrometers", "thecate_dinoflagellates_lt_20um", "theta_pot_temp", "thymidine", "thymidine_uptake", "ti", "time", "time_utc", "tl", "tm", "tot_diss_nitro", "tot_diss_phos", "tot_diss_phosp", "tot_nitro", "tot_org_matter", "tot_org_matter_avg", "tot_phos", "tot_phosp", "tot_suspend_solids", "total chlorophyll", "total_cell_count", "total_nitrogen", "total_organic_carbon", "total_organic_nitrogen", "total_phosphorus", "total_weight", "transparency", "turbidity", "u", "v", "visit_date", "vol_filtered", "volume_filtered", "w", "water_average", "water_sd", "wind_speed", "y", "yb", "zn", "zr"
];

// see metadata.js
// constants_metadata.METADATA_DROPDOWN_FIELDS = ["biome_secondary",
//   "dna_extraction_meth",
//   "env_biome",
//   "env_feature",
//   "env_material",
//   "env_package",
//   "feature_secondary",
//   "investigation_type",
//   "material_secondary",
//   "sample_type"
// ];

// --- Options ---
constants_metadata.MY_DNA_EXTRACTION_METH_OPTIONS = ["Please choose one",
  "CTAB Phenol-chloroform",
  "Hot alkaline extraction",
  "MP Biomedical Fast DNA",
  "MP Biomedical Fast DNA Spin Kit for Soil",
  "Mo Bio/Qiagen PowerBiofilm",
  "Mo Bio/Qiagen PowerMax Soil",
  "Mo Bio/Qiagen PowerSoil",
  "Mo Bio/Qiagen PowerWater",
  "Mo Bio/Qiagen UltraClean Microbial",
  "Other",
  "Phenol-chloroform",
  "Qiagen Genomic DNA lysis buffer",
  "SDS Phenol-chloroform"];

constants_metadata.DNA_QUANTITATION_OPTIONS = ["Please choose one",
  "Fluorescent Microspheres",
  "NanoDrop",
  "NanoQuant",
  "Perfluorocarbon Tracers",
  "PicoGreen",
  "Qubit",
  "Other"];

// "subseafloor",
// "subterrestrial",

constants_metadata.BIOME_PRIMARY = ["Please choose one",
  "marine biome",
  "terrestrial biome"];

constants_metadata.FEATURE_PRIMARY = ["Please choose one",
  "aquifer",
  "borehole",
  "cave",
  "enrichment",
  "geological fracture",
  "geyser",
  "hydrothermal vent",
  "lake",
  "mine",
  "ocean trench",
  "reservoir",
  "seep",
  "spring",
  "volcano",
  "well"];

constants_metadata.MATERIAL_PRIMARY = ["Please choose one",
  "biofilm",
  "fluid",
  "microbial mat material",
  "mud",
  "oil",
  "rock",
  "sand",
  "sediment",
  "soil",
  "water"];

// "misc natural or artificial environment" = miscellaneous_natural_or_artificial_environment

constants_metadata.DCO_ENVIRONMENTAL_PACKAGES = ["Please choose one",
  "miscellaneous_natural_or_artificial_environment",
  "microbial_mat/biofilm",
  "plant_associated",
  "sediment",
  "soil",
  "water"];

constants_metadata.INVESTIGATION_TYPE = [["Please choose one", "Please choose one"],
  ["mimarks-survey", "marker gene from whole community (e.g. 16S survey)"],
  ["mimarks-specimen", "marker gene from single organism (e.g. culture)"],
  ["metagenome", "whole metagenome survey"],
  ["bacteria_archaea", "genome from bacterial or archaeal origin"],
  ["eukaryote", "genome from eukaryotic origin"],
  ["plasmid", ""],
  ["virus", ""],
  ["organelle", ""]];

constants_metadata.SAMPLE_TYPE = ["Please choose one",
  "control",
  "enrichment",
  "environmental sample",
  "isolate"];

constants_metadata.GAZ_SPELLING = {"United States": ["usa", "us", "united states", "united states of america"]};

// TODO: remove everywhere, use name normalization instead
constants_metadata.PACKAGES_AND_PORTALS = {
  'air': ['air'],
  'built environment': ['built_environment', 'indoor', 'MBE', 'MOBE'],
  'extreme habitat': ['extreme_habitat'],
  'host associated': ['host_associated'],
  'human associated': ['NIHHMP', 'UC', 'human-amniotic-fluid', 'human-associated', 'human-blood', 'human-gut', 'human-oral', 'human-skin', 'human-urine', 'human-vaginal'],
  'microbial mat/biofilm': ['microbial mat/biofilm', 'PSPHERE'],
  'miscellaneous natural or artificial environment': ['miscellaneous natural or artificial environment'],
  'plant associated': ['plant_associated'],
  'sediment': ['sediment'],
  'soil': ['soil'],
  'unknown': ['unknown'],
  'wastewater/sludge': ['wastewater/sludge'],
  'water': ['water', 'ICOMM', 'water-freshwater', 'water-marine'],
  'CMP': ['CMP', 'host-associated', 'water'],
  'CODL': ['CODL', 'DCO'],
  'LTER': ['LTER'],
  'PSPHERE': ['PSPHERE'],
  'UNIEUK': ['UNIEUK'],
};

constants_metadata.PACKAGES_AND_PORTALS_ALIASES = {
  "air": ["air"],
  "built_environment": ["built_environment", "built", "indoor", "mbe", "mobe"],
  "extreme_habitat": ["extreme_habitat"],
  "host_associated": ["host_associated"],
  "human_gut": ["human_gut"],
  "human_oral": ["human_oral"],
  "human_skin": ["human_skin"],
  "human_vaginal": ["human_vaginal"],
  "human_associated": ["nihhmp", "uc", "human_amniotic_fluid", "human_associated", "human_blood", "human_urine"],
  "microbial_mat_biofilm": ["microbial_mat_biofilm", "psphere"],
  "miscellaneous_natural_or_artificial_environment": ["miscellaneous_natural_or_artificial_environment"],
  "plant_associated": ["plant_associated"],
  "sediment": ["sediment"],
  "soil": ["soil"],
  "unknown": ["unknown"],
  "wastewater_sludge": ["wastewater_sludge"],
  "water": ["water", "icomm", "water_freshwater", "water_marine"],
  "cmp": ["cmp", "host_associated", "water"],
  "codl": ["codl", "dco"],
  "lter": ["lter"],
  "psphere": ["psphere"],
  "unieuk": ["unieuk"],
};

module.exports = constants_metadata;