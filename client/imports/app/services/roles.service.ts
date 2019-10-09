import { Injectable } from '@angular/core';
import { Rol, Permisos} from "../../../../imports/models/rol";
import { isUndefined } from 'util';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

interface Map<T> {
    [key: string]: T;
}


@Injectable({
  // we declare that this service should be created
  // by the root application injector.
  providedIn: 'root',
})
export class RolesService {

     permisos : Permisos;
        redirectUrl: string;
    

        constructor(private router: Router) {

    
        }
    
   
    getPermisos()
    {
        return this.permisos;
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
    
    checkCanActivate( state: RouterStateSnapshot, permisos :Permisos) :boolean
    {

        let can = this.canRead(permisos);
        if(!can)
        {

            this.redirectUrl = state.url;

            // Create a dummy session id
            //let sessionId = 123456789;

            // Set our navigation extras object
            // that contains our global query params and fragment
           /* let navigationExtras: NavigationExtras = {
            queryParams: { 'session_id': sessionId },
            fragment: 'anchor'
            };*/

            // Navigate to the login page with extras
            this.router.navigate(['/inicio']);
        }


        return can;
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