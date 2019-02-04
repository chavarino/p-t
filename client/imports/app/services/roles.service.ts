import { Injectable } from '@angular/core';
import { Rol} from "../../../../imports/models/rol";

interface Map<T> {
    [key: string]: T;
}


@Injectable({
  // we declare that this service should be created
  // by the root application injector.
  providedIn: 'root',
})
export class RolesService {

    roles : Map<Rol>


    
    contructor()
    {
        this.roles = {

            comun : {
                read : 0,
                write : 0
            }
        };
    }

    setRoles(roles: Map<Rol>)
    {
        this.roles =  roles;
    }

    canWrite(modulo: string,min: number)
    {
        if(!this.roles)
        {
            return false;
        }
        let rol =  this.roles[modulo];

        return rol!==null &&  rol.write >=min
    }

    canRead(modulo: string,min: number)
    {
        if(!this.roles)
        {
            return false;
        }
        let rol =  this.roles[modulo];

        return rol!==null &&  rol.read >=min
    }
    
}


/*


let keys: keyof Map<number>; // string
let value: Map<number>['foo']; // numb*/