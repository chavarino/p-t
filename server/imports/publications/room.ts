import { Meteor } from 'meteor/meteor';
import { Room} from "../../../imports/models/room"
import { Rooms } from '../../../imports/collections/room';

import {MethodsClass} from "../../../imports/functions/methodsClass"



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


