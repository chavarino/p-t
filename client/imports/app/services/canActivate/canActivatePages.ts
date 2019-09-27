import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { RolesService } from '../roles.service';
import { Permisos } from 'imports/models/rol';

@Injectable()
export class canActivateNone implements CanActivate {



  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
     return this.permissions.canRead(Permisos.NONE)
  }
  constructor(private permissions: RolesService) {

    
  }


}


@Injectable()
export class canActivateLogin implements CanActivate {



  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
     return this.permissions.canRead(Permisos.LOG)
  }
  constructor(private permissions: RolesService) {

    
  }


}


@Injectable()
export class canActivateAlumno implements CanActivate {



  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
     return this.permissions.canRead(Permisos.ALUMNO)
  }
  constructor(private permissions: RolesService) {

    
  }


}


@Injectable()
export class canActivateProf implements CanActivate {



  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
     return this.permissions.canRead(Permisos.PROFES)
  }
  constructor(private permissions: RolesService) {

    
  }


}


@Injectable()
export class canActivateAdmin implements CanActivate {



  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
     return this.permissions.canRead(Permisos.ADMIN)
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