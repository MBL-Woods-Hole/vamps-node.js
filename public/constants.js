var config = {};

//console.log( JSON.stringify(datasets_by_project_all) );
config.DOMAINS = { domains: [
        {id: 1, name: "Archaea"},
        {id: 2, name: "Bacteria"},
        {id: 5, name: "Eukarya"},
        {id: 3, name: "Organelle"},
        {id: 4, name: "Unknown"}
    ]};

config.UNITSELECT = { units: [
        {id : 'tax_silva108_simple',file: 'unit_selectors/taxa_silva108_simple.html', name : "Taxonomy Silva108 (Simple)"},
        {id : 'tax_silva108_custom',file: 'unit_selectors/taxa_silva108_custom.html',   name : "Taxonomy Silva108 (Custom)"},
        {id : 'tax_gg_simple',      file: 'unit_selectors/taxa_gg_simple.html',       name : "Taxonomy Greengenes (Simple)"},
        {id : 'tax_gg_custom',      file: 'unit_selectors/taxa_gg_cust.html',         name : "Taxonomy Greengenes (Custom)"},
        {id : 'tax_rdp',            file: 'unit_selectors/taxa_rdp.html',             name : "Taxonomy RDP"},
        {id : 'otus',               file: 'unit_selectors/otus.html',                 name : "OTUs"},
        {id : 'med_nodes',          file: 'unit_selectors/med_nodes.html',             name : "MED Nodes"}
    ]};

config.VISUALOUTPUTCHOICES = { choices: [
        {id : 'counts_table',   show: 'Counts Table'},
        {id : 'barcharts',      show: 'Counts Bar Charts'},
        {id : 'heatmap',        show: 'Distance Heatmap'},
        {id : 'dendrogram',     show: 'Community Dendrogram'},
        {id : 'alphadiversity', show: 'Alpha Diversity'}
    ]};

config.NORMALIZATIONCHOICES = { choices: [
        {id: 'none',            show: 'Not Normalized (default)'},
        {id: 'max',             show: 'Normalized to the Maximum Sample'},
        {id: 'freq',            show: 'Normalized to Frequency'}
    ]};
config.DISTANCECHOICES = { choices: [
        {id: 'morisita_horn',   show: 'Morisita-Horn'},
        {id: 'jaccard',         show: 'Jaccard'     },
        {id: 'yue_clayton',     show: 'Yue-Clayton' },
        {id: 'bray_curtis',     show: 'Bray-Curtis' },
        {id: 'manhattan',       show: 'Manhattan'   },
        {id: 'raup',            show: 'Raup'        },
        {id: 'gower',           show: 'Gower'       },
        {id: 'euclidean',       show: 'Euclidean'   },
        {id: 'canberra',        show: 'Canberra'    },
        {id: 'kulczynski',      show: 'Kulczynski'  },
        {id: 'mountford',       show: 'Mountford'   },
        {id: 'chao_j',          show: 'Chao J'      },
        {id: 'chao_s',          show: 'Chao S'      },
        {id: 'pearson',         show: 'Pearson'     },
        {id: 'correlation',     show: 'Correlation' },
        {id: 'spearman',        show: 'Spearman'    }
    ]};

// This List MUST match the fields in sequence_uniq_infos
config.AVAILABLE_UNITS = ['silva_taxonomy_info_per_seq_id', 'oligotype_id', 'gg_otu_id'];
// blue to red
config.HEATMAP_COLORS = ['1111ff','3333ff','5555ff','7777ff','9999ff','aaaaff','ccccff','ddeeee','eeeedd','ffdddd','ffbbbb','ff9999','ff7777','ff5555','ff3333','ff0000'];

config.RSCRIPT_CMD = 'RScript --no-restore --no-save'

config.RANKS = ["domain", "phylum", "klass", "order", "family", "genus", "species", "strain"];
config.PCT_RANGE = [0.0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100];
config.VISUAL_THUMBNAILS = { visuals: [
    {name:'Distance Heatmap',  file:'/images/visuals/heatmap.png',     link:'user_data/heatmap'     },
    {name:'Bar Charts',        file:'/images/visuals/barcharts.png',   link:'user_data/barcharts'     },
    {name:'Pie Charts',        file:'/images/visuals/pie_charts.png',  link:'user_data/piecharts'   },
    {name:'Dendrograms',       file:'/images/visuals/dendrogram.png',  link:'user_data/dendrogram'   },
    {name:'PCoA Plots',        file:'', link:''    },
    {name:'Counts Table',      file:'/images/visuals/counts_table.png', link:'user_data/counts_table'   }
    ]};

module.exports = config;
