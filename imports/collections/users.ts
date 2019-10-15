import { MongoObservable } from 'meteor-rxjs';

import { User } from '../models/User';

export const Users = MongoObservable.fromExisting<User>(Meteor.users);


/* TODO 

Lists.publicFields = {
  name: 1,
  incompleteCount: 1,
  userId: 1
};

*/
Meteor.users.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
Users.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});