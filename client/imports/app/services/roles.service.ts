import { Injectable } from '@angular/core';
import { Rol, Permisos} from "../../../../imports/models/rol";
import { isUndefined } from 'util';

interface Map<T> {
    [key: string]: T;
}


@Injectable({
  // we declare that this service should be created
  // by the root application injector.
  providedIn: 'root',
})
export class RolesService {

    private permisos : Permisos;


    
    contructor()
    {
        this.setIniRoles();
    }

    setIniRoles()
    {
        this.permisos = Permisos.NONE
    }
    
    setRoles(permisos: Permisos)
    {
        if(isUndefined(permisos))
        {
            this.setIniRoles();
        }
        else{
            this.permisos =  permisos;
        }
    }



    canRead(min:Permisos, estricto ?:boolean)
    {
        if(isUndefined(this.permisos))
        {
            return false;
        }
    
        if(estricto)
        {
            return this.permisos === min;
        }
        else{

            return this.permisos >= min;
        }
    }
    
}


/*


let keys: keyof Map<number>; // string
let value: Map<number>['foo']; // numb*/