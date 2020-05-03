import { Meteor } from 'meteor/meteor';
import { Room} from "../../../imports/models/room"
import { Rooms } from '../../../imports/collections/room';

import {MethodsClass} from "../../../imports/functions/methodsClass"
import { Perfil, RolesEnum } from 'imports/models/perfil';


const config = {
fields: {
  'nomProfe': 1,
  "nomAlumn": 1,
  '_id': 1,
  'profId': 1,
  'alumnoId': 1,
  'fechaIni': 1,
  'fechaCom': 1,
  'fechaFin': 1,
  'activo': 1,
  'comenzado': 1,
  'elo': 1,
  'precio': 1,
  'files': 1,
  'chat': 1,
  'scores': 1,
  'cargadoCoste': 1,
 // 'ips': 0
}
};
Meteor.publish('getRoomReport', function() {

  /*if(!Meteor.user())
  {  
     MethodsClass.noLogueado();
  }*/

  let or = { $or : [  
    { profId : Meteor.userId()}, 
    { alumnoId : Meteor.userId()} ]
                  }

  
  // { profId : Meteor.userId(), activo : true}
  // { alumnoId : Meteor.userId(), activo : true}
  //{ $and : [{ activo: !true} , or ]}
  return Rooms.find({ $and : [{ activo: !true} , or ]}, config);
});

Meteor.publish('allRooms', function() {

  /*if(!Meteor.user())
  {  
     MethodsClass.noLogueado();
  }*/


let user = Meteor.user();
if(!user || (user.profile as Perfil).rol!==RolesEnum.ADMIN)
{
  return [];
}


  
  // { profId : Meteor.userId(), activo : true}
  // { alumnoId : Meteor.userId(), activo : true}
  //{ $and : [{ activo: !true} , or ]}
  return Rooms.find({}, {
    fields: {
      'nomProfe': 1,
      "nomAlumn": 1,
      '_id': 1,
      'profId': 1,
      'alumnoId': 1,
      'fechaIni': 1,
      'fechaCom': 1,
      'fechaFin': 1,
      'activo': 1,
      'comenzado': 1,
      'elo': 1,
      'precio': 1,
      'files': 1,
      //'chat': 1,
      'scores': 1,
      'cargadoCoste': 1,
     // 'ips': 0
    }
    });
});



Meteor.publish('getRoomForAlumno', function() {

  if(!Meteor.user())
  {  
     MethodsClass.noLogueado();
  }
  return Rooms.find({ alumnoId : Meteor.userId(), activo : true}, config);
});

Meteor.publish('getRoomForProf', function() {
    
      return Rooms.find({ profId : Meteor.userId(), activo : true},config);
  
});


