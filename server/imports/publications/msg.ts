import { Meteor } from 'meteor/meteor';

import { Msg } from '../../../imports/collections/msg';

import { Error } from '../../../imports/functions/errors'

Meteor.publish('getMsg', function() {
    //1 sin logueo solo acceso a common
    //2 logueado sin rol acceso a common y perfil
    //alumno acceso a common, perfil y peticiones, tiempo gastado
    //profesor acceso a common perfil y recepcion de peticiones, y facturacion
    //4 admin common, perfil , alumno , profesor y admin
    let rol = 1;

    if(!Meteor.user())
    {  
        Error.noLogueado();
      }


  
  return Msg.find({ to : Meteor.userId(), readed : !true});
});


