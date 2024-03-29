import { Meteor } from 'meteor/meteor';

import { Users } from '../../../imports/collections/users';
import { RolesEnum, AutoCompleteModel, Perfil } from 'imports/models/perfil';
import { ModulesEnum } from 'imports/models/enums';
import { User } from 'imports/models/User';

Meteor.publish('usersProfile', function() {
  
let id =  Meteor.userId();
  return Users.find({_id : id});
});



//TODO SOLO PODER SACAR NOMBRE Y FOTO.
Meteor.publish('allUsers', function() {
  

  let user = Meteor.user();
  if(!user || (user.profile as Perfil).rol!==RolesEnum.ADMIN)
  {
    return [];
  }
  
    return Users.find({}, {fields:  {
      "emails" : 1,
      'profile.nombre' : 1,
      'profile.apellidos' : 1,
     
      "profile.rol" : 1,
      "lastModulo" : 1,
      "createdAt" : 1,
      "lastUpdate" : 1,
      "lastIp" : 1,
      'profile.disponible' : 1,
      'profile.claseId' : 1
    }});
  });

//TODO SOLO PODER SACAR NOMBRE Y FOTO.
Meteor.publish('alumnoCall', function() {
  
  let id =  Meteor.userId();
    return Users.find({}, {fields:  {
      'profile.name' : 1,
      "profile.foto" : 1,
      'profile.nombre' : 1,
      'profile.apellidos' : 1,
      'profile.disponible' : 1,
      'profile.claseId' : 1,
    }});
  });
Meteor.publish('allAvalaibleTeacher', function() {
  

  return Users.find({"profile.disponible" : !false,'profile.rol' : { $gte: RolesEnum.PROFFESOR}, "lastModulo" :  ModulesEnum.CLASE_PRFSOR  /*, _id : { $ne: Meteor.userId() }*/}, {fields:  {
    'profile.name' : 1,
    "profile.foto" : 1,
    'profile.nombre' : 1,
    'profile.apellidos' : 1,
    'profile.disponible' : 1,
    'profile.claseId' : 1,
    'profile.descripcion' : 1,
    'profile.perfClase.categorias' : 1,
    'profile.perfClase.ultPrecio' : 1,
    'profile.perfClase.ultElo' : 1
  }});
});


