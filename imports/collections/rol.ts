import { MongoObservable } from 'meteor-rxjs';

import { Rol } from '../models/rol';
import { Map} from '../models/map';

export interface RolesObj {
    codigo : number,
    rol :Map<Rol>,
    _id
}
export const Roles = new MongoObservable.Collection<RolesObj>('rol');
