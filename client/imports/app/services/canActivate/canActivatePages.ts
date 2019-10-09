import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Resolve } from '@angular/router';
import { Observable, from } from 'rxjs';
import { RolesService } from '../roles.service';
import { Permisos } from 'imports/models/rol';
import { MethodsClass } from 'imports/functions/methodsClass';



@Injectable()
export class HnResolver implements Resolve<Observable<Permisos>> {
  constructor() {}

  resolve() {

    let res : Promise<Permisos> =new Promise<Permisos>((resolve, reject)=>{
        /*MethodsClass.call("getPermisosByRol", (res)=>{
          //TODO HACER QUE SEA SIN RECARGAR.
        // location.reload();
            resolve(res)
        }, (e)=>{
            reject("ERROR")
        }) */

        setTimeout(()=>{
          resolve(30)
        }, 500)

    });
    return from(res);
  }
}
@Injectable()
export class canActivateNone implements CanActivate {



  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
     
    
    
    
    
    return this.permissions.checkCanActivate( state, Permisos.NONE)
  }
  constructor(private permissions: RolesService) {

    
  }


}


@Injectable()
export class canActivateLogin implements CanActivate {



  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
     return this.permissions.checkCanActivate( state, Permisos.LOG)
  }
  constructor(private permissions: RolesService) {

    
  }


}


@Injectable()
export class canActivateAlumno implements CanActivate {



  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return this.permissions.checkCanActivate(state, Permisos.ALUMNO) 
  
  }
  constructor(private permissions: RolesService) {

    
  }


}


@Injectable()
export class canActivateProf implements CanActivate {



  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
     
    return this.permissions.checkCanActivate( state, Permisos.PROFES) 
    
  }
  constructor(private permissions: RolesService) {

    
  }


}


@Injectable()
export class canActivateAdmin implements CanActivate {



  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return this.permissions.checkCanActivate( state, Permisos.ADMIN)  
  
  }
  constructor(private permissions: RolesService) {

    
  }


}



@Injectable()
export class canActivateSAdmin implements CanActivate {



  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
     return this.permissions.canRead(Permisos.S_ADMIN)
  }
  constructor(private permissions: RolesService) {

    
  }


}