//import './imports/methods/todos';
import './imports/methods/perfil';
import './imports/methods/room';
import './imports/publications/roles'
import './imports/publications/user'
import './imports/publications/room'
import './imports/publications/msg'
import './imports/methods/msg'

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
ServiceConfiguration.configurations.remove({
  service: "facebook"
});
let service : string = "facebook";
ServiceConfiguration.configurations.insert({
  service: service,
  appId: '2159629500964595',
  secret: 'd7fa5cb79f2fd9ff567fc734fdcf09be'
}); 

ServiceConfiguration.configurations.remove({
  service: "google"
});
ServiceConfiguration.configurations.insert({
  service: "google",
  clientId: "968081809867-fpagrpdujnjauiggoqucmd5cgiseuqfl.apps.googleusercontent.com",
  secret: "COov_-wK-IkGBkWTCuwtpWBd"
});


if(Meteor.isServer)
{
  Meteor.startup(()=>{
    //smtps , poner lista
    process.env.MAIL_URL="smtp://javier.chavarino.martinez@gmail.com:Albaricoke91@smtp.gmail.com:587/";
  });
  
}


Accounts.onCreateUser(function (options, user) {

  console.log("inicio");
  let profile = {
    foto : "https://lh3.googleusercontent.com/-OOti6sgi1g0/AAAAAAAAAAI/AAAAAAAAAAA/AGDgw-jC9_q1efO3BBff2F0OBFE4p0QxOA/s64-c-mo/photo.jpg",
    rol : 2,
    email : "",
    nombre : "",
    apellidos : "",
    disponible : false
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
 // if (user.profile == undefined) user.profile = {rol:2};
  profile.email =  user.emails[0].address;
  if(profile.email =="javier.chavarino.1991@gmail.com")
  {
    profile.rol = 6;
  }
  
  user.profile = profile;
  console.log(user);
  return user;
});

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
