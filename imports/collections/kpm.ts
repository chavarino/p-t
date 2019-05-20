import { MongoObservable } from 'meteor-rxjs';

import { Kpm } from '../models/kpm';



export const Kpms = new MongoObservable.Collection<Kpm>('kpms');
