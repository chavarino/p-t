import { MongoObservable } from 'meteor-rxjs';

import { Kpm } from '../models/kpm';



export const Kpms = new MongoObservable.Collection<Kpm>('kpms');


Kpms.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
/*

Parties.allow({
  insert(userId, party) {
    return userId && party.owner === userId;
  },
  update(userId, party, fields, modifier) {
    return userId && party.owner === userId;
  },
  remove(userId, party) {
    return userId && party.owner === userId;
  }
});

*/