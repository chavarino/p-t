import { MongoObservable } from 'meteor-rxjs';

import { Room } from '../models/room';

export const Rooms = new MongoObservable.Collection<Room>('room');
