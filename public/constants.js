const path = require("path");
const config = require('../config/config');

let constants = {};
///////////////////////////////////////////
///////////////////////////////////////////
//// DO NOT CHANGE ANYTHING BELOW HERE ////
///////////////////////////////////////////
///////////////////////////////////////////
// constants.security_levels = {
//         'admin'     : 1,    // access to all the data and administrative pages
//         'mbluser'   : 10,   // access to all the projects
//         'reguser'   : 50,   // public access plus other projects with permission
//         'guest'     : 99    // public access
//         }
constants.default_taxonomy = {name: 'silva119', curator: 'SILVA (v119)', show: 'Silva-119'};
//console.log('in constants');
//console.log(constants.default_taxonomy);
constants.dataset_count_for_visuals_max    = 1100;
constants.dataset_count_for_visuals_cutoff = 500;
constants.show_nas                         = {"raw": false, "string": "--"};  // if raw==true will show class_NA, genus_NA etc; else show string (tax table only; not biom file)
// blast dbs are in public/blast
constants.blast_dbs = ['Bv3v5', 'Bv4v5', 'Av4v5', 'Bv4', 'Bv6', 'Bv6v4', 'Av6v4', 'Av6', 'Ev9', 'Misc']; // leave 'Misc' as last item
//constants.misc_blast_dbs   = 'misc_blast' // ['Bv1v2','Bv1v4','Bv1v3','Bv2','Bv3','Av3v5','Bv3v4','Av3','Bv5v6','ITS']
constants.download_file_formats = [
  'metadata', 'pipeline_metadata', 'fasta', 'taxbytax', 'taxbyref', 'taxbyseq', 'biom', 'matrix', 'phyloseq', 'distance', 'emperor', 'pdf', 'tree', 'heatmap', 'otus', 'piecharts', 'barcharts'
];
constants.user_security_level = {
  "admin": 1,
  "mbl_user": 10,
  "dco_editor": 45,
  "regular_user": 50
};

// constants.ENV_SOURCE = {
//         10: "air",
//          20: "extreme habitat",
//         30: "host associated",
//          40: "human associated",
// 		 41: "human-skin",
// 		 42: "human-oral",
// 		 43: "human-gut",
//          44: "human-vaginal",
// 		 45: "human-amniotic-fluid",
// 		 46: "human-urine",
// 		 47: "human-blood",
// 	     50: "microbial mat/biofilm",
// 		 60: "miscellaneous_natural_or_artificial_environment",
// 		 70: "plant associated",
// 		 80: "sediment",
// 		 90: "soil/sand",
// 		 100: "unknown",
// 		 110: "wastewater/sludge",
// 		 120: "water-freshwater",
// 		 130: "water-marine",
// 		 140: "indoor"
//     };
// This is required for the simple taxonomy selection box
// should be taken from database each time (AS)
constants.DOMAINS = {
  domains: [
    {id: 10, name: "All"}, // for shotgun
    {id: 2, name: "Archaea"},
    {id: 3, name: "Bacteria"},
    {id: 4, name: "Eukarya"},
    {id: 5, name: "Organelle"},
    {id: 6, name: "Fungi"},
    {id: 1, name: "Unknown"}
  ]
};

constants.DOMAIN_REGIONS = {
  domain_regions: [
    {d_r: ['Av4', 'Av6', 'Av4v5'], domain: "Archaeal", regions: ['v4', 'v6', 'v4v5'], domain_show: "Archaea"},
    {d_r: ['Bv4', 'Bv6', 'Bv4v5'], domain: "Bacterial", regions: ['v4', 'v6', 'v4v5'], domain_show: "Bacteria"},
    {
      d_r: ['Ev4', 'EHSSU', 'EHLSU'],
      domain: "Eukaryal",
      regions: ['v4', 'v4_hap_HSSU', 'v4_hap_HLSU'],
      domain_show: "Eukarya"
    },
    {d_r: ["ITS1"], domain: "Fungal", regions: ['ITS1'], domain_show: "Eukarya"},
    {d_r: ["Sgun"], domain: "Shotgun", regions: [''], domain_show: "All"},
  ]
};

constants.TARGET_GENE = [{domain: "Eukarya", target_gene: ["18s", "ITS"]}, {domain: "Fungi", target_gene: ["ITS"]}, {
  domain: "Archaea",
  target_gene: ["16s"]
}, {domain: "Bacteria", target_gene: ["16s"]},
  {domain: "All", target_gene: ["metagenome", "genome"] }];

constants.TARGETS = ["Av3", "Av3v5", "Av4", "Av4v5", "Av5v6", "Av6", "Av6v4",
  "Bv1v2", "Bv1v3", "Bv1v4", "Bv2", "Bv3", "Bv3v4", "Bv3v5", "Bv4", "Bv4v5", "Bv5", "Bv5v6", "Bv6", "Bv6v4",
  "Ev4", "Ev9", "ITS1"];

constants.UNITSELECT = {
  silva119_simple   : {
      id: 'tax_silva119_simple',
      file: 'unit_selectors/taxa_silva119_simple.html',
      name: "Taxonomy -Simple",
      subtext: 'Silva119',
      // This list from:: "SELECT DISTINCT domain FROM silva_taxonomy JOIN domain USING(domain_id)";
      domains: ["Archaea","Bacteria","Eukarya","Organelle","Unknown"]  // these should be the only selections available
    },
  silva119_custom   : {
      id: 'tax_silva119_custom',
      file: 'unit_selectors/taxa_silva119_custom.html',
      name: "Taxonomy -Custom",
      subtext: 'Silva119',
      domains: ["Archaea","Bacteria","Eukarya","Organelle","Unknown"]  // these should be the only selections available
    },
  rdp2_6_simple     : {
      id: 'tax_rdp2.6_simple',
      file: 'unit_selectors/taxa_rdp2.6.html',
      name: "Taxonomy RDP",
      subtext: 'Release 2.6',
      // This list from:: "SELECT DISTINCT domain FROM rdp_taxonomy JOIN domain USING(domain_id)";
      domains: ["Archaea","Bacteria","Eukarya","Fungi","Organelle","Unknown"] // these should be the only selections available
    },
  generic_simple    : {
      id: 'tax_generic_simple', 
      file: 'unit_selectors/taxa_generic.html', 
      name: "Generic", 
      subtext: 'matrix',
      domains: ["Archaea","Bacteria","Eukarya","Fungi","Organelle","Unknown"] // these should be the only selections available
      },
  gg_simple         : {
      id: 'tax_gg_simple',
      file: 'unit_selectors/taxa_gg_simple.html',
      name: "TODO-Taxonomy -Simple",
      subtext: 'Greengenes v13.5',
      domains:[]
    },
  gg_custom         : {
      id: 'tax_gg_custom',
      file: 'unit_selectors/taxa_gg_cust.html',
      name: "TODO-Taxonomy -Custom",
      subtext: 'Greengenes v13.5'
    },
  otus              : {id: 'otus', file: 'unit_selectors/otus.html', name: "TODO-OTUs", subtext: 'SLP'},
  med_nodes         : {id: 'med_nodes', file: 'unit_selectors/med_nodes.html', name: "TODO-MED Nodes", subtext: ''}
  
};
constants.UNIT_ASSIGNMENT_CHOICES2 = {
  'refRDP_2.12-16S': {
    taxonomy_curator: 'RDP (2.12) 16S-rRNA',
    method: 'RDP',
    reference_db: 'Default (no training)',
    availability: 'available',
    refdb: '2.12'
  },
  'refRDP_2.12-ITS': {
    taxonomy_curator: 'RDP (2.12) ITS-UNITE',
    method: 'RDP',
    reference_db: 'Default (no training)',
    availability: 'available',
    refdb: '2.12'
  },
  'refssu': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'refssu (full-length)',
    availability: 'available',
    refdb: 'refssu'
  },
  'refv1v3': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv1v3 (Bacterial)',
    availability: 'available',
    refdb: 'refv1v3'
  },
  'refv3a': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Av3 (Archaeal)',
    availability: 'available',
    refdb: 'refv3a'
  },
  'refv3': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv3 (Bacterial)',
    availability: 'available',
    refdb: 'refv3'
  },
  'refv3v5': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv3v5 (Bacterial)',
    availability: 'available',
    refdb: 'refv3v5'
  },
  'refv3v6': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv3v6 (Bacterial)',
    availability: 'available',
    refdb: 'refv3v6'
  },
  'refv4': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv4 (Bacterial)',
    availability: 'available',
    refdb: 'refv4'
  },
  'refv4v5a': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Av4v5 (Archaeal)',
    availability: 'available',
    refdb: 'refv4v5a'
  },
  'refv4v5': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv4v5 (Bacterial)',
    availability: 'available',
    refdb: 'refv4v5'
  },
  'refv4v6a': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Av4v6 (Archaeal)',
    availability: 'available',
    refdb: 'refv4v6a'
  },
  'refv4v6': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv4v6 (Bacterial)',
    availability: 'available',
    refdb: 'refv4v6'
  },
  'refv5': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv5 (Bacterial)',
    availability: 'available',
    refdb: 'refv5'
  },
  'refv5v6': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv5v6 (Bacterial)',
    availability: 'available',
    refdb: 'refv5v6'
  },
  'refv6a': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Av6 (Archaeal)',
    availability: 'available',
    refdb: 'refv6a'
  },
  'refv6': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Bv6 (Bacterial)',
    availability: 'available',
    refdb: 'refv6'
  },
  'refv9': {
    taxonomy_curator: 'SILVA (v119)',
    method: 'GAST',
    reference_db: 'Ev9 (Eukaryal)',
    availability: 'available',
    refdb: 'refv9'
  },
  'refits1': {
    taxonomy_curator: 'UNITE',
    method: 'GAST',
    reference_db: 'ITS1',
    availability: 'available',
    refdb: 'refits1'
  },
  'refGG_MAY2013': {
    taxonomy_curator: 'GreenGenes (May2013)',
    method: 'GAST',
    reference_db: 'refssu',
    availability: 'not available',
    refdb: 'GG_MAY2013'
  }
};
constants.UNIT_ASSIGNMENT_CHOICES  = {
  'RDP': {ref_db: ['16S', 'ITS']},
  'GAST': {
    ref_db: ['refssu', 'refv1v3', 'refv3a', 'refv3', 'refv3v5', 'refv3v6', 'refv4', 'refv4v5a', 'refv4v5',
      'refv4v6a', 'refv4v6', 'refv5', 'refv5v6', 'refv6a', 'refv6', 'refv9', 'refits1']
  },
  'SPINGO': {ref_db: ['RDP_11.2']},
};
constants.CONFIG_FILE              = 'INFO.config';
constants.REF_SUFFIX               = {
  "unique.nonchimeric.fa": ['v1v3', 'v1v3a', 'v3v5', 'v4v5', 'v4v6', 'v6v4', 'v4v6a', 'v6v4a', 'its1'],
  "unique": ['v3', 'v3a', 'v4', 'v5', 'v6', 'v6a', 'v9']
};
constants.REF_FULL_OPTION          = ["refits1", "refssu"];

constants.VISUALOUTPUTCHOICES = {
  choices: [
    {id: 'counts_table', show: 'Counts Table'},
    {id: 'barcharts', show: 'Counts Bar Charts'},
    {id: 'heatmap', show: 'Distance Heatmap'},
    {id: 'dendrogram', show: 'Community Dendrogram'},
    {id: 'alphadiversity', show: 'Alpha Diversity'}
  ]
};

constants.NORMALIZATIONCHOICES = {
  choices: [
    {id: 'none', brief: 'None (raw counts)', show: 'Not Normalized (default)'},
    {id: 'maximum', brief: 'Maximum (range: 0.0 - maxSampleCount)', show: 'Normalized to the Maximum Sample'},
    {id: 'frequency', brief: 'Frequency (range: 0.0 - 1.0)', show: 'Normalized to Frequency'}
  ]
};


constants.DISTANCECHOICES = {
  choices: [


    {id: 'jaccard', show: 'Jaccard'},
    {id: 'kulczynski', show: 'Kulczynski'},
    {id: 'canberra', show: 'Canberra'},
    {id: 'morisita_horn', show: 'Morisita-Horn'},
    {id: 'bray_curtis', show: 'Bray-Curtis'},
    //       {id: 'manhattan',       show: 'Manhattan'   },
    //       {id: 'gower',           show: 'Gower'       },
    //       {id: 'euclidean',       show: 'Euclidean'   },


    //       {id: 'pearson',         show: 'Pearson'     },
    //       {id: 'spearman',        show: 'Spearman'    },
// R only
//        {id: 'correlation',     show: 'Correlation' },
//        {id: 'mountford',       show: 'Mountford'   },
//        {id: 'chao_j',          show: 'Chao J'      },
//        {id: 'chao_s',          show: 'Chao S'      },
//        {id: 'raup',            show: 'Raup'        },

//        {id: 'yue_clayton',     show: 'Yue-Clayton' }

// python distances:

    // {id: 'abund_jaccard',         show: 'Jaccard  - Abundance'     },
    // {id: 'binary_jaccard',        show: 'Jaccard - Binary'     },
    // {id: 'soergel',         show: 'Soergel'     },
    // {id: 'hellinger',         show: 'Hellinger'     },
    // {id: 'chord',         show: 'chord'     },
    // {id: 'chisq',         show: 'Chisq'     }

  ]
};

constants.PORTALS = {
  'CMP': {
    name: 'Coral Microbiome Portal',
    subtext: 'CMP',
    projects: ['LTR_MCR_Bv6', 'LTR_MCR_Av6', 'LTR_MCR_Ev9', 'ICM_CCB_Bv6', 'ICM_CCB_Av6'],
    prefixes: ['CMP'],
    suffixes: [],
    pagetitle: 'Coral Microbe Portal',
    maintitle: 'Coral Microbiome Portal',
    subtitle: 'The Coral Microbiome Portal (CMP) database brings together next generation sequencing data of coral-associated microorganisms from studies conducted thoughout the world’s reefs.',
    thumb: '/images/portals/cmp_thumbnail.jpg',
    zoom: 3
  },
  'CODL': {
    name: 'Census of Deep Life',
    subtext: 'CoDL',
    projects: [],
    prefixes: ['DCO'],
    suffixes: [],
    pagetitle: 'Census of Deep Life Portal',
    maintitle: 'Census of Deep Life Portal',
    subtitle: 'The mandate of the Census of Deep Life is to perform a global survey of life in continental and marine subsurface environments using deep DNA sequencing technology.',
    thumb: '/images/portals/dco_thumbnail.jpg',
    zoom: 2  // worldwide
  },
  'NIHHMP': {
    name: 'NIH Human Mircrobiome Project',
    subtext: 'HMP',
    projects: [],
    prefixes: ['NIHHMP'],
    suffixes: [],
    pagetitle: 'Human Microbiome Project Portal',
    maintitle: 'HMP Portal',
    subtitle: 'The NIH Human Microbiome Project is one of several international efforts designed to take advantage of large scale, high through multi ‘omics analyses to study the microbiome in human health.',
    thumb: '/images/portals/hmp_logo_NIH_retina.png',
    zoom: 4  // mostly US? Do we even have or want distribution?
  },
  'UC': {
    name: 'Ulcerative Colitis (NIH Demonstration Project)',
    subtext: '',
    projects: [],
    prefixes: ['HMP'],
    suffixes: [],
    pagetitle: 'Ulcerative Colitis Portal',
    maintitle: 'Ulcerative Colitis Portal',
    subtitle: 'The Role of the Gut Microbiota in Ulcerative Colitis (NIH Human Microbiome Demonstration Project).',
    thumb: '/images/portals/uc_thumbnail.jpg',
    zoom: 4  // mostly US?
  },
  'ICOMM': {
    name: 'International Census of Marine Microbes',
    subtext: 'ICoMM',
    projects: [],
    prefixes: ['ICM', 'KCK'],
    suffixes: [],
    pagetitle: 'International Census of Marine Microbes Portal',
    maintitle: 'ICoMM - Microbis Portal',
    subtitle: 'The role of the International Census of Marine Microbes (ICoMM) is to promote an agenda and an environment that will accelerate discovery,<br>understanding, and awareness of the global significance of marine microbes.',
    thumb: '/images/portals/icomm_thumbnail.jpg',
    zoom: 2  // worldwide
  },
  'LTER': {
    name: 'Long Term Ecological Research',
    subtext: 'LTER',
    projects: [],
    prefixes: ['LTR'],
    suffixes: [],
    pagetitle: 'Microbial Inventory Research Across Diverse Aquatic Sites (MIRADA) Portal',
    maintitle: 'MIRADA Portal',
    subtitle: 'Microbial Inventory Research Across Diverse Aquatic Long Term Ecological Research (LTER) Sites.',
    thumb: '/images/portals/lter_thumbnail.jpg',
    zoom: 5  // mostly US
  },
  'MBE': {
    name: 'Microbiology of the Built Environment',
    subtext: 'MBE',
    projects: [],
    prefixes: ['MBE', 'RARE', 'SLM'],
    suffixes: [],
    pagetitle: 'Microbiology Of the Built Environment Portal',
    maintitle: 'MoBEDAC Portal',
    subtitle: 'Microbiome of the Built Environment -Data Analysis Core.',
    thumb: '/images/portals/mbe_thumbnail.gif',
    zoom: 4  // mostly US?
  },
  'PSPHERE': {
    name: 'The Plastisphere',
    subtext: '',
    projects: [
    'LAZ_SEA_Bv6', 'LAZ_SEA_Ev9', 'LAZ_SEA_Bv6v4', 'LAZ_DET_Bv3v4',
    'LQM_MPLA_Bv4v5','LQM_PLA2_Bv4v5','LQM_PLA3_Bv4v5','LQM_PLA4_Bv4v5',
    'AD_2019_Bv3v4','AMC_2014_Bv4','AMC_2016_Bv4','AST_2019_Bv4','CD_2018a_Bv3v5','CD_2018b_Bv3v5',
    'CDT_2017_Bv3v4','CDT_2017_ITS2',
    'ES_2017_Bv3','GEC_2019_Bv4v5','GEC_2019_ITS',
    'IVK_2018_Bv3v4','IVK_2019_Bv3v4','KK_2019_Bv4','KPNLF_2019_Bv3v4',
    'LCW_2018_Bv4','MAA_2018_Bv4','MB_2020_Bv3v4','MO_2018_Bv3v4',
    'MP_2019_Bv3v4','MR_2019_Bv3','MTK_2017_Ev4','MTK_2019_Ev4',
    'PJ_2018_Bv3v4','SK_2020_Bv3v4','SO_2016_Bv4','SO_2016_Ev9','SO_2018_Bv4',
    'JHS_2020_Bv4v5',
    'SW_2018_Bv4','TH_2014_Bv4','TH_2017_Bv4','XX_2019_Bv3v4'
    ],
   

    prefixes: [],
    suffixes: [],
    pagetitle: 'The Plastisphere',
    maintitle: 'Plastisphere Portal',
    subtitle: 'Bacteria and Plastics',
    thumb: '/images/portals/psphere_thumbnail.jpg',
    zoom: 2  // Now worldwide  No: mostly US
  },
  'RARE': {
    name: 'The Rare Biosphere',
    subtext: '',
    projects: [],
    prefixes: ['RARE'],
    suffixes: [],
    pagetitle: 'The Rare Biosphere Portal',
    maintitle: 'Rare Biosphere Portal',
    subtitle: 'A New Paradigm for Microbiology.',
    thumb: '/images/portals/rare_thumbnail.png',
    zoom: 13  // mostly Falmouth
  },
  'UNIEUK': {
    name: 'UniEuk',
    subtext: '',
    projects: [],
    prefixes: [],
    suffixes: ['Ev2', 'Ev4', 'Ev9', 'Euk'],
    pagetitle: 'UniEuk Portal',
    maintitle: 'UniEuk Portal',
    subtitle: 'A Gathering of all Eukaryal Projects.',
    thumb: '/images/portals/unieuk_thumbnail.jpg',
    zoom: 2  // worldwide
  }
}

// This List MUST match the fields in sequence_uniq_infos
constants.AVAILABLE_UNITS = ['silva_taxonomy_info_per_seq_id', 'oligotype_id', 'gg_otu_id'];
// blue to red
constants.HEATMAP_COLORS  = ['1111ff', '3333ff', '5555ff', '7777ff', '9999ff', 'aaaaff', 'ccccff', 'ddeeee', 'eeeedd', 'ffdddd', 'ffbbbb', 'ff9999', 'ff7777', 'ff5555', 'ff3333', 'ff0000'];

constants.RSCRIPT_CMD = 'RScript --no-restore --no-save';

constants.RANKS = ["domain", "phylum", "klass", "order", "family", "genus", "species", "strain"];

constants.PCT_RANGE = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// these define the order and the images of the visual thumbnails available on the view_selection page
// Ideally ALL the information should be available here in the JSON
constants.VISUAL_THUMBNAILS = {
  visuals: [
    {
      name: 'Taxonomy Frequency Table',
      thumb: '/images/visuals/counts_table.png',
      //link:'user_viz_data/counts_table',
      //id:'counts_table_link_id',
      prefix: 'counts_matrix',
      tip: ''
    },

    {
      name: 'Metadata Table',
      thumb: '/images/visuals/metadata.png',
      //link:'user_viz_data/metadata_table',
      //id:'metadata_table_link_id',
      prefix: 'metadata_table',
      tip: ''
    },

    {
      name: 'Distance Heatmap (py)',
      thumb: '/images/visuals/heatmap.png',
      //link:'user_viz_data/heatmap',
      //id:'dheatmap_link_id',
      prefix: 'dheatmap',
      tip: 'Python3-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'
    },

    {
      name: 'Stackbar Charts (d3/svg)',
      thumb: '/images/visuals/barcharts.png',
      //link:'user_viz_data/barcharts',
      //id:'barcharts_link_id',
      prefix: 'barcharts',
      tip: ''
    },

    {
      name: 'Pie Charts (d3/svg)',
      thumb: '/images/visuals/pie_charts.png',
      //link:'user_viz_data/piecharts',
      //id:'piecharts_link_id',
      prefix: 'piecharts',
      tip: ''
    },

    {
      name: 'Frequency Heatmap (R/pdf)',
      thumb: '/images/visuals/fheatmap.png',
      //link:'user_viz_data/frequency_heatmap',
      //id:'fheatmap_link_id',
      prefix: 'fheatmap',
      tip: 'Python3-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-R (https://www.r-project.org/)-|-pheatmap (R-package)-|-vegan (R-package)-|-jsonlite (R-package)-|-RColorBrewer (R-package)'
    },

    {
      name: 'Data Browser (Krona)',
      thumb: '/images/visuals/krona.png',
      //link:'user_viz_data/dbrowser',
      //id:'dbrowser_link_id',
      prefix: 'dbrowser',
      tip: ''
    },

    {
      name: 'Dendrogram (d3/phylogram)',
      thumb: '/images/visuals/dendrogram.png',
      //link:'user_viz_data/dendrogram',
      //id:'dendrogram1_link_id',
      prefix: 'dendrogram01',
      tip: 'Python3-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'
    },

    //{name:'Dendrogram (d3-phylonator)', thumb:'/images/visuals/dendrogram.png',  	link:'user_viz_data/dendrogram',     id:'dendrogram2_link_id',
    //     tip:'Python3-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'   },

    {
      name: 'Dendrogram (d3/radial)',
      thumb: '/images/visuals/radial.png',
      //link:'user_viz_data/dendrogram',
      //id:'dendrogram3_link_id',
      prefix: 'dendrogram03',
      tip: 'Python3-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)'
    },


    // {name:'Dendrogram (py-pdf)',        thumb:'/images/visuals/dendrogram.png',  	link:'user_viz_data/dendrogram',     id:'dendrogram_pdf_link_id',
    //     tip:'Python3-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-matplotlib (python library)'},

    {
      name: 'PCoA 2D Analyses (R/pdf)',
      thumb: '/images/visuals/pcoa.png',
      //link:'user_viz_data/pcoa',
      //id:'pcoa_link_id',
      prefix: 'pcoa',
      tip: 'R (https://www.r-project.org/)-|-phyloseq (R-package)-|-vegan (R-package)-|-ape (R-package)'
    },

    {
      name: 'PCoA 3D Analyses (Emperor)',
      thumb: '/images/visuals/emperor.png',
      //link:'user_viz_data/pcoa',
      //id:'pcoa_3d_link_id',
      prefix: 'pcoa3d',
      tip: 'Python3-|-scikit-bio (python library)-|-scipy (python library)-|-numpy (python library)-|-cogent (python library)-|-QIIME (http://qiime.org)'
    },

    {
      name: 'Geo Distribution',
      thumb: '/images/visuals/map.png',
      //link:'user_viz_data/geospatial',
      //id:'geospatial_link_id',
      prefix: 'geospatial',
      tip: 'lat/lon metadata'
    },

    {
      name: 'Alpha Diversity',
      thumb: '/images/visuals/alpha.png',
      //link:'user_viz_data/alpha_diversity',
      //id:'adiversity_link_id',
      prefix: 'adiversity',
      tip: 'Python3-|-scipy (python library)-|-numpy (python library)-|-scikit-bio'
    },

    {
      name: 'Phyloseq Bars (R/svg)',
      thumb: '/images/visuals/phyloseq_bars.png',
      //link:'user_viz_data/phyloseq01',
      //id:'phyloseq01_link_id',
      prefix: 'phyloseq_bars01',
      tip: 'R (https://www.r-project.org/)-|-phyloseq (R-package)'
    },

    {
      name: 'Phyloseq Heatmap (R/png)',
      thumb: '/images/visuals/phyloseq_heatmap.png',
      //link:'user_viz_data/phyloseq02',
      //id:'phyloseq02_link_id',
      prefix: 'phyloseq_hm02',
      tip: 'R (https://www.r-project.org/)-|-phyloseq (R-package)'
    },

    {
      name: 'Phyloseq Network (R/svg)',
      thumb: '/images/visuals/phyloseq_network.png',
      //link:'user_viz_data/phyloseq03',
      //id:'phyloseq03_link_id',
      prefix: 'phyloseq_nw03',
      tip: 'R (https://www.r-project.org/)-|-phyloseq (R-package)'
    },

    {
      name: 'Phyloseq Ordination (R/svg)',
      thumb: '/images/visuals/phyloseq_ord1.png',
      //link:'user_viz_data/phyloseq04',
      //id:'phyloseq04_link_id',
      prefix: 'phyloseq_ord04',
      tip: 'R (https://www.r-project.org/)-|-phyloseq (R-package)'
    },

    {
      name: 'Phyloseq Tree (R/svg)',
      thumb: '/images/visuals/phyloseq_tree.png',
      //link:'user_viz_data/phyloseq05',
      //id:'phyloseq05_link_id',
      prefix: 'phyloseq_tree05',
      tip: 'R (https://www.r-project.org/)-|-phyloseq (R-package)'
    },

    {
      name: 'Cytoscape (TESTING)',
      thumb: '/images/visuals/phyloseq_tree.png',
      //link:'user_viz_data/cytoscape',
      //id:'cytoscape_link_id',
      prefix: 'cytoscape',
      tip: ''
    },
    {
      name: 'Dendrogram (R/svg)',
      thumb: '/images/visuals/dendrogram.png',
      //link:'user_viz_data/dendrogramR',
      //id:'dendrogram0_link_id',
      prefix: 'dendrogram',
      tip: 'R (https://www.r-project.org/)-|-vegan & ape (R-packages);'
    },
  ]
};

//constants.ORDERED_METADATA_NAMES_OBJ = {}
constants.CONTACT_US_SUBJECTS = ["Account Request","Data Request","Report a Problem", "Announce a Publication", "Request Project Permanency", "Other"];
//
//
//



module.exports = constants;