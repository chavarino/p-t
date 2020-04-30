//import './imports/methods/todos';
import './imports/methods/perfil';
import './imports/methods/room';
import './imports/publications/roles'
import './imports/publications/user'
import './imports/publications/room'
import './imports/publications/msg'
import './imports/methods/msg'
import './imports/methods/pagos';
import './imports/methods/sendEmail';
import './imports/methods/general';
import './imports/publications/kpm';
import './imports/publications/pagos';


import {PagosFn} from "./imports/libAux/pagos";

/*ServiceConfiguration.configurations.remove({
  service: "facebook"
});

ServiceConfiguration.configurations.insert({
  service: "facebook",
  appId: 'YOUR_TEST_APP_ID',
  secret: 'YOUR_TEST_APP_SECRET'
}); */
import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { Accounts} from 'meteor/accounts-base';
import { Mongo } from 'meteor/mongo';
import { Kpms } from 'imports/collections/kpm';
import { Kpm } from 'imports/models/kpm';
import { Rol } from 'imports/models/rol';

import { Perfil, RolesEnum } from 'imports/models/perfil';
import { iniProfesorModel } from 'imports/functions/commonFunctions';
import { Users } from 'imports/collections/users';



import { SyncedCron } from 'meteor/percolate:synced-cron';

import { User } from 'imports/models/User';
import { SecretServices, test } from './imports/libAux/sharedPass';
import { ModulesEnum } from 'imports/models/enums';
import { terminarClaseById } from './imports/methods/room';
import { Rooms } from 'imports/collections/room';
//import {SyncedCron} from 'meteor/percolate:synced-cron';
//)




//mongo

/*
let SSL = function(key, cert, port){                                     // 1
	var httpProxy = Npm.require('http-proxy');                          // 2
	var fs = Npm.require('fs');                                         // 3
	if(!port){                                                          // 4
		port = 443;                                                        // 5
	};                                                                  // 6
	httpProxy.createServer({                                            // 7
		target: {                                                          // 8
    		host: 'localhost',                                             // 9
    		port: process.env.PORT                                         // 10
  		},                                                               // 11
  		ssl: {                                                           // 12
    		key: fs.readFileSync(key, 'utf8'),                             // 13
    		cert: fs.readFileSync(cert, 'utf8')                            // 14
 		},                                                                // 15
 		ws: true,                                                         // 16
 		xfwd: true                                                        // 17
 	}).listen(port);                                                   // 18
};                                                                   // 19
          
*/

Meteor.users.deny ({
  update () {return true; }
});
/*ServiceConfiguration.configurations.remove({
  service: "facebook"
});
ServiceConfiguration.configurations.remove({
  service: "google"
});

if(Meteor.isProduction)
{
  console.log("Production Enviroment")
  //Meteor.settings.public
  ServiceConfiguration.configurations.insert(SecretServices.prod.facebook); 
  
  ServiceConfiguration.configurations.insert(SecretServices.prod.google);

}
else{
  ServiceConfiguration.configurations.insert(SecretServices.dev.facebook); 
  
  ServiceConfiguration.configurations.insert(SecretServices.dev.google);

}*/



if(Meteor.isServer)
{
    
  console.log("isServer");
  Meteor.startup(()=>{
   /* console.log("inicio startup");
    getServers();
    console.log("inicio getServers");
    setInterval(()=>{


      getServers();
    }, 1200000)
    console.log("inicio setInterval");*/
   // let key =Assets.getText("l.key");
   // let cer = Assets.getText("l.cert");
   /* SSL(
      key,
      cer,
      443);*/
      if(Meteor.isProduction)
      {
        //Meteor.absoluteUrl ("https://marcos.alvaco.org");
        //process.env.absoluteUrl = "https://marcos.alvaco.org";
        //process.env.url = "https://marcos.alvaco.org";

      }
 
        /*Meteor.setInterval(()=>{
           Meteor.call("borrarNoConectados")
        }, 30000)*/
        
   
    console.log("url absoluta :" +Meteor.absoluteUrl());

    process.env.HTTP_FORWARDED_COUNT="1";
 
    
    SyncedCron.config({
      // Log job run details to console
      log: true,
      // collectionName: "users"
      
      
    });
    
    let  fnCronUsers = async ()=>{
      console.log("Desconectando usuarios no conectados y si disponibles")
      try {
        // /** poner disponibles  */
          let arrayIds  : Array<string> = []
          
          //console.log("usuarios disponibles: " +  Meteor.users.find( {"profile.disponible" : !!true }).count())
          //Users.aggregate()
          let ids : Array<any> = await (Meteor.users.rawCollection().aggregate([{ $match : {  "profile.disponible" : !!true } },
              { $project: { _id: 1, lastModulo:1, dateDifference: { $subtract: [  new Date(), "$lastUpdate" ] } } },
          { $match : { $or: [ { lastModulo: { $ne : ModulesEnum.CLASE_PRFSOR}}, {dateDifference : { $gt : 30000}}, {dateDifference : { $type: 10 }} ]} } ], { allowDiskUse: true }).toArray());
          
          
          console.log("desconectando ususuarios: " + JSON.stringify(ids))
          for(let i = 0 ; i<ids.length ; i++)
          {
           //console.log("pASA")
              arrayIds.push(ids[i]._id);
          }
          if(arrayIds.length===0)
          {
            return;
          }
          // console.log("desconectando ususuarios.")
          Users.update({"_id": { "$in": arrayIds }}, {$set : { "profile.disponible" : false}})
          
        } catch (error) {
          console.log(error);
          //throw e;
        
        }
    }
    let fnCronClases  = async ()=>{
      
      console.log("Cron terminacion de clases que los usuario están inactivos.")
      
      try {
        // /** poner disponibles  */
          let arrayIds  : Array<string> = []
          
          //console.log("usuarios disponibles: " +  Meteor.users.find( {"profile.disponible" : !!true }).count())
          //Users.aggregate()
          let ids : Array<any> = await (Rooms.rawCollection().aggregate([{ $match : {  activo : !!true } },
              { $project: { _id: 1, profId:1, alumnoId:1, dateDifference: { $subtract: [  new Date(), "$lastPing" ] } } },
          { $match : { $or: [  {dateDifference : { $gt : 300000}}, {dateDifference : { $type: 10 }} ]} } ], { allowDiskUse: true }).toArray());
          
          
          console.log(" clases a desconectar por inactivadad: " + JSON.stringify(ids))
          for(let i = 0 ; i<ids.length ; i++)
          {
           //console.log("pASA")
              terminarClaseById(ids[i]._id, true);
              arrayIds.push(ids[i].profId, ids[i].alumnoId);
          }
          if(arrayIds.length===0)
          {
            return;
          }
         

          

           console.log("eliminando clase de ususuarios: " + JSON.stringify(arrayIds));
          Users.update({"_id": { "$in": arrayIds }}, {$set : { "profile.claseId" : ""}})
          
        } catch (error) {
          console.log(error);
          //throw e;
        
        }


    }
    var contador = 0;
    SyncedCron.add({
      name: 'Cron aplicación',
      schedule: function(parser) {
        // parser is a later.parse object
        return parser.recur().on(30).second();
      },
      job: function() {
        
        fnCronUsers();
        
        console.log("Contador cron: " + contador);
        if(contador % 2 ===0)
        {
          fnCronClases();
        }
        contador = contador % 10000;
        contador ++;
        return "";
      }
    }); 

    
    /*
    
   
    SyncedCron.add({
      name: 'Terminando clases',
      schedule: function(parser) {
        // parser is a later.parse object
        return parser.recur().on(10).second();
      },
      job: function() {
        fnCronClases();
        return "";
      }
    })*/
    SyncedCron.start();
  });
  
}
//https://docs.mongodb.com/manual/reference/operator/query/regex/
//https://docs.mongodb.com/manual/tutorial/query-arrays/

Accounts.onLogin(()=>{

  
  /**
   * 
   * TODO quitar con tarjetas buenas
   */
  console.log("LOGUEANDOSE.")
 // Meteor.call("rellenaTarjetasPrueba");
  /***
   * 
   * FIN_TODO quitar con tarjeta beunas
   */

})


Accounts.onCreateUser(function (options, user : User) {

  
  let profile : Perfil= {
    foto : "https://lh3.googleusercontent.com/-OOti6sgi1g0/AAAAAAAAAAI/AAAAAAAAAAA/AGDgw-jC9_q1efO3BBff2F0OBFE4p0QxOA/s64-c-mo/photo.jpg",
    rol : RolesEnum.ALUMNO,
    email : "",
    nombre : "",
    apellidos : "",
    disponible : false,
    descripcion : ""
  };

   if (user.services.facebook) {
    console.log("entra Faceboo");
    user.username = user.services.facebook.name;
    user.emails = [{address: user.services.facebook.email}];
    if(user.services.facebook.picture.data.url !== undefined && user.services.facebook.picture.data.url!=="")
    {
      profile.foto =  user.services.facebook.picture.data.url;

    }
    profile.nombre =  user.services.facebook.first_name || "";
    profile.apellidos =  user.services.facebook.last_name || "";
  }
  else if (user.services.google) {
    console.log("entra Google");
    user.username = user.services.google.name;
    user.emails = [{address: user.services.google.email}];
    if(user.services.google.picture != undefined && user.services.google.picture!="")
    {
      profile.foto =  user.services.google.picture;

    }
    profile.nombre =  user.services.google.given_name || "";
    profile.apellidos =  user.services.google.family_name || "";
  }
  else{

   // console.log(JSON.stringify(user))
   // console.log(JSON.stringify(options))
   // let userAux = Meteor.users.findOne(user._id);
    profile.nombre =  options.profile.nombre//user.profile.nombre;
    profile.apellidos =  options.profile.apellidos;
  }
 // if (user.profile == undefined) user.profile = {rol:2};
  profile.email =  user.emails[0].address;
  if(profile.email =="javier.chavarino.1991@gmail.com")
  {
    profile.rol = 6;
    iniProfesorModel(profile);
  }


  user.profile = profile;
  console.log(user);
  return user;
});
/*
Accounts.emailTemplates.siteName = 'Clases Online';
Accounts.emailTemplates.from = 'Clases Online <javier.chavarino.1991@gmail.com>';

Accounts.emailTemplates.enrollAccount.subject = (user) => {
  return `Welcome to Awesome Town, ${user.profile.name}`;
};

Accounts.emailTemplates.enrollAccount.text = (user, url) => {
  return 'You have been selected to participate in building a better future!'
    + ' To activate your account, simply click the link below:\n\n'
    + url;
};

Accounts.emailTemplates.resetPassword.from = () => {
  // Overrides the value set in `Accounts.emailTemplates.from` when resetting
  // passwords.
  return 'AwesomeSite Password Reset <no-reply@example.com>';
};
Accounts.emailTemplates.verifyEmail = {
   subject() {
      return "¡Activa tu cuenta Clases Online!";
   },
   text(user, url) {
      return `¡Hola ${user.username}! Verifica tu cuenta de correo en el siguiente link: ${url}`;
   }
};
*/


//
//https://docs.meteor.com/api/email.html
//https://developers.google.com/gmail/api/quickstart/nodejs
//https://developers.google.com/gmail/api/auth/web-server  ---autorizacion

//https://www.hostinger.es/tutoriales/como-usar-el-servidor-smtp-gmail-gratuito/



/*import { Accounts } from 'meteor/accounts-base';

Accounts.ui.config({
    requestPermissions: {
      facebook: ['email', 'public_profile']
    },
    requestOfflineToken: {
      google: true
    },
    passwordSignupFields: 'USERNAME_AND_EMAIL'
  });

*/
