#!/usr/bin/env python

##!/usr/local/www/vamps/software/python/bin/python

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
#sys.path.append("/bioware/pythonmodules/illumina-utils/")



import shutil
import types
from time import sleep, time, gmtime, strftime
# from pipeline.utils import *
# from pipeline.sample import Sample
# from pipeline.runconfig import RunConfig
# from pipeline.run import Run
# from pipeline.chimera import Chimera
from gast import Gast
# from pipeline.vamps import Vamps
from vamps import Vamps
# #from pipeline.pipelinelogging import logging
# from pipeline.trim_run import TrimRun
# from pipeline.get_ini import readCSV
# from pipeline.metadata import MetadataUtils
# from pipeline.illumina_files import IlluminaFiles
# from inspect import currentframe, getframeinfo
import constants as C
import logging
import json    
#import IlluminaUtils.lib.fastalib as u
#import fastalib as fa
#from pipeline.fasta_mbl_pipeline import MBLPipelineFastaUtils
#from pipeline.db_upload import MyConnection, dbUpload 
# from pipeline.utils import Dirs


# the main loop for performing each of the user's supplied steps
def process(runobj, steps):
    
    #logging1 = logging.getLogger('/Users/avoorhis/programming/vamps-node.js/user_data/vamps_dev_mobe/andy/project:test24/log.txt')
    #logging1.debug('Quick zephyrs blow, vexing daft Jim.')
    
    requested_steps = steps.split(",")            
    if 'clean' in requested_steps and len(requested_steps) > 1:
        sys.exit("The clean step cannot be combined with other steps - Exiting")
       
    # Open run STATUS File here.
    # open in append mode because we may start the run in the middle
    # say at the gast stage and don't want to over write.
    # if we re-run trimming we'll get two trim status reports
    runobj.run_status_file_h = open(runobj.run_status_file_name, "a")
    
    # loop through official list...this way we execute the
    # users requested steps in the correct order 

    for step in C.existing_steps:
        if step in requested_steps:
            # call the method in here
            step_method = globals()[step]
            step_method(runobj)
        

def validate(runobj):
    #open_zipped_directory(runobj.run_date, runobj.output_dir)
    #logging.debug("Validating")
    pass
    #v = MetadataUtils(run, validate=True)
    
    #print 'Validates:  Configfile and Run Object'
    #runobj.run_status_file_h.write(strftime("%Y-%m-%d %H:%M:%S", gmtime.time())+"\tConfigFile Validated\n")

    

##########################################################################################
# perform trim step
# TrimRun.trimrun() does all the work of looping over each input file and sequence in each file
# all the stats are kept in the trimrun object
#
# when complete...write out the datafiles for the most part on a lane/runkey basis
#
def trim(runobj):
    # def is in utils.py
    #open_zipped_directory(runobj.run_date, runobj.output_dir)
    # (re) create the trim status file
    runobj.trim_status_file_h = open(runobj.trim_status_file_name, "w")
    idx_keys = get_keys(runobj)
    
    # do the trim work
    mytrim = TrimRun(runobj, idx_keys) 
    
    # pass True to write out the straight fasta file of all trimmed non-deleted seqs
    # Remember: this is before chimera checking
    # trim_codes should alwas be a tuple with 3 elements!
    if runobj.vamps_user_upload:
        trim_codes = mytrim.trimrun_vamps(True)
    else:
        if runobj.platform == 'illumina':
            trim_codes = mytrim.filter_illumina()
    #        trim_codes = mytrim.trim_illumina(file_list = trim_codes[2])
        elif runobj.platform == '454':
            trim_codes = mytrim.trimrun_454(True)
        elif runobj.platform == 'ion-torrent':
            trim_codes = mytrim.trimrun_ion_torrent(True)        
        else:
            trim_codes = ('ERROR','No Platform Found','')
        
    trim_results_dict = {}
    if trim_codes[0] == 'SUCCESS':
        # setup to write the status
        new_lane_keys = trim_codes[2]
        trimmed_seq_count = trim_codes[1]
        if trimmed_seq_count == 0 or trimmed_seq_count == '0':
            trim_results_dict['status'] = "ERROR"
            logging.debug("Trimming finished: ERROR: no seqs passed trim")
        else:
            trim_results_dict['status'] = "success"
            logging.debug("Trimming finished successfully")
        
        trim_results_dict['new_lane_keys'] = new_lane_keys
        trim_results_dict['trimmed_seq_count'] = trimmed_seq_count
        
        # write the data files
        
        mytrim.write_data_files(new_lane_keys)
        runobj.trim_status_file_h.write(json.dumps(trim_results_dict)+"\n")
        runobj.trim_status_file_h.close()
        runobj.run_status_file_h.write(json.dumps(trim_results_dict)+"\n")
        runobj.run_status_file_h.close()
    else:
        logging.debug("Trimming finished ERROR")
        trim_results_dict['status'] = "ERROR"
        trim_results_dict['code1'] = trim_codes[1]
        trim_results_dict['code2'] = trim_codes[2]
        runobj.trim_status_file_h.write(json.dumps(trim_results_dict)+"\n")
        runobj.trim_status_file_h.close()
        runobj.run_status_file_h.write(json.dumps(trim_results_dict)+"\n")
        runobj.run_status_file_h.close()
        sys.exit("Trim Error")
        
        
    # def is in utils.py: truncates and rewrites
    #zip_up_directory(runobj.run_date, runobj.output_dir, 'w')

# chimera assumes that a trim has been run and that there are files
# sitting around that describe the results of each lane:runkey sequences
# it also expectes there to be a trim_status.txt file around
# which should have a json format with status and the run keys listed        
def chimera(runobj):
    chimera_cluster_ids = [] 
    logging.debug("Starting Chimera Checker")
    # lets read the trim status file out here and keep those details out of the Chimera code
    idx_keys = get_keys(runobj)
    #new_lane_keys = convert_unicode_dictionary_to_str(json.loads(open(runobj.trim_status_file_name,"r").read()))["new_lane_keys"]
    # Open run STATUS File here.
    # open in append mode because we may start the run in the middle
    # say at the gast stage and don't want to over write.
    # if we re-run trimming we'll get two trim status reports
    runobj.run_status_file_h = open(runobj.run_status_file_name, "a")
    
    mychimera = Chimera(runobj)
    logging.debug("\nStarting DeNovo Chimera")
    c_den    = mychimera.chimera_denovo()
    logging.debug("Ending DeNovo Chimera")
    if c_den[0] == 'SUCCESS':
        chimera_cluster_ids += c_den[2]   # add a list to a list
        logging.debug("chimera_cluster_ids: "+' '.join(chimera_cluster_ids))
        chimera_code='PASS'
    elif c_den[0] == 'NOREGION':
        chimera_code='NOREGION'
    elif c_den[0] == 'FAIL':
        chimera_code = 'FAIL'
    else:
        chimera_code='FAIL'

    logging.debug("Chimera DeNovo Code: "+chimera_code)
    logging.debug("\nStarting Reference Chimera")
    c_ref    = mychimera.chimera_reference()
    
    if c_ref[0] == 'SUCCESS':
        chimera_cluster_ids += c_ref[2]
        chimera_code='PASS'
    elif c_ref[0] == 'NOREGION':
        chimera_code = 'NOREGION'
    elif c_ref[0] == 'FAIL':
        chimera_code='FAIL'
    else:
        chimera_code='FAIL'
    
    #print chimera_cluster_ids
    runobj.chimera_status_file_h = open(runobj.chimera_status_file_name,"w")
    if chimera_code == 'PASS':  
        
        if runobj.use_cluster:
            chimera_cluster_code = wait_for_cluster_to_finish(chimera_cluster_ids) 
            if chimera_cluster_code[0] == 'SUCCESS':
                logging.info("Chimera checking finished successfully")
                runobj.chimera_status_file_h.write("CHIMERA SUCCESS\n")
                runobj.run_status_file_h.write("CHIMERA SUCCESS\n")
                
            else:
                logging.info("3-Chimera checking Failed")
                runobj.chimera_status_file_h.write("3-CHIMERA ERROR: "+str(chimera_cluster_code[1])+" "+str(chimera_cluster_code[2])+"\n")
                runobj.run_status_file_h.write("3-CHIMERA ERROR: "+str(chimera_cluster_code[1])+" "+str(chimera_cluster_code[2])+"\n")
                sys.exit("3-Chimera checking Failed")
        else:
            chimera_cluster_code = ['SUCCESS','Not using cluster']
            logging.info("Chimera checking finished without using cluster")
            runobj.chimera_status_file_h.write("CHIMERA SUCCESS--no cluster\n")
            runobj.run_status_file_h.write("CHIMERA SUCCESS--no cluster\n")
    elif chimera_code == 'NOREGION':
        logging.info("No regions found that need chimera checking")
        runobj.chimera_status_file_h.write("CHIMERA CHECK NOT NEEDED\n")
        runobj.run_status_file_h.write("CHIMERA CHECK NOT NEEDED\n")
        
    elif chimera_code == 'FAIL':
        logging.info("1-Chimera checking Failed")
        runobj.chimera_status_file_h.write("1-CHIMERA ERROR: \n")
        runobj.run_status_file_h.write("1-CHIMERA ERROR: \n")
        sys.exit("1-Chimera Failed")
    else:
        logging.info("2-Chimera checking Failed")
        runobj.chimera_status_file_h.write("2-CHIMERA ERROR: \n")
        runobj.run_status_file_h.write("2-CHIMERA ERROR: \n")
        sys.exit("2-Chimera checking Failed")
    
    sleep(2) 
    
    if  chimera_code == 'PASS' and  chimera_cluster_code[0] == 'SUCCESS':
        logging.info("Writing Chimeras to deleted files")
        mychimera.write_chimeras_to_deleted_file()

        # should also recreate fasta
        # then read chimera files and place (or replace) any chimeric read_id
        # into the deleted file.
        
        mymblutils = MBLPipelineFastaUtils(idx_keys, runobj)
        
        # write new cleaned files that remove chimera if apropriate
        # these are in fasta_mbl_pipeline.py
        # the cleaned file are renamed to the original name:
        # lane_key.unique.fa
        # lane_key.trimmed.fa
        # lane_key.names        -- 
        # lane_key.abund.fa     -- this file is for the uclust chimera script
        # lane_key.deleted.txt  -- no change in this file
        # THE ORDER IS IMPORTANT HERE:
        mymblutils.write_clean_fasta_file()
        mymblutils.write_clean_names_file()
        mymblutils.write_clean_uniques_file()
        mymblutils.write_clean_abundance_file()
        # write keys file for each lane_key - same fields as db table? for easy writing
        # write primers file for each lane_key
 
        
        # Write new clean files to the database
        # rawseq table not used
        # trimseq
        # runkeys
        # primers
        # run primers

        #mymblutils.write_clean_files_to_database()
        
    # def is in utils.py: appends
    #zip_up_directory(runobj.run_date, runobj.output_dir, 'a')




def gast(runobj):  
    
    
    # for vamps 'new_lane_keys' will be prefix 
    # of the uniques and names file
    # that was just created in vamps_gast.py
    # or we can get the 'lane_keys' directly from the config_file
    # for illumina:
    # a unique idx_key is a concatenation of barcode_index and run_key
    # Should return a list not a string
    idx_keys = get_keys(runobj)
    # get GAST object
    mygast = Gast(runobj, idx_keys)
    
    
    # Check for unique files and create them if not there
    result_code = mygast.check_for_unique_files(idx_keys)
    runobj.run_status_file_h.write(json.dumps(result_code)+"\n")
    if result_code['status'] == 'ERROR':
        logging.error("uniques not found failed")
        sys.exit("uniques not found failed")
        if runobj.vamps_user_upload:
            #write_status_to_vamps_db( runobj.site, runobj.run, "GAST ERROR", "uniques file not found - failed" )
            pass
    elif runobj.vamps_user_upload:
        #write_status_to_vamps_db( runobj.site, runobj.run, result_code['status'], result_code['message'] )
        pass
        
    sleep(5)
    
    # CLUSTERGAST
    result_code = mygast.clustergast()
    runobj.run_status_file_h.write(json.dumps(result_code)+"\n")
    if result_code['status'] == 'ERROR':
        logging.error("clutergast failed")
        sys.exit("clustergast failed")
        if runobj.vamps_user_upload:
            #write_status_to_vamps_db( runobj.site, runobj.run, "GAST ERROR", "clustergast failed" )
            pass
    elif runobj.vamps_user_upload:
        #write_status_to_vamps_db( runobj.site, runobj.run, result_code['status'], result_code['message'] )
        pass
        
    sleep(5)
    
    # GAST_CLEANUP
    result_code = mygast.gast_cleanup()
    runobj.run_status_file_h.write(json.dumps(result_code)+"\n")
    if result_code['status'] == 'ERROR':
        logging.error("gast_cleanup failed")        
        sys.exit("gast_cleanup failed")
        if runobj.vamps_user_upload:
            #write_status_to_vamps_db( runobj.site, runobj.run, "GAST ERROR", "gast_cleanup failed" )
            pass
    elif runobj.vamps_user_upload:
        #write_status_to_vamps_db( runobj.site, runobj.run, result_code['status'], result_code['message'] )
        pass
        
    sleep(5)
    
    # GAST2TAX
    result_code = mygast.gast2tax()
    runobj.run_status_file_h.write(json.dumps(result_code)+"\n")
    if result_code['status'] == 'ERROR':
        logging.error("gast2tax failed") 
        sys.exit("gast2tax failed")
        if runobj.vamps_user_upload:
            #write_status_to_vamps_db( runobj.site, runobj.run, "GAST ERROR", "gast2tax failed" )
            pass
    elif runobj.vamps_user_upload:
        #write_status_to_vamps_db( runobj.site, runobj.run, result_code['status'], result_code['message'] )
        pass
        # write has_tax=1 to INFO-TAX.config
            
def cluster(runobj):
    """
    TO be developed eventually:
        Select otu creation method
        using original trimmed sequences
    """
    pass
    
def vamps(runobj): 
    logging.info( 'Running vamps' )
    idx_keys = get_keys(runobj)
    myvamps = Vamps(runobj, idx_keys)
    # Create files
    myvamps.create_vamps_files()  
    
def vampsupload(runobj):
    """
    Upload data files to (OLD) VAMPS database
    """
    # for vamps 'new_lane_keys' will be prefix 
    # of the uniques and names file
    # that was just created in vamps_gast.py
    # or we can get the 'lane_keys' directly from the config_file
    # for illumina:
    # a unique idx_key is a concatenation of barcode_index and run_key
    idx_keys = get_keys(runobj)
    
#     if(runobj.vamps_user_upload):
#         idx_keys = [runobj.user+runobj.runcode]        
#     else:
#         idx_keys = convert_unicode_dictionary_to_str(json.loads(open(runobj.trim_status_file_name,"r").read()))["new_lane_keys"]
     
     # NOT NEEDED HERE: Find duplicate project names
     # if vamps user uploads this has already been done and this project is
     # already in vamps_upload_info table
     # if data from a csv file (illumina and 454) this also is not needed
     # as data is checked in metadata.py
    
     
    myvamps = Vamps(runobj, idx_keys)
    # Create files
    myvamps.create_vamps_files()
    # put files in db
    result_code = myvamps.load_vamps_db()
    
    if result_code[:5] == 'ERROR':
        logging.error("load_vamps_db failed") 
        sys.exit("load_vamps_db failed")
        if runobj.vamps_user_upload:
            #write_status_to_vamps_db( runobj.site, runobj.run, "GAST_ERROR", result_code )
            pass
    elif runobj.vamps_user_upload:
        print "Finished loading VAMPS data",result_code
        #write_status_to_vamps_db( runobj.site, runobj.run, 'GAST_SUCCESS', 'Loading VAMPS Finished' )
        pass
    # check here for completion of 
    # 1-file creation
    # 2-data appears in vamps
    
        
    
def status(runobj):
    
    f = open(runobj.run_status_file_name)
    lines = f.readlines()
    f.close()
    
    print "="*40
    print "STATUS LOG: "
    for line in lines:
        line =line.strip()
        print line
    print "="*40+"\n"
    
def clean(runobj):
    """
    Removes a run from the database and output directory
    """
    
    answer = raw_input("\npress 'y' to delete the run '"+runobj.run_date+"': ")
    if answer == 'y' or answer == 'Y':
        
        for (archiveDirPath, dirNames, fileNames) in os.walk(runobj.output_dir):
            print "Removing run:",runobj.run_date
            for file in fileNames:
                filePath = os.path.join(runobj.output_dir,file)
                print filePath
                os.remove(os.path.join(runobj.output_dir,file))
                # should we also remove STATUS.txt and *.ini and start again?
                # the directory will remain with an empty STATUS.txt file
                #os.removedirs(runobj.output_dir)

def get_keys(runobj):
    try:
        idx_keys = convert_unicode_dictionary_to_str(json.loads(open(runobj.trim_status_file_name,"r").read()))["new_lane_keys"]
        # {"status": "success", "new_lane_keys": ["1_GATGA"]}
    except:
        # here we have no idx_keys - must create them from run
        # if illumina they are index_runkey_lane concatenation
        # if 454 the are lane_key
        if runobj.vamps_user_upload or runobj.platform == 'new_vamps':
            idx_keys=runobj.samples.keys()
        else:
            if runobj.platform == 'illumina':  
                idx_keys = runobj.idx_keys
                ct = 0
                for h in runobj.samples:
                    logging.debug(h)
#                    logging.debug(h,runobj.samples[h]) #TypeError: not all arguments converted during string formatting
                    ct +=1
            elif runobj.platform == '454':
                idx_keys = runobj.idx_keys
            elif runobj.platform == 'ion_torrent':
                idx_keys = runobj.idx_keys
            else:
                logging.debug("GAST: No keys found - Exiting")
                runobj.run_status_file_h.write("GAST: No keys found - Exiting\n")
                sys.exit()
    if type(idx_keys) is types.StringType:
        return idx_keys.split(',')
    elif type(idx_keys) is types.ListType:
        return idx_keys
    else:
        return None
    return idx_keys
