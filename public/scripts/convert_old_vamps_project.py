#!/usr/bin/env python

##!/usr/bin/env python
# -*- coding: utf-8 -*-

# Copyright (C) 2011, Marine Biological Laboratory
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free
# Software Foundation; either version 2 of the License, or (at your option)
# any later version.
#
# Please read the COPYING file.
#

import os
from stat import * # ST_SIZE etc
import sys
import shutil
import types
import time
import random
import csv
from time import sleep
#import logging
import ConfigParser
from IlluminaUtils.lib import fastalib
import datetime
import logging
today = str(datetime.date.today())
import subprocess
import MySQLdb
import pprint
pp = pprint.PrettyPrinter(indent=4)

# Global:
#NODE_DATABASE = "vamps_js_dev_av"
#NODE_DATABASE = "vamps_js_development"
CONFIG_ITEMS = {}
SEQ_COLLECTOR = {}
DATASET_ID_BY_NAME = {}
SILVA_IDS_BY_TAX = {}
RANK_COLLECTOR={}
TAX_ID_BY_RANKID_N_TAX = {}
SUMMED_TAX_COLLECTOR = {}  # SUMMED_TAX_COLLECTOR[ds][rank][tax_string] = count
ranks =['domain','phylum','klass','order','family','genus','species','strain']
REQ_METADATA_ITEMS = {}
CUST_METADATA_ITEMS = {}

required_metadata_fields = [ "altitude", "assigned_from_geo", "collection_date", "depth", "country", "elevation", "env_biome", "env_feature", "env_matter", "latitude", "longitude", "public","taxon_id","description","common_name"];

# ranks =[{'name':'domain', 'id':1,'num':0},
#         {'name':'phylum', 'id':4,'num':1},
#         {'name':'klass',  'id':5,'num':2},
#         {'name':'order',  'id':6,'num':3},
#         {'name':'family', 'id':8,'num':4},
#         {'name':'genus',  'id':9,'num':5},
#         {'name':'species','id':10,'num':6},
#         {'name':'strain', 'id':11,'num':7}]
logger = logging.getLogger('')

def start(NODE_DATABASE, args):
    
    global mysql_conn
    global cur
    #LOG_FILENAME = os.path.join('.','log.txt')
   
    
    
    #logging.basicConfig(level=logging.DEBUG, filename=LOG_FILENAME, filemode="a+",
    #                        format="%(asctime)-15s %(levelname)-8s %(message)s")
    os.chdir(args.indir)
    
    
    mysql_conn = MySQLdb.connect(host="localhost", # your host, usually localhost
                          db = NODE_DATABASE,
                          read_default_file="~/.my.cnf_node"  )
    cur = mysql_conn.cursor()
    
    
    print("running get_config_data")
    get_config_data(args)
    
    # print("checking user")
    # check_user()  ## script dies if user not in db
    #
    # print("recreating ranks")
    # recreate_ranks()
    #
    # print("env sources")
    # create_env_source()
    #
    # print("classifier")
    # create_classifier()
    #
    # print("starting taxonomy")
    # push_taxonomy(args)
    #
    # print("starting sequences")
    # push_sequences()
    
    print("starting metadata")
    start_metadata(args)
    
    print("projects")
    push_project()
    
    print("datasets")
    push_dataset()
    
    #push_summed_counts()
    print("starting push_pdr_seqs")
    push_pdr_seqs()
    
    #print SEQ_COLLECTOR
    #pp.pprint(CONFIG_ITEMS)
    print("Finished database_importer.py")
    
    return CONFIG_ITEMS['project_id']
    
def check_user():
    """
    check_user()
      the owner/user (from config file) must be present in 'user' table for script to continue
    """
    q = "select user_id from user where username='"+CONFIG_ITEMS['owner']+"'"
    cur.execute(q)
    numrows = int(cur.rowcount)
    if numrows==0:
        sys.exit('Could not find owner: '+CONFIG_ITEMS['owner']+' --Exiting')
    row = cur.fetchone()
    CONFIG_ITEMS['owner_id'] = row[0] 
       
def create_env_source():
    q = "INSERT IGNORE INTO env_sample_source VALUES (0,''),(10,'air'),(20,'extreme habitat'),(30,'host associated'),(40,'human associated'),(45,'human-amniotic-fluid'),(47,'human-blood'),(43,'human-gut'),(42,'human-oral'),(41,'human-skin'),(46,'human-urine'),(44,'human-vaginal'),(140,'indoor'),(50,'microbial mat/biofilm'),(60,'miscellaneous_natural_or_artificial_environment'),(70,'plant associated'),(80,'sediment'),(90,'soil/sand'),(100,'unknown'),(110,'wastewater/sludge'),(120,'water-freshwater'),(130,'water-marine')"
    cur.execute(q)
    mysql_conn.commit()

def create_classifier():
    q = "INSERT IGNORE INTO classifier VALUES (1,'RDP'),(2,'GAST')"
    cur.execute(q)
    mysql_conn.commit()
    
def recreate_ranks():
    for i,rank in enumerate(ranks):
        
        q = "INSERT IGNORE into rank (rank,rank_number) VALUES('"+rank+"','"+str(i)+"')"
        print(q)
        cur.execute(q)
        rank_id = cur.lastrowid
        if rank_id==0:
            q = "SELECT rank_id from rank where rank='"+rank+"'"
            print(q)
            cur.execute(q)
            row = cur.fetchone()
            RANK_COLLECTOR[rank] = row[0]
        else:
            RANK_COLLECTOR[rank] = rank_id
    mysql_conn.commit()
    
def push_dataset():
    fields = ['dataset','dataset_description','env_sample_source_id','project_id']
    q = "INSERT into dataset ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s','%s')"
    for ds in CONFIG_ITEMS['datasets']:
        desc = ds+'_description'
        #print ds,desc,CONFIG_ITEMS['env_source_id'],CONFIG_ITEMS['project_id']
        q4 = q % (ds,desc,CONFIG_ITEMS['env_source_id'],CONFIG_ITEMS['project_id'])
        print(q4)
        try:
            cur.execute(q4)
            did = cur.lastrowid
            DATASET_ID_BY_NAME[ds]=did
        except:
            print('ERROR: MySQL Integrity ERROR -- duplicate dataset')
            sys.exit('ERROR: MySQL Integrity ERROR -- duplicate dataset')
    mysql_conn.commit()
    
def push_project():
    desc = "Project Description"
    title = "Title"
    proj = CONFIG_ITEMS['project']
    rev = CONFIG_ITEMS['project'][::-1]
    fund = "myfunding"
    id = CONFIG_ITEMS['owner_id']
    pub = 0 if CONFIG_ITEMS['public'] else 1
    fields = ['project','title','project_description','rev_project_name','funding','owner_user_id','public']
    q = "INSERT into project ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s','%s','%s','%s','%s')"
    q = q % (proj,title,desc,rev,fund,id,pub)
    
    print(q)
    cur.execute(q)
    
    CONFIG_ITEMS['project_id'] = cur.lastrowid
    print("PID="+str(CONFIG_ITEMS['project_id']))
    mysql_conn.commit()
    


def push_pdr_seqs():
    for ds in SEQ_COLLECTOR:
        for seq in SEQ_COLLECTOR[ds]:
            did = DATASET_ID_BY_NAME[ds]
            seqid = SEQ_COLLECTOR[ds][seq]['sequence_id']
            count = SEQ_COLLECTOR[ds][seq]['seq_count']
            q = "INSERT into sequence_pdr_info (dataset_id, sequence_id, seq_count,classifier_id)"
            q += " VALUES ('"+str(did)+"','"+str(seqid)+"','"+str(count)+"','2')"
            print(q)
            cur.execute(q)
    mysql_conn.commit()
    
def push_sequences():
    # sequences
    for ds in SEQ_COLLECTOR:
        for seq in SEQ_COLLECTOR[ds]:
            q = "INSERT ignore into sequence (sequence_comp) VALUES (COMPRESS('"+seq+"'))"
            print(q)
            cur.execute(q)
            mysql_conn.commit()
            seqid = cur.lastrowid
            if seqid == 0:
                q2 = "select sequence_id from sequence where sequence_comp = COMPRESS('"+seq+"')"
                print('DUP SEQ FOUND')
                cur.execute(q2)
                mysql_conn.commit() 
                row = cur.fetchone()
                seqid=row[0]
            SEQ_COLLECTOR[ds][seq]['sequence_id'] = seqid
            silva_tax_id = str(SEQ_COLLECTOR[ds][seq]['silva_tax_id'])
            distance = str(SEQ_COLLECTOR[ds][seq]['distance'])
            print( ds+' - '+seq+' - '+str(silva_tax_id))
            rank_id = str(SEQ_COLLECTOR[ds][seq]['rank_id'])
            print( rank_id)
            q = "INSERT ignore into silva_taxonomy_info_per_seq"
            q += " (sequence_id,silva_taxonomy_id,gast_distance,refssu_id,rank_id)"
            q += " VALUES ('"+str(seqid)+"','"+silva_tax_id+"','"+distance+"','0','"+rank_id+"')"
            print(q)
            cur.execute(q)
            mysql_conn.commit()
            silva_tax_seq_id = cur.lastrowid
            if seqid == 0:
                q3 = "select silva_taxonomy_info_per_seq_id from silva_taxonomy_info_per_seq"
                q3 += " where sequence_id = '"+seqid+"'"
                q3 += " and silva_taxonomy_id = '"+silva_tax_id+"'"
                q3 += " and gast_distance = '"+distance+"'"
                q3 += " and rank_id = '"+rank_id+"'"
                #print 'DUP silva_tax_seq'
                cur.execute(q3)
                mysql_conn.commit() 
                row = cur.fetchone()
                silva_tax_seq_id=row[0]
        
            q4 = "INSERT ignore into sequence_uniq_info (sequence_id, silva_taxonomy_info_per_seq_id)"
            q4 += " VALUES('"+str(seqid)+"','"+str(silva_tax_seq_id)+"')"
            print(q4)
            cur.execute(q4)
            mysql_conn.commit()
        ## don't see that we need to save uniq_ids
    mysql_conn.commit()
    #print SEQ_COLLECTOR    

        

def push_taxonomy(args):
    
    
    
    #print  general_config_items
    silva = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id','strain_id']
    accepted_domains = ['bacteria','archaea','eukarya','fungi','organelle','unknown']
    tax_collector = {}
    
    
    csv_seqs_infile = os.path.join(args.indir, 'sequences.csv')
    
    print 'csv',csv_seqs_infile
    lines = list(csv.reader(open(csv_seqs_infile, 'rb'), delimiter=','))
    #print tax_file
    
    for line in lines:
        print line
        if line[0]=='id':
            continue
        seq = line[1]
        pj_file = line[2]
        ds = line[3]
        tax_string = line[4]
        refhvr_ids=line[5]
        rank = line[6]
        seq_count = line[7]
        distance = line[9]
       
        if pj_file != args.project:
            sys.exit('Project file--name mismatch ('+pj_file+' - '+args.project+') -- Confused! Exiting!')

        if rank == 'class': rank = 'klass'
        if rank == 'orderx': rank = 'order'
        if ds not in CONFIG_ITEMS['datasets']:
            CONFIG_ITEMS['datasets'].append(ds)
        if ds not in SEQ_COLLECTOR:
            SEQ_COLLECTOR[ds]={}
        
        
        if ds not in SUMMED_TAX_COLLECTOR:
            SUMMED_TAX_COLLECTOR[ds]={}



        SEQ_COLLECTOR[ds][seq] = {'dataset':ds,
                              'taxonomy':tax_string,
                              'refhvr_ids':refhvr_ids,
                              'rank':rank,
                              'seq_count':seq_count,
                              'distance':distance
                              }
        q1 = "SELECT rank_id from rank where rank = '"+rank+"'"

        cur.execute(q1)
        mysql_conn.commit()

        row = cur.fetchone()

        SEQ_COLLECTOR[ds][seq]['rank_id'] = row[0]

        tax_items = tax_string.split(';')
        #print tax_string
        sumtax = ''
        for i in range(0,8):

            rank_id = RANK_COLLECTOR[ranks[i]]
            if len(tax_items) > i:

                taxitem = tax_items[i]

            else:
                taxitem = ranks[i]+'_NA'
            sumtax += taxitem+';'

            #print ranks[i],rank_id,taxitem,sumtax,seq_count
            if rank_id in SUMMED_TAX_COLLECTOR[ds]:
                if sumtax[:-1] in SUMMED_TAX_COLLECTOR[ds][rank_id]:
                    SUMMED_TAX_COLLECTOR[ds][rank_id][sumtax[:-1]] += int(seq_count)
                else:
                    SUMMED_TAX_COLLECTOR[ds][rank_id][sumtax[:-1]] = int(seq_count)

            else:
                SUMMED_TAX_COLLECTOR[ds][rank_id] = {}
                SUMMED_TAX_COLLECTOR[ds][rank_id][sumtax[:-1]] = int(seq_count)

        #for i in range(0,8):
        #insert_nas()

        if tax_items[0].lower() in accepted_domains:
            ids_by_rank = []
            for i in range(0,8):
                #print i,len(tax_items),tax_items[i]
                rank_name = ranks[i]
                rank_id = RANK_COLLECTOR[ranks[i]]

                if len(tax_items) > i:
                    if ranks[i] == 'species':
                        t = tax_items[i].lower()
                    else:
                        t = tax_items[i].capitalize()

                    if tax_items[i].lower() != (rank_name+'_NA').lower():
                        name_found = False
                        if rank_name in tax_collector:
                            tax_collector[rank_name].append(t)
                        else:
                            tax_collector[rank_name] = [t]
                else:
                    t = rank_name+'_NA'



                q2 = "INSERT ignore into `"+rank_name+"` (`"+rank_name+"`) VALUES('"+t+"')"
                print(q2)
                cur.execute(q2)
                mysql_conn.commit()
                tax_id = cur.lastrowid
                if tax_id == 0:
                    q3 = "select "+rank_name+"_id from `"+rank_name+"` where `"+rank_name+"` = '"+t+"'"
                    print( q3 )
                    cur.execute(q3)
                    mysql_conn.commit()
                    row = cur.fetchone()
                    tax_id=row[0]
                ids_by_rank.append(str(tax_id))
                #else:
                print( 'rank_id,t,tax_id '+str(rank_id)+' - '+t+' - '+str(tax_id)  )
                if rank_id in TAX_ID_BY_RANKID_N_TAX:
                    TAX_ID_BY_RANKID_N_TAX[rank_id][t] = tax_id
                else:
                    TAX_ID_BY_RANKID_N_TAX[rank_id]={}
                    TAX_ID_BY_RANKID_N_TAX[rank_id][t] = tax_id
                #ids_by_rank.append('1')
            print(  ids_by_rank )
            q4 =  "INSERT ignore into silva_taxonomy ("+','.join(silva)+",created_at)"
            q4 += " VALUES("+','.join(ids_by_rank)+",CURRENT_TIMESTAMP())"
            #
            print(q4)
            cur.execute(q4)
            mysql_conn.commit()
            silva_tax_id = cur.lastrowid
            if silva_tax_id == 0:
                q5 = "SELECT silva_taxonomy_id from silva_taxonomy where ("
                vals = ''
                for i in range(0,len(silva)):
                    vals += ' '+silva[i]+"="+ids_by_rank[i]+' and'
                q5 = q5 + vals[0:-3] + ')'
                print(q5)
                cur.execute(q5)
                mysql_conn.commit()
                row = cur.fetchone()
                silva_tax_id=row[0]

            SILVA_IDS_BY_TAX[tax_string] = silva_tax_id
            SEQ_COLLECTOR[ds][seq]['silva_tax_id'] = silva_tax_id
            mysql_conn.commit()
 #    for rank in tax_collector:
#         for name in tax_collector[rank]:
#             
#             q = "insert ignore into `"+rank+"` (`"+rank+"`) VALUES('"+name+"')"
#             
#             #print q
#             cur.execute(q)
#             id = cur.lastrowid
    #print 'SEQ_COLLECTOR'
    #print SEQ_COLLECTOR
    
    #print SILVA_IDS_BY_TAX
    #db.commit() 
# def insert_nas():
#     for table in ranks:
#         i = table+'_NA'
#         q = "INSERT ignore into `"+table+"` (`"+table+"`) VALUES('"+i+"')"
#         if table != 'domain':
#             cur.execute(q)
#     db.commit()
    print( 'SUMMED_TAX_COLLECTOR')
    print( SUMMED_TAX_COLLECTOR)
             
def get_config_data(args):
    CONFIG_ITEMS['env_source_id'] = args.env_source_id
    CONFIG_ITEMS['public']= args.public
    CONFIG_ITEMS['owner'] = args.owner
    CONFIG_ITEMS['project'] = args.project
    CONFIG_ITEMS['datasets'] = []

       
def start_metadata(args):
    cur.execute("USE "+NODE_DATABASE)
    #get_config_data(indir)
    get_metadata(args.indir)
    put_required_metadata()
    put_custom_metadata()
    #print CONFIG_ITEMS
    print REQ_METADATA_ITEMS
    print
    print CUST_METADATA_ITEMS
    
def put_required_metadata():
    
    q = "INSERT into required_metadata_info (dataset_id,"+','.join(required_metadata_fields)+")"
    q = q+" VALUES("
    
    for i,did in enumerate(REQ_METADATA_ITEMS['dataset_id']):
        vals = "'"+str(did)+"',"
        
        for item in required_metadata_fields:
            vals += "'"+str(REQ_METADATA_ITEMS[item][i])+"',"
        q2 = q + vals[:-1] + ")"  
        print q2
        cur.execute(q2)
    db.commit()
            
            
def put_custom_metadata():
    """
      create new table
    """
    print 'starting put_custom_metadata'
    # TABLE-1 === custom_metadata_fields
    for key in CUST_METADATA_ITEMS:
        print key
        q2 = "insert ignore into custom_metadata_fields(project_id,field_name,field_type,example)"
        q2 += " VALUES("
        q2 += "'"+str(CONFIG_ITEMS['project_id'])+"',"
        q2 += "'"+key+"',"
        q2 += "'varchar(128)',"
        q2 += "'"+str(CUST_METADATA_ITEMS[key][0])+"')"
        print q2
        cur.execute(q2)
    
    # TABLE-2 === custom_metadata_<pid>
    cust_keys_array = CUST_METADATA_ITEMS.keys()
    custom_table = 'custom_metadata_'+str(CONFIG_ITEMS['project_id'])
    q = "CREATE TABLE IF NOT EXISTS `"+ custom_table + "` (\n"
    q += " `"+custom_table+"_id` int(10) unsigned NOT NULL AUTO_INCREMENT,\n"
    q += " `project_id` int(11) unsigned NOT NULL,\n"
    q += " `dataset_id` int(11) unsigned NOT NULL,\n"
    for key in cust_keys_array:
        if key != 'dataset_id':
            q += " `"+key+"` varchar(128) NOT NULL,\n" 
    q += " PRIMARY KEY (`"+custom_table+"_id` ),\n" 
    unique_key = "UNIQUE KEY `unique_key` (`project_id`,`dataset_id`,"
    
    # ONLY 16 key items allowed:    
    for i,key in enumerate(cust_keys_array):
        if i < 14 and key != 'dataset_id':
            unique_key += " `"+key+"`,"
    q += unique_key[:-1]+"),\n"
    q += " KEY `project_id` (`project_id`),\n"
    q += " KEY `dataset_id` (`dataset_id`),\n"
    q += " CONSTRAINT `"+custom_table+"_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`project_id`) ON UPDATE CASCADE,\n"
    q += " CONSTRAINT `"+custom_table+"_ibfk_2` FOREIGN KEY (`dataset_id`) REFERENCES `dataset` (`dataset_id`) ON UPDATE CASCADE\n"
    q += " ) ENGINE=InnoDB DEFAULT CHARSET=latin1;"
    print q
    cur.execute(q)
    
    for i,did in enumerate(CUST_METADATA_ITEMS['dataset_id']):
    
        q2 = "insert ignore into "+custom_table+" (project_id,dataset_id,"
        for key in cust_keys_array:
            if key != 'dataset_id':
                q2 += key+","
        q2 = q2[:-1]+ ")"
        q2 += " VALUES('"+str(CONFIG_ITEMS['project_id'])+"','"+str(did)+"',"
        for key in cust_keys_array:
            if key != 'dataset_id':
                q2 += "'"+str(CUST_METADATA_ITEMS[key][i])+"',"
        q2 = q2[:-1] + ")" 
        print q2
        cur.execute(q2)
    
    db.commit()
    
def get_metadata(indir):
    
    csv_infile =   os.path.join(indir,'metadata.csv')
    print 'csv',csv_infile
    lines = list(csv.reader(open(csv_infile, 'rb'), delimiter='\t'))
    # try:
#         csv_infile =   os.path.join(indir,'meta_clean.csv')
#         print csv_infile
#         lol = list(csv.reader(open(csv_infile, 'rb'), delimiter='\t'))
#     except:
#
#         csv_infile =   os.path.join(indir,'meta.csv')
#         print csv_infile
#         lol = list(csv.reader(open(csv_infile, 'rb'), delimiter='\t'))
#     else:
#         sys.exit("FAILED TO READ METAFILE")
    TMP_METADATA_ITEMS = {}
    for line in lines:
        print line
        if line[0] == 'dataset' and line[1] == 'parameterName':
            headers = line
        else:
            key = line[7]   # structured comment name
            parameterValue = line[2]
            dset = line[0]
            pj = line[5]
            
            
    # for i,key in enumerate(keys):
    #     TMP_METADATA_ITEMS[key] = []
    #     for line in lol[1:]:
    #         TMP_METADATA_ITEMS[key].append(line[i])
    # saved_indexes = []
    # for ds in CONFIG_ITEMS['datasets']:
    #     #print  TMP_METADATA_ITEMS['sample_name'].index(ds) , ds
    #     try:
    #         saved_indexes.append(TMP_METADATA_ITEMS['sample_name'].index(ds))
    #         dataset_header_name = 'sample_name'
    #     except:
    #         saved_indexes.append(TMP_METADATA_ITEMS['dataset'].index(ds))
    #         dataset_header_name = 'dataset'
    #     else:
    #         sys.exit('ERROR: Could not find "dataset" or "sample_name" in matadata file')
    #
    # # now get the data from just the datasets we have in CONFIG.ini
    # for key in TMP_METADATA_ITEMS:
    #
    #     if key in required_metadata_fields:
    #         REQ_METADATA_ITEMS[key] = []
    #         REQ_METADATA_ITEMS['dataset_id'] = []
    #         for j,value in enumerate(TMP_METADATA_ITEMS[key]):
    #             if j in saved_indexes:
    #                 if key in required_metadata_fields:
    #                     REQ_METADATA_ITEMS[key].append(TMP_METADATA_ITEMS[key][j])
    #                 ds = TMP_METADATA_ITEMS[dataset_header_name][j]
    #                 did = DATASET_ID_BY_NAME[ds]
    #                 REQ_METADATA_ITEMS['dataset_id'].append(did)
    #     else:
    #         CUST_METADATA_ITEMS[key] = []
    #         CUST_METADATA_ITEMS['dataset_id'] = []
    #
    #         for j,value in enumerate(TMP_METADATA_ITEMS[key]):
    #
    #             if j in saved_indexes:
    #
    #                 if key not in required_metadata_fields:
    #
    #                     CUST_METADATA_ITEMS[key].append(TMP_METADATA_ITEMS[key][j])
    #                 ds = TMP_METADATA_ITEMS[dataset_header_name][j]
    #                 did = DATASET_ID_BY_NAME[ds]
    #                 CUST_METADATA_ITEMS['dataset_id'].append(did)
    #
    # if not 'dataset_id' in REQ_METADATA_ITEMS:
    #     REQ_METADATA_ITEMS['dataset_id'] = []
    # if 'dataset_id' not in CUST_METADATA_ITEMS:
    #     CUST_METADATA_ITEMS['dataset_id'] = []
    #

if __name__ == '__main__':
    import argparse
    myusage = """
        -p/--project  project name
        -d/--dir directory that must include:
              files: sequences,metadata from old vamps
        -public/--public
        -env_source_id/--env_source_id
        -owner/--owner
        
        Test project: ICM_AGW_Bv6
        Retrieve data from old_vams as csv files:
        METADATA: mysql -B -h vampsdb vamps -e "SELECT * FROM vamps_metadata_ICM where project='ICM_AGW_Bv6';" |sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g"
        SEQS: mysql -B -h vampsdb vamps -e "SELECT * FROM vamps_sequences where project='ICM_AGW_Bv6';" |sed "s/'/\'/;s/\t/\",\"/g;s/^/\"/;s/$/\"/;s/\n//g"
    
       Named metadata.csv and sequences.csv
       
    """
    parser = argparse.ArgumentParser(description="" ,usage=myusage)  
    parser.add_argument("-p","--project",                   
                required=True,  action="store",   dest = "project", default='',
                help="""ProjectID""") 
    
    parser.add_argument("-d","--dir",                   
                required=True,  action="store",   dest = "indir", default='',
                help="""ProjectID""") 
    parser.add_argument("-public","--public",                   
                 required=False,  action="store",   dest = "public", default='1',
                 help="""ProjectID""")
    parser.add_argument("-env_source_id","--env_source_id",                   
                required=False,  action="store",   dest = "env_source_id", default='100',
                help="""ProjectID""")
    parser.add_argument("-owner","--owner",                   
                required=True,  action="store",   dest = "owner", 
                help="""ProjectID""")
    
                
    args = parser.parse_args()
    
    db = MySQLdb.connect(host="localhost", # your host, usually localhost
                             read_default_file="~/.my.cnf_node"  )
    cur = db.cursor()
    cur.execute("SHOW databases like 'vamps%'")
    dbs = []
    db_str = ''
    for i, row in enumerate(cur.fetchall()):
        dbs.append(row[0])
        db_str += str(i)+'-'+row[0]+';  '
    print db_str
    db_no = input("\nchoose database number: ")
    if int(db_no) < len(dbs):
        NODE_DATABASE = dbs[db_no]
    else:
        sys.exit("unrecognized number -- Exiting")
        
    print
    cur.execute("USE "+NODE_DATABASE)
    
    #out_file = "tax_counts--"+NODE_DATABASE+".json"
    #in_file  = "../json/tax_counts--"+NODE_DATABASE+".json"
    
    print 'DATABASE:',NODE_DATABASE
    
    
    
    
    if args.project and args.indir:
        start(NODE_DATABASE, args)
    else:
        print myusage 
        
