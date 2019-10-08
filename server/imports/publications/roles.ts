import { Meteor } from 'meteor/meteor';

import { Roles, RolesObj } from '../../../imports/collections/rol';
import { User } from '../../../imports/models/User';


Meteor.publish('rolByUser', function() {
    //1 sin logueo solo acceso a common
    //2 logueado sin rol acceso a common y perfil
    //alumno acceso a common, perfil y peticiones, tiempo gastado
    //profesor acceso a common perfil y recepcion de peticiones, y facturacion
    //4 admin common, perfil , alumno , profesor y admin
    /*let rol = 1;

  */

  
  
  return Roles.find({codigo: Meteor.user() ? Meteor.user().profile.rol :1});
});


