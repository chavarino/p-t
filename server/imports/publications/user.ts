import { Meteor } from 'meteor/meteor';

import { Users } from '../../../imports/collections/users';
import { RolesEnum, AutoCompleteModel } from 'imports/models/perfil';

Meteor.publish('usersProfile', function() {
  
let id =  Meteor.userId();
  return Users.find({_id : id});
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
  

  return Users.find({"profile.disponible" : !false,'profile.rol' : { $gte: RolesEnum.PROFFESOR}  , _id : { $ne: Meteor.userId() }}, {fields:  {
    'profile.name' : 1,
    "profile.foto" : 1,
    'profile.nombre' : 1,
    'profile.apellidos' : 1,
    'profile.disponible' : 1,
    'profile.claseId' : 1,
  }});
});