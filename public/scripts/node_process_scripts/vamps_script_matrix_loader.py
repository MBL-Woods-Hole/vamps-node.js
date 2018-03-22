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

import datetime
import logging
today = str(datetime.date.today())
import subprocess
import pymysql as MySQLdb
import pprint
pp = pprint.PrettyPrinter(indent=4)


# Global:
 # SUMMED_TAX_COLLECTOR[ds][rank][tax_string] = count

ranks =['domain','phylum','klass','order','family','genus','species','strain']
generic = ['domain_id','phylum_id','klass_id','order_id','family_id','genus_id','species_id','strain_id']
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
    
    global SEQ_COLLECTOR
    global DATASET_ID_BY_NAME
    global GENERIC_IDS_BY_TAX
    global RANK_COLLECTOR
    global TAX_ID_BY_RANKID_N_TAX
    global SUMMED_TAX_COLLECTOR
    
    SEQ_COLLECTOR = {}
    DATASET_ID_BY_NAME = {}
    GENERIC_IDS_BY_TAX = {}
    RANK_COLLECTOR={}
    TAX_ID_BY_RANKID_N_TAX = {}
    SUMMED_TAX_COLLECTOR = {} 
    logging.info('CMD> '+' '.join(sys.argv))
    print ('CMD> ',sys.argv)

    NODE_DATABASE = args.NODE_DATABASE

    
    
    
    global mysql_conn, cur    
   
    os.chdir(args.project_dir)
    if args.host == 'vamps' or args.host == 'vampsdb' or args.host == 'bpcweb8':
        hostname = 'vampsdb'
    elif args.host == 'vampsdev' or args.host == 'bpcweb7':
        hostname = 'bpcweb7'
    else:
        hostname = 'localhost'
        args.NODE_DATABASE = 'vamps_development'
        
    mysql_conn = MySQLdb.connect(db = args.NODE_DATABASE, host=hostname, read_default_file=os.path.expanduser("~/.my.cnf_node")  )
    # socket=/tmp/mysql.sock
    cur = mysql_conn.cursor()
    
    
    #logging.info("running get_config_data")
    #print ("running get_config_data")
    #get_config_data(args.project_dir)
    
    logging.info("checking user")
    print ("checking user")
    args.user_id = check_user()  ## script dies if user not in db
    
    logging.info("checking project")
    print ("checking project")
    check_project()  ## script dies if project is in db
        
    logging.info("recreating ranks")
    print ("recreating ranks")
    recreate_ranks()  # this is only needed on 'new' databases.

    logging.info("Parsing Matrix File")
    print("Parsing Matrix File")
    args.tax_data_by_ds = parse_matrix_file()

    logging.info("classifier")
    print ("classifier")
    args.classid = create_classifier()

    logging.info("starting taxonomy")
    print ("starting taxonomy")
    push_taxonomy(args)

    logging.info("projects")
    print ("projects")
    args.pid = push_project()

    logging.info("datasets")
    print ("datasets")
    push_dataset()

    sys.exit()
    logging.info("starting push_pdr_seqs")
    print ("starting push_pdr_seqs")
    push_pdr_seqs(args)


    logging.info("Finished "+os.path.basename(__file__))
    print ("Finished "+os.path.basename(__file__))
    print (args.pid)
    print ('Writing pid to pid.txt')
    fp = open(os.path.join(args.project_dir,'pid.txt'),'w')
    fp.write(str(args.pid))
    fp.close()

    return args.pid
        
    
def check_user():
    """
    check_user()
      the owner/user (from config file) must be present in 'user' table for script to continue
    """
    
    global mysql_conn, cur
    q = "select user_id from user where username='%s'" % (args.user) 
    print(q)
    cur.execute(q)
    numrows = int(cur.rowcount)
    if numrows==0:
        sys.exit('Could not find owner: '+args.user+' --Exiting')
    row = cur.fetchone()
    return row[0]

def check_project():
    """
    check_project()
      the owner/user (from config file) must be present in 'user' table for script to continue
    """
    
    global mysql_conn, cur
    q = "SELECT project_id from `project` WHERE project='%s'" % (args.project)
    print(q)
    cur.execute(q)
    if cur.rowcount > 0:
        row = cur.fetchone()
        print('ERR***'+str(row[0])+'-'+args.project)
        sys.exit('Duplicate project name: '+q)
           
def parse_matrix_file():
    ifile = open(args.infile, 'r')
    reader = csv.reader(ifile,delimiter='\t')
    n=0
    tax_data_by_ds = {}  # tax_data[ds][tax] = count 
    temp = {}
    for row in reader:
        if n==0:
            datasets = row[1:]
            uniques = list(set(datasets))
            if len(datasets) != len(uniques):
                sys.exit("datasets are not unique")
            for ds in datasets:
                tax_data_by_ds[ds] = {}
                     
        else:
            tax = row[0]
            counts = row[1:]
            
            if len(datasets) != len(counts):
                sys.exit("Row"+str(n)+": number of counts don't equal number of datasets") 
            for m,cnt in enumerate(counts):
                tax_data_by_ds[datasets[m]][tax] = cnt
                        
        n += 1
    return tax_data_by_ds
    
        

def create_classifier():
    global mysql_conn, cur
    q = "SELECT classifier_id from `classifier` where classifier = 'unknown'"
    cur.execute(q)
    row = cur.fetchone()
    mysql_conn.commit()
    return row[0]
    
    
def recreate_ranks():
    
    global RANK_COLLECTOR
    global mysql_conn, cur
    for i,rank in enumerate(ranks):
        
        q = "INSERT IGNORE into rank (rank,rank_number) VALUES('%s','%s')" % (rank,str(i))
        logging.info(q)
        cur.execute(q)
        rank_id = cur.lastrowid
        if rank_id==0:
            q = "SELECT rank_id from rank where rank='%s'" % (rank)
            logging.info(q)
            cur.execute(q)
            row = cur.fetchone()
            RANK_COLLECTOR[rank] = row[0]
        else:
            RANK_COLLECTOR[rank] = rank_id
    mysql_conn.commit()

def push_project():
    
    global mysql_conn, cur
    desc = "Project Description"
    title = "Title"
    rev = args.project[::-1]
    fund = "Unknown"
    pub = 0  # private
    fields = ['project','title','project_description','rev_project_name','funding','owner_user_id','public']
    q = "INSERT into project ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s','%s','%s','%s','%s')"
    q = q % (args.project,title,desc,rev,fund,args.user_id,pub)
    print(q)
    logging.info(q)
    
    try:
        cur.execute(q)
        args.pid = cur.lastrowid
        logging.info("PID="+str(args.pid))
        print("PID="+str(args.pid))
        mysql_conn.commit()
        #print cur.lastrowid
    except:
        #print('ERROR: MySQL Integrity ERROR -- duplicate project name: '+proj)
        #sys.exit('ERROR: MySQL Integrity ERROR -- duplicate dataset: '+proj)
        return ('ERROR: Duplicate Project Name2: '+q)
    
    return args.pid
        
def push_dataset():
      
    global DATASET_ID_BY_NAME
    global mysql_conn, cur
    fields = ['dataset','dataset_description','project_id']
    q = "INSERT into dataset ("+(',').join(fields)+")"
    q += " VALUES('%s','%s','%s')"

    for ds in args.tax_data_by_ds.keys():
        desc = ds+'_description'
        
        q4 = q % (ds, desc, args.pid)
        logging.info(q4)
        print (q4)

        cur.execute(q4)
        did = cur.lastrowid
        print ('new did',did)
        DATASET_ID_BY_NAME[ds] = did
        mysql_conn.commit()    


def push_pdr_seqs(args):
    #print()
    gast_dbs = ['','','']

    global SEQ_COLLECTOR
    global DATASET_ID_BY_NAME
    global mysql_conn, cur
    for ds in SEQ_COLLECTOR:
        for seq in SEQ_COLLECTOR[ds]:
            did = DATASET_ID_BY_NAME[ds]
            seqid = SEQ_COLLECTOR[ds][seq]['sequence_id']
            count = SEQ_COLLECTOR[ds][seq]['seq_count']
            q = "INSERT into sequence_pdr_info (dataset_id, sequence_id, seq_count, classifier_id)"
                        
            q += " VALUES ('%s','%s','%s','%s')"   


           
            print (q)
            #print()
            logging.info(q)
            try:
                cur.execute(q % (str(did),str(seqid),str(count),str(args.classid)))
            except:
                logging.error(q)
                print ("ERROR Exiting: "+ds +"; Query: "+q)
                print (DATASET_ID_BY_NAME)
                sys.exit()
            mysql_conn.commit()
    


#
#
#
def push_taxonomy(args):
    
    global SUMMED_TAX_COLLECTOR
    global mysql_conn, cur
    
    # for dir in os.listdir(gast_dir): 
#         ds = dir
#         SEQ_COLLECTOR[ds] = {}
        # if 'input_type' in args and args.input_type == 'tax_by_seq':
#             tax_file = os.path.join(gast_dir, dir,'sequences_n_taxonomy.txt')
#             unique_file = os.path.join(gast_dir, dir, 'unique.fa')
#             if os.path.exists(tax_file):
#                 run_tax_by_seq_file(args, ds, tax_file)
#         elif classifier.upper() == 'GAST':
#             gast_dir = os.path.join(indir,'analysis','gast') 
#             tax_file = os.path.join(gast_dir, dir, 'vamps_sequences_pipe.txt')
#             if os.path.exists(tax_file):
#                 run_gast_tax_file(args, ds, tax_file)
#         elif classifier.upper() == 'RDP':
#             rdp_dir = os.path.join(indir,'analysis','rdp') 
#             tax_file = os.path.join(rdp_dir, dir, 'rdp_out.txt')
#             unique_file = os.path.join(rdp_dir, dir, 'unique.fa')
#             if os.path.exists(tax_file):
#                 run_rdp_tax_file(args, ds, tax_file, unique_file)
#         else:
    
 
    for ds in args.tax_data_by_ds.keys():
        print('ds:'+ds)
        for tax in args.tax_data_by_ds[ds]:
            tax_items = tax.split(';')
            rank =  ranks[len(tax_items) - 1]  #string
            rank_id = RANK_COLLECTOR[rank]
            seq_count = args.tax_data_by_ds[ds][tax]
            finish_tax(ds, rank, seq_count, tax_items)
#
#
# 
#                               
# def run_tax_by_seq_file(args,ds,tax_file):
#     #tax_collector = {}
#     
# 
#     tax_items = []
#     with open(tax_file,'r') as fh:
#         for line in fh:
#             
#             items = line.strip().split("\t")
#             #TGGATTTGACATCCCG  Bacteria;Proteobacteria;Deltaproteobacteria    genus   1   0.01500 v6_CH494
#             seq = items[0]           
#             tax_string = items[1]
#             rank = items[2]
#             seq_count = items[3]
#             distance = items[4]
#             refhvr_ids = items[5]           
#             
#             if rank == 'class': rank = 'klass'
#             if rank == 'orderx': rank = 'order'            
#             
#             tax_items = tax_string.split(';')
#             if tax_items != []:
#                 finish_tax(ds, refhvr_ids, rank, distance, seq, seq_count, tax_items)
#
#
#                               
# def run_gast_tax_file(args,ds,tax_file):
#     #tax_collector = {}
#     tax_items = []
#     with open(tax_file,'r') as fh:
#         for line in fh:
#             print(line)
#             items = line.strip().split("\t")
#             if items[0] == 'HEADER': continue
#             seq = items[0]
#             ds_file = items[2]
#             if ds_file != ds:
#                 sys.exit('Dataset file--name mismatch -- Confused! Exiting!')
#             tax_string = items[3]
#             refhvr_ids = items[4]
#             rank = items[5]
#             if rank == 'class': rank = 'klass'
#             if rank == 'orderx': rank = 'order'
#             seq_count = items[6]
#             distance = items[8]
#             tax_items = tax_string.split(';')
#             if tax_items != []:
#                 finish_tax(ds,refhvr_ids,rank,distance,seq,seq_count,tax_items)

     
#
#
#                
# def run_rdp_tax_file(args,ds, tax_file, seq_file): 
#     minboot = 80
#     print ('reading seqfile',seq_file)
#     f = fastalib.SequenceSource(seq_file)
#     tmp_seqs = {}
#     #print tax_file
#     #print seq_file
#     while f.next():
#         id = f.id.split('|')[0]  # may have |frequency
#         #print 'id1',id
#         tmp_seqs[id]= f.seq
#     f.close()
#         
#     tax_items = [] 
#     with open(tax_file,'r') as fh:
#         for line in fh:
#             tax_items = []
#             items = line.strip().split("\t")
#             
#             # ['21|frequency:1', '', 'Bacteria', 'domain', '1.0', '"Firmicutes"', 'phylum', '1.0', '"Clostridia"', 'class', '1.0', 'Clostridiales', 'order', '1.0', '"Ruminococcaceae"', 'family', '1.0', 'Faecalibacterium', 'genus', '1.0']
#             # if boot_value > minboot add to tax_string
#             tmp = items[0].split('|')
#             seq_id = tmp[0]
#             seq_count = tmp[1].split(':')[1]
#             #seq_count =1
#             tax_line = items[2:]
#             print ('id',seq_id)
#             print ('cnt',seq_count)
#             print (tax_line)
#             for i in range(0,len(tax_line),3):
#                   #print i,tax_line[i]
#                   tax_name = tax_line[i].strip('"').strip("'")
#                   rank = tax_line[i+1]
#                   boot = float(tax_line[i+2])*100
#                   #print boot,minboot
#                   if i==0 and tax_name.lower() in accepted_domains and boot > minboot:
#                       tax_items.append(tax_name)
#                   elif boot > minboot:
#                       tax_items.append(tax_name)
#                   else:
#                       pass
#             rank = ranks[len(tax_items)-1]
#             
#             seq= tmp_seqs[seq_id]
#             #print seq
#             #print tax_items
#             distance = None
#             
#             if tax_items != []:                
#                 finish_tax(ds,'',rank,distance,seq,seq_count,tax_items)
#             
            
def finish_tax(ds, rank, seq_count, tax_items):
    #tax_collector = {} 
    
    print('IN finish_tax')
    print(ds, rank, seq_count, tax_items)
    return
    global DATASET_ID_BY_NAME
    global GENERIC_IDS_BY_TAX
    global RANK_COLLECTOR
    global TAX_ID_BY_RANKID_N_TAX
    global SUMMED_TAX_COLLECTOR
    global mysql_conn, cur
    tax_string = ';'.join(tax_items)       
    if ds not in SUMMED_TAX_COLLECTOR:
        SUMMED_TAX_COLLECTOR[ds]={}
    #print seq, seq_count, tax_string
    SEQ_COLLECTOR[ds][seq] = {'dataset':ds,
                          'taxonomy':tax_string,
                          'refhvr_ids':refhvr_ids,
                          'rank':rank,
                          'seq_count':seq_count,
                          'distance':distance
                          }
    
   
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
                    # if rank_name in tax_collector:
                    #     tax_collector[rank_name].append(t)
                    # else:
                    #     tax_collector[rank_name] = [t]
            else:
                t = rank_name+'_NA'
            
            
                
            q2 = "INSERT ignore into `"+rank_name+"` (`"+rank_name+"`) VALUES('"+t+"')"
            logging.info(q2)
            cur.execute(q2)
            mysql_conn.commit() 
            tax_id = cur.lastrowid
            if tax_id == 0:
                q3 = "select "+rank_name+"_id from `"+rank_name+"` where `"+rank_name+"` = '"+t+"'"
                logging.info( q3 )
                cur.execute(q3)
                mysql_conn.commit() 
                row = cur.fetchone()
                tax_id=row[0]
            ids_by_rank.append(str(tax_id))
            #else:
            #logging.info( 'rank_id,t,tax_id',rank_id,t,tax_id  )  
            if rank_id in TAX_ID_BY_RANKID_N_TAX:
                TAX_ID_BY_RANKID_N_TAX[rank_id][t] = tax_id
            else:
                TAX_ID_BY_RANKID_N_TAX[rank_id]={}
                TAX_ID_BY_RANKID_N_TAX[rank_id][t] = tax_id
            #ids_by_rank.append('1')
        logging.info(  ids_by_rank )  
        q4 =  "INSERT ignore into generic_taxonomy ("+','.join(generic)+",created_at)"
        q4 += " VALUES("+','.join(ids_by_rank)+",CURRENT_TIMESTAMP())"
        #
        logging.info(q4)
        print (q4)
        cur.execute(q4)
        mysql_conn.commit() 
        generic_tax_id = cur.lastrowid
        if generic_tax_id == 0:
            q5 = "SELECT generic_taxonomy_id from generic_taxonomy where ("
            vals = ''
            for i in range(0,len(generic)):
                vals += ' '+generic[i]+"="+ids_by_rank[i]+' and'
            q5 = q5 + vals[0:-3] + ')'
            #print (q5)
            logging.info(q5)
            cur.execute(q5)
            mysql_conn.commit() 
            row = cur.fetchone()
            generic_tax_id=row[0]
            print ('generic_tax_id',generic_tax_id)
        
        GENERIC_IDS_BY_TAX[tax_string] = generic_tax_id
        SEQ_COLLECTOR[ds][seq]['generic_tax_id'] = generic_tax_id
        
                
                
                
    #print SEQ_COLLECTOR
                
                
            
            
            

             
# def get_config_data(indir):
#     # convert a vamps user upload config file: use INFO-TAX.config
#     # change vamps_user to owner <and use one that is already in db >
#     # owner_id and project_id gathered automatically 
#     global CONFIG_ITEMS
#     
#     config = ConfigParser.ConfigParser()
#     config.optionxform=str
#     
#     
#     config_infile =  os.path.join(indir,'config.ini')
#        
#         
#     config.read(config_infile)
#     try:
#         for name, value in  config.items('GENERAL'):  
#             CONFIG_ITEMS[name] = value
#     except:
#         for name, value in  config.items('MAIN'): 
#             CONFIG_ITEMS[name] = value
#     datasets = {}
#     for dsname, count in  config.items('DATASETS'):
#         #print '  %s = %s' % (name, value) 
#         ds = dsname 
#         datasets[ds] = count
#     CONFIG_ITEMS['datasets'] = datasets    
#     #print (CONFIG_ITEMS )
#        

if __name__ == '__main__':
    import argparse
    
    
    myusage = """usage: vamps_script_database_loader.py  [options]
         
       uploads matrix to new vamps  
         where
            
            -d/--project_dir   This is the base directory where matrix file is located.
            -i/--in             infile
            -host/--host        vampsdb, or vampsdev or localhost
                            

"""

    parser = argparse.ArgumentParser(description="" ,usage=myusage)                 
    
    
    
    
    parser.add_argument('-db', '--NODE_DATABASE',         
                required=False,   action="store",  dest = "NODE_DATABASE",  default='vamps2',          
                help = 'node database') 
    
                                              
    parser.add_argument("-i", "--in",    
                required=True,  action="store",   dest = "infile", default='unknown',
                help = 'no path: filename')
    parser.add_argument("-p", "--project",    
                required=True,  action="store",   dest = "project", 
                help = 'no path: project name')     
    parser.add_argument("-d", "--project_dir",    
                required=True,  action="store",   dest = "project_dir", 
                help = 'path')         
    parser.add_argument("-host", "--host",    
                required=False,  action="store",   dest = "host", default='bpcweb7',
                help = '')
    parser.add_argument("-u", "--user",    
                required=True,  action="store",   dest = "user", 
                help = 'vamps user name')
                
    args = parser.parse_args() 
    start(args)
