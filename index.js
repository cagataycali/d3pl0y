#!/usr/bin/env node
var E = require('3x3c');
var home = require('h0m3');
var colors = require('colors');
var async = require('async');
var exist = require('3x1st');
var opn = require('opn');

exist(`${process.cwd()}/Deploy.json`)
  .catch((err) => {
    console.log(colors.red('Please create Deploy.json'));
    opn('http://cagataycali.xyz');
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
       console.log(colors.green('Fetched your home dir: ', homeDir));
       E(`cat ${homeDir}/.ssh/id_rsa > /tmp/deployer.txt && chmod 600 /tmp/deployer.txt`)
         .then((value) => {

           async.parallel([
               function(callback) {
                 if (!config.installNode) {
                   callback(null, 'Pre commands');
                 } else {
                   exec(commands) // node install
                     .then((value) => {
                       console.log(colors.green('Pre commands runned.'));
                       callback(null, 'Pre commands');
                     })
                     .catch((err) => {callback(err);})
                 }
               },
               function(callback) {
                 E(rsyncCommand) // rsync
                   .then((value) => {
                     console.log(colors.green('Rsync runned'));
                     callback(null, 'Rsync runned');
                   })
                   .catch((err) => {callback(err);})
               }
           ],
           function(err, results) {
             if (err) {
               console.log(err);
               process.exit();
             }

             exec(`cd ${config.dir}/${process.cwd().split('/').pop(-1)}; npm install;`) // ls
               .then((value) => {
                 console.log(colors.green('Npm install done!'));

                 exec(`cd ${config.dir}/${process.cwd().split('/').pop(-1)}; ${config.command}`) // ls
                   .then((value) => {
                     console.log(colors.green('Runned your awesome starter code!'));
                     console.log(value);
                   })
                   .catch((err) => {console.log(err);})
               })
               .catch((err) => {console.log(err);})

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
