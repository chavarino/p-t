import { Meteor } from 'meteor/meteor';
import { Room} from "../../../imports/models/room"
import { Rooms } from '../../../imports/collections/room';
import { Error } from '../../../imports/functions/errors'



Meteor.publish('getRoomForAlumno', function() {

  if(!Meteor.user())
  {  
     Error.noLogueado();
  }
  return Rooms.find({ alumnoId : Meteor.userId(), activo : true});
});

Meteor.publish('getRoomForProf', function() {
    
      return Rooms.find({ profId : Meteor.userId(), activo : true});
  
});


