import { Meteor } from 'meteor/meteor';
import { Room} from "../../../imports/models/room"
import { Rooms } from '../../../imports/collections/room';

import {MethodsClass} from "../../../imports/functions/methodsClass"


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
  return Rooms.find({ $and : [{ activo: !true} , or ]});
});


Meteor.publish('getRoomForAlumno', function() {

  if(!Meteor.user())
  {  
     MethodsClass.noLogueado();
  }
  return Rooms.find({ alumnoId : Meteor.userId(), activo : true});
});

Meteor.publish('getRoomForProf', function() {
    
      return Rooms.find({ profId : Meteor.userId(), activo : true});
  
});


