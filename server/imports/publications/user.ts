import { Meteor } from 'meteor/meteor';

import { Users } from '../../../imports/collections/users';

Meteor.publish('usersProfile', function() {
  
let id =  Meteor.userId();
  return Users.find({_id : id});
});
Meteor.publish('allAvalaibleTeacher', function() {
  
    //METER FILTROS DE TEMATICA /CARRERA
  //console.log("llama")
  return Users.find({/*"profile.disponible" : !false,*/ _id : { $ne: Meteor.userId() }}, {fields:  {profile : 1}});
});