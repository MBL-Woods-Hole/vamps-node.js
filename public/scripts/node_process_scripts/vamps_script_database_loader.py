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
print('1)-->database')
import os
from stat import * # ST_SIZE etc
import sys
import shutil
import types
import time
import random
import csv
from time import sleep
import configparser as ConfigParser
#from IlluminaUtils.lib import fastalib
import fastalibAV as fastalib
import datetime

today = str(datetime.date.today())
import subprocess
import pymysql as MySQLdb
import warnings
import pprint
pp = pprint.PrettyPrinter(indent=4)


# Global:
 # SUMMED_TAX_COLLECTOR[ds][rank][tax_string] = count
classifiers = {"GAST":{'ITS1':1,'SILVA108_FULL_LENGTH':2,'GG_FEB2011':3,'GG_MAY2013':4},
                "RDP":{'ITS1':6,'2.10.1':5,'GG_FEB2011':7,'GG_MAY2013':8},
                'unknown':{'unknown':9}}
ranks =['domain','phylum','klass','order','family','genus','species','strain']
eight_cats = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id','strain_id']
accepted_domains = ['bacteria','archaea','eukarya','fungi','organelle','unknown']
# ranks =[{'name':'domain', 'id':1,'num':0},
#         {'name':'phylum', 'id':4,'num':1},
#         {'name':'klass',  'id':5,'num':2},
#         {'name':'order',  'id':6,'num':3},
#         {'name':'family', 'id':8,'num':4},
#         {'name':'genus',  'id':9,'num':5},
#         {'name':'species','id':10,'num':6},
#         {'name':'strain', 'id':11,'num':7}]


def start(args):
    print ("Starting "+os.path.basename(__file__))
    global CONFIG_ITEMS
    
    #global IDS_BY_TAX
    global RANK_COLLECTOR
    #global TAX_ID_BY_RANKID_N_TAX
    #global SUMMED_TAX_COLLECTOR
    CONFIG_ITEMS = {}
    
    #IDS_BY_TAX = {}
    RANK_COLLECTOR={}
   # TAX_ID_BY_RANKID_N_TAX = {}
    #SUMMED_TAX_COLLECTOR = {} 
    
    if args.verbose:
        print('CMD> ',sys.argv)


    
    global mysql_conn, cur    
   
    os.chdir(args.project_dir)
    
    mysql_conn = MySQLdb.connect(db = args.NODE_DATABASE, host=args.hostname, read_default_file=os.path.expanduser("~/.my.cnf_node")  )
    # socket=/tmp/mysql.sock
    cur = mysql_conn.cursor()
    
    
    
    print ("running get_config_data")
    get_config_data(args)
    
    
    print ("checking user")
    check_user()  ## script dies if user not in db
    
    
    print ("checking project")
    res = check_project()  ## script dies if project or rev_project is in db


    if res[0]=='ERROR' and args.partial:
        key = input('found project name and args.partial==True Continue to overwrite/add? (y/N) ')
        if key=='y':
            pass
        else:
            print ("\nExiting")
            sys.exit(res[1])
    elif res[0]=='ERROR' and not args.partial:
        print ("\n1ERROR res[0] "+res[1])
        sys.exit(res[1])
        
    print ("recreating ranks")
    recreate_ranks()

   
    print("classifier")
    create_classifier()

   
    print ("starting taxonomy")
    push_taxonomy(args)

   
    print ("starting sequences")
    push_sequences(args)
    #sys.exit()
        
    
    print ("projects")
    push_project()

    
    print ("datasets")
    push_dataset()

    
    print ("starting push_pdr_seqs")
    push_pdr_seqs(args)

    
    
    print ("Finished "+os.path.basename(__file__))
    print ('Writing pid to pid.txt')
    fp = open(os.path.join(args.project_dir,'pid.txt'),'w')
    fp.write(str(CONFIG_ITEMS['project_id']))
    fp.close()

    return CONFIG_ITEMS['project_id']
        
    
def check_user():
    """
    check_user()
      the owner/user (from config file) must be present in 'user' table for script to continue
    """
    global CONFIG_ITEMS
    global mysql_conn, cur
    q = "select user_id from user where username='"+CONFIG_ITEMS['owner']+"'"
    cur.execute(q)
    numrows = int(cur.rowcount)
    if numrows==0:
        sys.exit('Could not find owner: '+CONFIG_ITEMS['owner']+' --Exiting')
    row = cur.fetchone()
    CONFIG_ITEMS['owner_id'] = row[0] 

def check_project():
    """
    check_project()
      the owner/user (from config file) must be present in 'user' table for script to continue
    """
    global CONFIG_ITEMS
    global mysql_conn, cur
    proj = CONFIG_ITEMS['project_name']
    q1 = "SELECT project, project_id from project WHERE project='%s'" % (proj)
    cur.execute(q1)
    if cur.rowcount > 0:
        row = cur.fetchone()        
        CONFIG_ITEMS['project_id'] = str(row[1])
        return ('ERROR','Duplicate project name1: '+CONFIG_ITEMS['project_name']+' PID:'+str(row[1]))
    rev = proj[::-1]
    q2 = "SELECT rev_project_name, project_id from project WHERE rev_project_name='%s'" % (rev)
    cur.execute(q2)
    if cur.rowcount > 0:
        row = cur.fetchone()        
        return ('ERROR','Duplicate reverse project name1: '+rev+' PID:'+str(row[1]))
    return ('OK','')
           
# def create_env_package():
#     global mysql_conn, cur
#     q = "INSERT IGNORE INTO env_package VALUES (0,''),(10,'air'),(20,'extreme habitat'),(30,'host associated'),(40,'human associated'),(45,'human-amniotic-fluid'),(47,'human-blood'),(43,'human-gut'),(42,'human-oral'),(41,'human-skin'),(46,'human-urine'),(44,'human-vaginal'),(140,'indoor'),(50,'microbial mat/biofilm'),(60,'miscellaneous_natural_or_artificial_environment'),(70,'plant associated'),(80,'sediment'),(90,'soil/sand'),(100,'unknown'),(110,'wastewater/sludge'),(120,'water-freshwater'),(130,'water-marine')"
#     cur.execute(q)
#     mysql_conn.commit()

def create_classifier():
    global mysql_conn, cur
    q = "INSERT IGNORE INTO classifier VALUES" # (1,'GAST','ITS1'),(2,'GAST','SILVA108_FULL_LENGTH'),(3,'GAST','GG_FEB2011'),(4,'GAST','GG_MAY2013'),"
    for classifier in classifiers:
        for db in classifiers[classifier]:
            id = str(classifiers[classifier][db])
            q += "('"+id+"','"+classifier+"','"+db+"'),"
    q = q[:-1]
    cur.execute(q)
    mysql_conn.commit()
    
def recreate_ranks():
    
    #RANK_COLLECTOR={'domain':1,'phylum':2,'klass':3,'order':4,'family':5,'genus':6,'species':7,'strain':8}
    #return

    global RANK_COLLECTOR
    global mysql_conn, cur
    for i,rank in enumerate(ranks):
        
        # q = "INSERT IGNORE into rank (rank,rank_number) VALUES('%s','%s')" % (rank,str(i))
#         
#         cur.execute(q)
#         rank_id = cur.lastrowid
#         if rank_id==0:
        q = "SELECT rank_id from rank where rank='%s'" % (rank)        
        cur.execute(q)
        row = cur.fetchone()
        RANK_COLLECTOR[rank] = row[0]
        #else:
        #    RANK_COLLECTOR[rank] = rank_id
    #mysql_conn.commit()

def push_project():
    global CONFIG_ITEMS
    global mysql_conn, cur
    desc = "Project Description"
    title = "Title"
    proj = CONFIG_ITEMS['project_name']
    rev = CONFIG_ITEMS['project_name'][::-1]
    fund = "Unknown"
    id = CONFIG_ITEMS['owner_id']
    pub = 0 if CONFIG_ITEMS['public'] else 1
    fields = ['project','title','project_description','rev_project_name','funding','owner_user_id','public','matrix','active','permanent','user_project']
    ignore = ''
    if args.partial:
        ignore = 'IGNORE'
    q = "INSERT "+ignore+" into project ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s')"
    q = q % (proj,title,desc,rev,fund,id,pub,'0','1','0','1')
    if args.verbose:
        print(q)
    
    #print cur.lastrowid
    ## should have already checked 
    cur.execute(q)
    if not args.partial:
        CONFIG_ITEMS['project_id'] = cur.lastrowid
    
    mysql_conn.commit()
    
        
    
    return 0
        
def push_dataset():
    global CONFIG_ITEMS    
    args.DATASET_ID_BY_NAME = {}
    global mysql_conn, cur
    fields = ['dataset','dataset_description','project_id']
    ignore = ''
    if args.partial:
        ignore = 'IGNORE'
    q = "INSERT "+ignore+" into dataset ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s')"
    
    for ds in CONFIG_ITEMS['datasets']:
        desc = ds+'_description'
        #print ds,desc,CONFIG_ITEMS['env_source_id'],CONFIG_ITEMS['project_id']
        q4 = q % (ds,desc,CONFIG_ITEMS['project_id'])
       
        if args.verbose:
            print(q4)
        #try:
        cur.execute(q4)
        did = cur.lastrowid
        
        args.DATASET_ID_BY_NAME[ds]=did
        mysql_conn.commit()
        #except:
        #    print('ERROR: MySQL Integrity ERROR -- duplicate dataset')
        #    sys.exit('ERROR: MySQL Integrity ERROR -- duplicate dataset')
    
    

def get_default_run_info_ill_id():

    q =  "SELECT run_info_ill_id from run_info_ill"
    q += " JOIN run_key using(run_key_id)"
    q += " JOIN run using(run_id)"
    q += " JOIN dataset using(dataset_id)"
    q += " JOIN dna_region using(dna_region_id)"
    q += " JOIN primer_suite using(primer_suite_id)"
    q += " JOIN illumina_index using(illumina_index_id)"
    q += " WHERE run_key='%s'"
    q += " AND run='%s'"
    q += " AND dataset='%s'"
    q += " AND dna_region='%s'"
    q += " AND primer_suite='%s'"
    q += " AND illumina_index='%s'"
    
    try:
        q = q  % ('unknown','unknown','default_dataset','unknown','unknown','none')
        if args.verbose:
            print(q)
        cur.execute(q)
    except:
        print ("ERROR No default run_info_ill_id; Query: "+q)
        sys.exit()
    row = cur.fetchone()
    run_info_ill_id=row[0]
    return run_info_ill_id

def push_pdr_seqs(args):
    #print()
    gast_dbs = ['','','']

    
    global mysql_conn, cur
    run_info_ill_id = get_default_run_info_ill_id()
    for ds in args.SEQ_COLLECTOR:
        if args.verbose:
            print('[ds] ')
            print(args.SEQ_COLLECTOR[ds])
        for seq in args.SEQ_COLLECTOR[ds]:
            did = args.DATASET_ID_BY_NAME[ds]
            seqid = args.SEQ_COLLECTOR[ds][seq]['sequence_id']
            count = args.SEQ_COLLECTOR[ds][seq]['seq_count']
            q = "INSERT ignore into sequence_pdr_info (dataset_id, sequence_id, seq_count, classifier_id,run_info_ill_id)"
            #if args.classifier.upper() == 'GAST':
            
            classid=9  # 'unknown'
            q += " VALUES ('%s','%s','%s','%s','%s')"   
            
#             try:
            q = q  % (str(did),str(seqid),str(count),str(classid),str(run_info_ill_id))
            if args.verbose:
                print(q)
            cur.execute(q)
          
            mysql_conn.commit()
    
def push_sequences(args):
    # sequences
    print('in push_sequences')
    
    global mysql_conn, cur
    
    with warnings.catch_warnings():
        if args.warnings:
            warnings.simplefilter("default")
        else:
            warnings.simplefilter("ignore")
            print('Suppressing MySQL Warnings here in database_loader:sequences')
        cur = mysql_conn.cursor()
        for ds in args.SEQ_COLLECTOR:
            for seq in args.SEQ_COLLECTOR[ds]:
                q = "INSERT into sequence (sequence_comp) VALUES (COMPRESS('%s')) ON DUPLICATE KEY UPDATE sequence_comp = VALUES(sequence_comp)" % (seq)
                #INSERT into sequence (sequence_comp) 
#VALUES (COMPRESS('...')) ON DUPLICATE KEY UPDATE sequence_comp = VALUES(sequence_comp)
                cur.execute(q)
                mysql_conn.commit()
                seqid = cur.lastrowid
                if args.verbose:
                    print('seqid:'+str(seqid)+' q: '+q)
                if seqid == 0:
                    q2 = "select sequence_id from sequence where sequence_comp = COMPRESS('%s')" % (seq)
                
                    cur.execute(q2)
                    mysql_conn.commit() 
                    row = cur.fetchone()
                    if args.verbose:
                       print('Found seqid:')
                       print(row)
                    try:
                    	seqid=row[0]
                    except:
                    	print('MISSING row[0]')
                #print ('seqid',seqid)
                args.SEQ_COLLECTOR[ds][seq]['sequence_id'] = seqid
                tax_id = str(args.SEQ_COLLECTOR[ds][seq]['tax_id'])
            
            
                rank_id = str(args.SEQ_COLLECTOR[ds][seq]['rank_id'])
           
            
                if args.classifier.upper() == 'GAST':
                    distance = str(args.SEQ_COLLECTOR[ds][seq]['distance'])
                    q = "INSERT into silva_taxonomy_info_per_seq"
                    q += " (sequence_id,silva_taxonomy_id,gast_distance,refssu_id,rank_id)"
                    q += " VALUES ('%s','%s','%s','0','%s')" % (str(seqid), tax_id, distance, rank_id)
                    q += " ON DUPLICATE KEY UPDATE silva_taxonomy_id='"+tax_id+"', gast_distance='"+distance+"',refssu_id='0', rank_id='"+rank_id+"'"
                    
                    q3 = "SELECT silva_taxonomy_info_per_seq_id from silva_taxonomy_info_per_seq"
                    
                    q4 = "INSERT into sequence_uniq_info (sequence_id, silva_taxonomy_info_per_seq_id)"
                    q4 += " VALUES('%s','%s') ON DUPLICATE KEY UPDATE silva_taxonomy_info_per_seq_id = VALUES(silva_taxonomy_info_per_seq_id)"
                    #q4 = "INSERT ignore into sequence_uniq_info (sequence_id, silva_taxonomy_info_per_seq_id)"
                    #q4 += " VALUES('%s','%s') "
                elif args.classifier.upper() == 'RDP':
                    boot_score = args.SEQ_COLLECTOR[ds][seq]['distance']
                    q = "INSERT into rdp_taxonomy_info_per_seq"
                    q += " (sequence_id,rdp_taxonomy_id,rank_id,boot_score)"
                    q += " VALUES ('%s','%s','%s','%s')" % (str(seqid), tax_id, rank_id, boot_score)
                    q += " ON DUPLICATE KEY UPDATE rdp_taxonomy_id='"+tax_id+"', rank_id='"+rank_id+"'"
                    
                    q3 = "SELECT rdp_taxonomy_info_per_seq_id from rdp_taxonomy_info_per_seq"
                    
                    q4 = "INSERT into sequence_uniq_info (sequence_id, rdp_taxonomy_info_per_seq_id)"
                    q4 += " VALUES('%s','%s') ON DUPLICATE KEY UPDATE rdp_taxonomy_info_per_seq_id = VALUES(rdp_taxonomy_info_per_seq_id)"
                    #q4 = "INSERT ignore into sequence_uniq_info (sequence_id, silva_taxonomy_info_per_seq_id)"
                    #q4 += " VALUES('%s','%s') "
                elif args.classifier.upper() == 'SPINGO':
                    seq_count = str(args.SEQ_COLLECTOR[ds][seq]['seq_count'])
                    q = "INSERT ignore into generic_taxonomy_info_per_seq"
                    q += " (sequence_id,generic_taxonomy_id,rank_id)"
                    q += " VALUES ('%s','%s','%s')" % (str(seqid), tax_id, rank_id)
                    q += " ON DUPLICATE KEY UPDATE generic_taxonomy_id='"+tax_id+"', rank_id='"+rank_id+"'"
                    
                    q3 = "SELECT generic_taxonomy_info_per_seq_id from generic_taxonomy_info_per_seq"
                    # not sure if this is correct:
                    q4 = "INSERT into sequence_uniq_info (sequence_id, silva_taxonomy_info_per_seq_id)"
                    q4 += " VALUES('%s','%s') ON DUPLICATE KEY UPDATE silva_taxonomy_info_per_seq_id = VALUES(silva_taxonomy_info_per_seq_id)"
                    #q4 = "INSERT ignore into sequence_uniq_info (sequence_id, silva_taxonomy_info_per_seq_id)"
                    #q4 += " VALUES('%s','%s') "
                else:
                    print('ERROR')
                
                if args.verbose:
                    print(q)
                cur.execute(q)
                mysql_conn.commit()
                tax_seq_id = cur.lastrowid
                if tax_seq_id == 0:
                
                    q3 += " where sequence_id = '"+str(seqid)+"'"
                    if args.verbose:
                        print(q3)
                    #print 'DUP silva_tax_seq'
                    cur.execute(q3)
                    mysql_conn.commit() 
                    row = cur.fetchone()
                    tax_seq_id=row[0]
        
                
                
                #print(q4)
                q4 = q4 % (str(seqid), str(tax_seq_id))
                #print(q4)
                cur.execute(q4)
                mysql_conn.commit()
            ## don't see that we need to save uniq_ids
        mysql_conn.commit()
    #print args.SEQ_COLLECTOR    

#
#
#
def push_taxonomy(args):
    
    #global SUMMED_TAX_COLLECTOR
    global mysql_conn, cur      
    args.SEQ_COLLECTOR = {}
    analysis_dir = os.path.join(args.project_dir,'analysis')
    print('Suppressing MySQL Warnings here in database_loader:taxonomy')
    for ds in CONFIG_ITEMS['datasets']:
        args.SEQ_COLLECTOR[ds] = {}
    ds_count = len(CONFIG_ITEMS['datasets'])
    #for i,dir in enumerate(os.listdir(analysis_dir)): 
    
    for i,ds in enumerate(CONFIG_ITEMS['datasets']):
        print('\nDS count:'+str(i+1)+'/'+str(ds_count))
        #ds = dir
        data_dir = os.path.join(analysis_dir,ds) 
        unique_file = os.path.join(data_dir,'seqfile.unique.fa')
        if args.verbose:
            print(' ')
            print ('reading seqfile',unique_file)
        f = fastalib.SequenceSource(unique_file)
        tmp_seqs = {}
        
        #print tax_file
        #print seq_file
        while f.next():
            items =  f.id.split('|')  # WILL have id|frequency:x
            if args.verbose:
                print(f.id)
                print('items',items)
            (id, freq) = get_id_and_frequency(f.id)
            #id = items[0].split()[0]
            tmp_seqs[id]={}
            #freq = items[1].split(':')[1]  # WILL have id|frequency:x
            
            tmp_seqs[id]['freq'] = freq
            tmp_seqs[id]['seq']= f.seq
        f.close()
        if args.classifier.upper() == 'GAST':
            #data_file   = os.path.join(data_dir, 'gast_out.txt')
            data_file   = unique_file+'.gast'
            
            if os.path.exists(data_file):
                run_gast_tax_file(args, ds, data_file, tmp_seqs)
            else:
                print ("cound not find file:",data_file)
        elif args.classifier.upper() == 'RDP':         
            data_file   = os.path.join(data_dir, 'rdp_out.rdp')
            if os.path.exists(data_file):            
                run_rdp_tax_file(args, ds, data_file, unique_file, tmp_seqs)
            else:
                print ("cound not find file:",data_file)
        elif args.classifier.upper() == 'SPINGO':
            data_dir = os.path.join(args.project_dir,'analysis',ds)             
            data_file   = os.path.join(data_dir, 'spingo_out.txt')
            if os.path.exists(data_file):            
                run_spingo_tax_file(args, ds, data_file, unique_file, tmp_seqs)
            else:
                print ("cound not find file:",data_file)
        else:
            sys.exit('No classifier found')
    if args.verbose:
        print('args.SEQ_COLLECTOR')
        print(args.SEQ_COLLECTOR)       
#
# 
#                               
def run_tax_by_seq_file(args,ds,tax_file, seqs):
    #tax_collector = {}
    
    tax_items = []
    with open(tax_file,'r') as fh:
        for line in fh:
            
            items = line.strip().split("\t")
            #TGGATTTGACATCCCG  Bacteria;Proteobacteria;Deltaproteobacteria    genus   1   0.01500 v6_CH494
            seq = items[0]           
            tax_string = items[1]
            rank = items[2]
            seq_count = items[3]
            distance = items[4]
            refhvr_ids = items[5]           
            
            if rank == 'class': rank = 'klass'
            if rank == 'orderx': rank = 'order'            
            
            tax_items = tax_string.split(';')
            if tax_items != []:
                finish_tax(ds, refhvr_ids, rank, distance, seq, seq_count, tax_items)
#
#
#                               
def run_gast_tax_file(args, ds, tax_file, seqs):
    #tax_collector = {}
    tax_items = []
    
    with open(tax_file,'r') as fh:
        n=0
        for line in fh:
            line = line.strip()
            items = line.split("\t")
            
            
            if n==0: 
                n = n+1
                continue
            (read_id, seq_count) = get_id_and_frequency(items[0])
            
            seq = seqs[read_id]['seq']
            if read_id not in seqs:
                sys.exit('Could not find sequence from id in gast file:',read_id)
            if args.verbose:
                print('line',line)
                print('items',items)
              
            #if ds_file != ds:
            #    sys.exit('Dataset file--name mismatch -- Confused! Exiting!')
            tax_string = items[1]
            distance = items[2]
            rank = items[3]
            
            
            if rank == 'class': rank = 'klass'
            if rank == 'orderx': rank = 'order'
            refssu_count = items[4]
            
            refhvr_ids = items[10]
            tax_items = tax_string.split(';')
            if args.verbose:
                print('id:',read_id,'seq:',seq)
                print('tax_string:',tax_string,'refhvr_ids:',refhvr_ids,'rank:',rank,'seq_count:',seq_count,'distance:',distance)
            if tax_items != []:
                finish_tax(ds, refhvr_ids, rank, distance, seq, seq_count, tax_items)
            
#
#
#                
def run_rdp_tax_file(args, ds, tax_file, seq_file, seqs): 
    minboot = 80
    
    print('tax_file: '+tax_file)    
    tax_items = []
    with open(tax_file,'r') as fh:
        for line in fh:
            tax_items = []
            line = line.strip()
            items = line.split("\t")
            if args.verbose:
                print(items)
            # ['21|frequency:1', '', 'Bacteria', 'domain', '1.0', '"Firmicutes"', 'phylum', '1.0', '"Clostridia"', 'class', '1.0', 'Clostridiales', 'order', '1.0', '"Ruminococcaceae"', 'family', '1.0', 'Faecalibacterium', 'genus', '1.0']
            # if boot_value > minboot add to tax_string
            read_id = items[0].split('|')[0]   # WILL have id|frequency:x
            seq_count = seqs[read_id]['freq']
            #seq_count =1
            tax_line = items[2:]
            if args.verbose:
                print (tax_line)
            for i in range(0,len(tax_line),3):
                  #print i,tax_line[i]
                  tax_name = tax_line[i].strip('"').strip("'")
                  bootstrap = float(tax_line[i+2])*100
                  #print boot,minboot
                  if i==0 and tax_name.lower() in accepted_domains and bootstrap > minboot:
                      tax_items.append(tax_name)
                  elif bootstrap > minboot:
                      tax_items.append(tax_name)
                  else:
                      pass
            rank = ranks[len(tax_items)-1]
            
            seq = seqs[read_id]['seq']
           
            if tax_items != []:                
                finish_tax(ds, '', rank, bootstrap, seq, seq_count, tax_items)
            else:
                print('Skipping dataset: '+ds)

def run_spingo_tax_file(args, ds, tax_file, seq_file, seqs):
    #tax_collector = {}
    tax_items = []
    if args.verbose:
        print(tax_file)
        print(seqs)
    with open(tax_file,'r') as fh:
        for line in fh:            
            line = line.strip()
            items = line.split("\t")
            if args.verbose:
                print('items',items)
            read_id = items[0].split('|')[0]
            seq = seqs[read_id]['seq']
            
            tax_string = items[4]
            if tax_string == 'AMBIGUOUS':
                tax_string = 'Unknown'
            tax_items = tax_string.split(';')
            refhvr_ids = ''
            rank = ranks[ len(tax_items) - 1 ]
            if rank == 'class': rank = 'klass'
            if rank == 'orderx': rank = 'order'
            seq_count = seqs[read_id]['freq']
            bootstrap = items[5]
            
            if tax_items != []:
                finish_tax(ds, refhvr_ids, rank, bootstrap, seq, seq_count, tax_items)           
            else:
                print('Skipping dataset: '+ds)
def finish_tax(ds, refhvr_ids, rank, distance, seq, seq_count, tax_items):
    if args.verbose:
        print('finish tax')
    global CONFIG_ITEMS
    
    #global IDS_BY_TAX
    global RANK_COLLECTOR
    #global TAX_ID_BY_RANKID_N_TAX
    #global SUMMED_TAX_COLLECTOR
    global mysql_conn, cur
    tax_string = ';'.join(tax_items)       
    #if ds not in SUMMED_TAX_COLLECTOR:
    #    SUMMED_TAX_COLLECTOR[ds]={}
    #print seq, seq_count, tax_string
    if args.verbose:
        print('ds, refhvr_ids, rank, distance, seq, seq_count, tax_items')
        print(ds, refhvr_ids, rank, distance, seq, seq_count, tax_items)
    args.SEQ_COLLECTOR[ds][seq] = {'dataset':ds,
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
    
    args.SEQ_COLLECTOR[ds][seq]['rank_id'] = row[0]          
    
    
   
    sumtax = ''
    for i in range(0,8):
        
        rank_id = RANK_COLLECTOR[ranks[i]]
        if len(tax_items) > i:
            
            taxitem = tax_items[i]
            
        else:
            taxitem = ranks[i]+'_NA'
        sumtax += taxitem+';'
        
    with warnings.catch_warnings():
        if args.warnings:
            warnings.simplefilter("default")
        else:
            warnings.simplefilter("ignore")
            
        cur = mysql_conn.cursor()
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
                        # if rank_name in tax_collector:
                        #     tax_collector[rank_name].append(t)
                        # else:
                        #     tax_collector[rank_name] = [t]
                else:
                    t = rank_name+'_NA'
            
            
                
                q2 = "INSERT ignore into `"+rank_name+"` (`"+rank_name+"`) VALUES('"+t+"')"
           
                cur.execute(q2)
                mysql_conn.commit() 
                tax_id = cur.lastrowid
                if tax_id == 0:
                    q3 = "select "+rank_name+"_id from `"+rank_name+"` where `"+rank_name+"` = '"+t+"'"
                
                    cur.execute(q3)
                    mysql_conn.commit() 
                    row = cur.fetchone()
                    tax_id=row[0]
                ids_by_rank.append(str(tax_id))
           
        
            if args.classifier.upper() == 'GAST':
                q4 =  "INSERT ignore into silva_taxonomy ("+','.join(eight_cats)+",created_at)"
                q5 = "SELECT silva_taxonomy_id from silva_taxonomy where ("
            elif args.classifier.upper() == 'RDP':
                q4 =  "INSERT ignore into rdp_taxonomy ("+','.join(eight_cats)+",created_at)"
                q5 = "SELECT rdp_taxonomy_id from rdp_taxonomy where ("
            elif args.classifier.upper() == 'SPINGO':
                q4 =  "INSERT ignore into generic_taxonomy ("+','.join(eight_cats)+",created_at)"
                q5 = "SELECT generic_taxonomy_id from generic_taxonomy where ("
            q4 += " VALUES("+','.join(ids_by_rank)+",CURRENT_TIMESTAMP())"
            #
            if args.verbose:
                print (q4)
            cur.execute(q4)
            mysql_conn.commit() 
            tax_id = cur.lastrowid
            if tax_id == 0:
                vals = ''
                for i in range(0,len(eight_cats)):
                    vals += ' '+eight_cats[i]+"="+ids_by_rank[i]+' and'
                q5 = q5 + vals[0:-3] + ')'
                if args.verbose:
                    print (q5)
                cur.execute(q5)
                mysql_conn.commit() 
                row = cur.fetchone()
                tax_id=row[0]
            
        
            #IDS_BY_TAX[tax_string] = tax_id
            args.SEQ_COLLECTOR[ds][seq]['tax_id'] = tax_id
        
                   

             
def get_config_data(args):
    # convert a vamps user upload config file: use INFO-TAX.config
    # change vamps_user to owner <and use one that is already in db >
    # owner_id and project_id gathered automatically 
    global CONFIG_ITEMS
    
    config = ConfigParser.ConfigParser()
    config.optionxform=str
    
    
    config_path =  os.path.join(args.project_dir,args.config_file)
       
        
    config.read(config_path)
    
    for name, value in  config.items('MAIN'): 
         CONFIG_ITEMS[name] = value
    datasets = {}
    for dsname, count in  config.items('MAIN.dataset'):
        #print '  %s = %s' % (name, value) 
        ds = dsname
        if int(count) > 0:
            datasets[ds] = count
    CONFIG_ITEMS['datasets'] = datasets    
    print (CONFIG_ITEMS )
       
def get_dataset_and_seqid_from_defline(defline):
    print('defline',defline) 
    # HWI-ST753:99:C038WACXX:1:1101:3683:2249 1:N:0: orig_bc=GACAATCTGCTT new_bc=GACAATCTGCTT bc_diffs=0
    dlitems =     defline.split()
    dataset = '_'.join(dlitems[0].split('_')[:-1])
    seqid = dlitems[1]
    return (dataset, seqid)
    
def get_id_and_frequency(full_id):
    item_zero_items = full_id.split('|')  # splits off |frequency:1
    #SWD7_900|SRR6012543.900 900 length=251|127:d|m/o:0.000000|MR:n=0;r1=0;r2=0|Q30:n/a|CO:0|mismatches:0|frequency:24
    id = ''.join(item_zero_items[0:-1])   # remove |frequency:1
    freq = item_zero_items[-1].split(':')[1]
    return (id,freq)

if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: vamps_script_database_loader.py  [options]
         
       uploads to new vamps  
         where
            
		-a/--partial this will bypass project check for unique-ness; allows adding datasets
	         use: split INFO.config into multiple datasets  [Default:False]
        
        -v verbose
        
        -host/--host vamps or vampsdev or [Default:local]
        
        -class/--class classifier [GAST:RDP:SPINGO] [Default:GAST]
        
        -project_dir Full path of project directory [Required] 
        	Contains config file and analysis dir wirh ds and taxonomy files
        
        -config  Name only of config file. Must be in project_dir [Required]
           
         
"""

    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
    
    
    parser.add_argument('-db', '--NODE_DATABASE',         
                required=False,   action="store",  dest = "NODE_DATABASE",   default='vamps2',         
                help = 'node database') 
    
    parser.add_argument('-class', '--classifier',         
                required=False,   action="store",  dest = "classifier",  default='GAST',            
                help = 'GAST or RDP or SPINGO')  
    
    parser.add_argument("-project_dir", "--project_dir",    
                required=True,  action="store",   dest = "project_dir", 
                help = '')         
    parser.add_argument("-host", "--host",    
                required=False,  action="store",   dest = "host", default='local',
                help = '')
    parser.add_argument("-config", "--config",    
                required=True,  action="store",   dest = "config_file", 
                help = 'config file name') 
    parser.add_argument("-v", "--verbose",    
                required=False,  action="store_true",   dest = "verbose", default=False,
                help = 'chatty') 
    parser.add_argument("-w", "--warnings",    
                required=False,  action="store_true",   dest = "warnings",  default=False,
                help = 'MySQL warnings off by default')
    parser.add_argument("-json", "--json_file_path",    
                required=False,  action="store",   dest = "jsonfile_dir",  default='undefined',
                help = 'json_file_path for local')
    parser.add_argument("-a", "--partial",
                required=False,  action="store_true",   dest = "partial",  default=False,
                help = 'Partial: script will not check for project')
    args = parser.parse_args() 
    
    # convert args to a dict for passing to fxn
    my_args = vars(args)
    if args.host == 'vamps' or args.host == 'vampsdb' or args.host == 'bpcweb8':
        args.hostname = 'vampsdb'
        my_args["jsonfile_dir"] = '/groups/vampsweb/vamps/nodejs/json/'
    elif args.host == 'vampsdev' or args.host == 'bpcweb7':
        args.hostname = 'bpcweb7'
        my_args["jsonfile_dir"] = '/groups/vampsweb/vampsdev/nodejs/json/'
    else:
        args.hostname = 'localhost'
        args.NODE_DATABASE = 'vamps_development'
        if args.jsonfile_dir == 'undefined':
            sys.exit('localhost::You must add --json_file_path to command line!')
        else:            
            if os.path.exists(args.jsonfile_dir):
                print ('Validated: json file path')
                my_args["jsonfile_dir"] = args.jsonfile_dir
            else:
                print ("Could not find json directory (-json_file_path): '",args.jsonfile_dir,"'-Exiting")
                sys.exit(-1)
    
    
    print ('db-host:',args.hostname,'db-name:',args.NODE_DATABASE)
    pid = start(args)
    print("Finished; PID=" + str(pid))
    if args.partial:
        print('Need to run metadata and files:')
        print('Exiting')
        sys.exit()
    else:            

        #Script2
        import vamps_script_upload_metadata as md
        my_args["project"] = CONFIG_ITEMS['project_name']
        md.start_metadata_load_from_file(my_args)
        print(my_args)


        #Script3
        import vamps_script_create_json_dataset_files as file_maker
        
        if args.classifier == 'RDP':
    	    my_args["units"] = 'rdp'
        elif args.classifier == 'SPINGO':
    	    my_args["units"] = 'generic'
        else:
    	    my_args["units"] = 'silva119'
        file_maker.go_add(my_args)
        print("FINISHED -- LOAD -- METADATA -- FILES")