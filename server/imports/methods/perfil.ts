import { Meteor } from 'meteor/meteor';
import { Error } from '../../../imports/functions/errors'
import { Users } from '../../../imports/collections/users';
import { Perfil } from '../../../imports/models/perfil';
import { User } from 'imports/models/User';
import {Accounts} from 'meteor/accounts-base';

Meteor.methods({
  savePerfil(profile: Perfil) {

    profile.rol = Meteor.user().profile.rol;
    let filter = {
      "_id": Meteor.userId
    };
    let input : any = {$set : { profile : profile}}
    //validar TODO
    
    console.log(filter + ", " + input)
    Users.update(filter, input);
  },
  setDisponible(disponible : Boolean)
  {
      let profile : Perfil = Meteor.user().profile;

      profile.disponible = disponible;
      console.log("Set disponible " + disponible)

      try
      {
        
        Meteor.call("savePerfil", profile);
      }
      catch(e)
      {
        Error.errorSetDisponible()
      }


  },

  unirse(user: User)
  {
    let regex =/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    let patt = new RegExp(regex)
    //TODO VALIDAR
    //Accounts.findUserByEmail(user.em)
    console.log(JSON.stringify(user));
    console.log("email val:" +  patt.test(user.username))
    if(!user ||!user.username || user.username === ""  || !patt.test(user.username) || user.password.length>20 || user.password.length<5 )
    {
        console.log("ERROR : CAMPOS MAL INTRODUCIDOS")
        Error.creacionUserGeneral();
    }
    try{
    
      
      
     let userId = Accounts.createUser({email :user.username, username:user.username, password:user.password});

      console.log("generado user correctamente: " +userId);

      console.log("enviando Email de verificacion");
      Accounts.sendVerificationEmail(userId);
    }
    catch(e)
    {
      console.log(e);
      //throw e;
      Error.creacionUserYaExiste();
    }
  }
})
