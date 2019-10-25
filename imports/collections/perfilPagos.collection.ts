import { MongoObservable } from 'meteor-rxjs';

import { PerfilPagos } from '../models/perfilPagos.model';



export const PerfilPagosColl = new MongoObservable.Collection<PerfilPagos>('perfilPagos');
PerfilPagosColl.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
  });