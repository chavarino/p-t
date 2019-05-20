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
        this.setIniRoles();
    }

    setIniRoles()
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
        if(!roles)
        {
            this.setIniRoles();
        }
        else{
            this.roles =  {};

            Object.assign(this.roles, roles);
            //NO PILLA EL TEMA

        }
    }

    canWrite(modulo: string,min: number)
    {
        if(!this.roles)
        {
            return false;
        }
        let rol =  this.roles[modulo];

        return rol &&  rol.write >=min
    }

    canRead(modulo: string,min: number)
    {
        if(!this.roles)
        {
            return false;
        }
        let rol =  this.roles[modulo];

        return rol &&  rol.read >=min
    }
    
}


/*


let keys: keyof Map<number>; // string
let value: Map<number>['foo']; // numb*/