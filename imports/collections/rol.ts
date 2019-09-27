import { MongoObservable } from 'meteor-rxjs';

import { Rol, Permisos } from '../models/rol';
import { Map} from '../models/map';

export interface RolesObj {
    codigo : number,
    perm :Permisos,
    _id
}
export const Roles = new MongoObservable.Collection<RolesObj>('rol');
