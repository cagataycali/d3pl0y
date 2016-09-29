#!/usr/bin/env node
var E = require('3x3c');
var home = require('h0m3');
var colors = require('colors');
var async = require('async');
var exist = require('3x1st');
var opn = require('opn');
const notifier = require('node-notifier');

exist(`${process.cwd()}/Deploy.json`)
  .catch((err) => {
    console.log(colors.red('Please create Deploy.json'));
    opn('https://github.com/cagataycali/d3pl0y/blob/master/example/Deploy.json');
    process.exit();
  })
 .then(() => {
   var config = require(`${process.cwd()}/Deploy.json`);

   var commands = ''
   if (config.installNode) {
     commands = 'sudo apt-get install -y build-essential;curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -;sudo apt-get install -y nodejs;';
   }
   // Rsync files
   var rsyncCommand =  `rsync -avz ${process.cwd()} ${config.user}@${config.host}:${config.dir} --exclude 'node_modules'`;
   home()
     .then((homeDir) => {
       notifier.notify({
         'title': 'd3pl0y',
         'message': 'Deploy process started'
       });
       E(`cat ${homeDir}/.ssh/id_rsa > /tmp/deployer.txt && chmod 600 /tmp/deployer.txt`)
         .then((value) => {

           async.parallel([
               function(callback) {
                 if (!config.installNode) {
                   callback(null, 'Pre commands');
                 } else {
                   exec(commands) // node install
                     .then((value) => {
                       console.log(colors.green('Node installed.'));
                       notifier.notify({
                         'title': 'd3pl0y',
                         'message': 'Node installed.'
                       });
                       callback(null, 'Node installed');
                     })
                     .catch((err) => {callback(err);})
                 }
               },
               function(callback) {
                 E(rsyncCommand) // rsync
                   .then((value) => {
                     console.log(colors.green('Project uploaded.'));
                     notifier.notify({
                       'title': 'd3pl0y',
                       'message': 'Project uploaded.'
                     });
                     callback(null, 'Project uploaded.');
                   })
                   .catch((err) => {callback(err);})
               }
           ],
           function(err, results) {
             if (err) {
               console.log(err);
             }

             async.series([
                 function(callback) {
                   exec(`cd ${config.dir}/${process.cwd().split('/').pop(-1)}; npm install;`) // ls
                     .then((value) => {
                       console.log(colors.green('Npm install done.'));
                       notifier.notify({
                         'title': 'd3pl0y',
                         'message': 'Npm install done.'
                       });
                       callback(null, 'Npm install done!');
                     })
                     .catch((err) => {callback(err);})
                 },
                 function(callback) {
                    exec(`cd ${config.dir}/${process.cwd().split('/').pop(-1)}; ${config.command} &`) // ls
                    console.log(colors.green('Runned your awesome starter code!'));
                    notifier.notify({
                      'title': 'd3pl0y',
                      'message': 'Runned your awesome starter code!'
                    });
                    setInterval(function(){ process.exit() }, 100);
                 }
             ],
             // optional callback
             function(err, results) {
                 if (err) {
                   console.log(err);
                 }
             });

           });


         })
         .catch((err) => {console.log(err);})
     })


   function exec(command) {
     return new Promise(function(resolve, reject) {
       E(`ssh -i /tmp/deployer.txt ${config.user}@${config.host} "${command}"`)
         .then((value) => {
           resolve(value);
         })
         .catch((err) => {console.log(err);})
     });
   }

 })
