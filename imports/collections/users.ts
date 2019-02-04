import { MongoObservable } from 'meteor-rxjs';

import { User } from '../models/User';

export const Users = MongoObservable.fromExisting<User>(Meteor.users);



Users.allow({
    insert: loggedIn,
    update: loggedIn,
    remove: loggedIn
  })


function loggedIn() {
    return !!Meteor.user();
  }