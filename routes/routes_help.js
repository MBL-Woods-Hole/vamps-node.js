const express = require('express');
var router = express.Router();
const spawn = require('child_process').spawn;

// These are all under /help

/* GET Overview page. */
router.get('/overview', function(req, res) {
      res.render('help/overview', { title: 'VAMPS:Overview', 
      user: req.user,
      hostname: req.CONFIG.hostname,
      
   });
});

/* GET FAQ page. */
router.get('/faq', function(req, res) {
      res.render('help/faq', { title: 'VAMPS:FAQ',
                
                user: req.user,
                hostname: req.CONFIG.hostname
                            });
});

  /* GET Contact Us page. */
router.get('/contact', function(req, res) {

      //get sweetcaptcha html for the contact area
        //sweetcaptcha.api('get_html', function(err,html){
            //Send the guts of the captcha to your template
            res.render('help/contact', {
              
              title: 'VAMPS:Contact Us',
              choices : req.CONSTS.CONTACT_US_SUBJECTS,
              user: req.user,
              
              hostname: req.CONFIG.hostname
               });
        //});
});

  //
  //
  //
router.post('/contact', function (req, res) {
    console.log(req.body)
    var msg = encodeURI(req.body.message)
    //console.log(msg)
    if(req.body.name == '' || req.body.email == '' || req.body.message == ''){
        req.flash('fail', 'All fields need to be entered.');
        res.redirect('/help/contact')
        return
    }
    var mailOptions = {
        scriptPath : req.CONFIG.PATH_TO_NODE_SCRIPTS,
        args :       [ '-to', req.CONFIG.CONTACT_EMAIL, '-from', req.body.email, '-name', '"'+req.body.name+'"', '-sub', '"'+req.body.subject+'"', '-msg', '"'+msg+'"' ],
    };
    console.log(mailOptions.scriptPath+'/send_email.py '+mailOptions.args.join(' '))
    var mail_process = spawn( mailOptions.scriptPath+'/send_email.py', mailOptions.args, {
                env:{'PATH':req.CONFIG.PATH,'LD_LIBRARY_PATH':req.CONFIG.LD_LIBRARY_PATH},
                detached: true, 
                //stdio: [ 'ignore', null, log ]
                stdio: 'pipe'  // stdin, stdout, stderr,'pipe'
    }); 
   
    stdout = '';
    mail_process.stdout.on('data', function (data) {
        
        //console.log(data.toString('utf8'))
        stdout += data;    
     
    });
    stderr = '';
    mail_process.stderr.on('data', function (data) {
        
        console.log(data.toString('utf8'))
        stderr += data;    
     
    });
    mail_process.on('close', function (code) {
        console.log('mail_process process exited with code ' + code);
        if(code == 0){           
            //res.send(stdout);  
            req.flash('success', 'messege sent');
                                     
        }else{
          console.log('python script error: '+stderr);
          req.flash('fail', 'problem with mail delivery');
          //res.send(stderr); 
        } 
        res.redirect('/help/contact')
        return       
     });   


    
});

module.exports = router;
