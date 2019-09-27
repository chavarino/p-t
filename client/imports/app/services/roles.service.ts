import { Injectable } from '@angular/core';
import { Rol, Permisos} from "../../../../imports/models/rol";

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
        if(!permisos)
        {
            this.setIniRoles();
        }
        else{
            this.permisos =  permisos;
        }
    }



    canRead(min:Permisos)
    {
        if(!this.permisos)
        {
            return false;
        }
    
        return this.permisos >= min;
    }
    
}


/*


let keys: keyof Map<number>; // string
let value: Map<number>['foo']; // numb*/