import { Component, OnInit, OnDestroy, EventEmitter} from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import {Roles} from "../../../../imports/collections/rol"
import { Permisos } from '../../../../imports/models/rol';
import { MethodsClass } from 'imports/functions/methodsClass';
import { Observable } from 'rxjs';
import { Router, NavigationExtras } from '@angular/router';
import { RolesService } from '../services/roles.service';
@Component({
    selector: 'loadRoles',
    template: "",
    styleUrls: [],
    outputs : []
  })
export class LoadRoles  implements OnInit, OnDestroy{

   
    
    
    //onRoles: EventEmitter<Permisos> = new EventEmitter<Permisos>();
    
    rolAnterior : number
    rolSubs : Subscription;
    ngOnDestroy(): void {
        if (this.rolSubs) {
            this.rolSubs.unsubscribe();
          }
    }

    setRoles(permisos :Permisos)
    { 
      let vm=this;
  
      if(!permisos)
      {
                this.rol.setIniRoles();
        }
        else{
          this.rol.setRoles(permisos);
          
        }
      }

    ngOnInit(): void {
            //cargar rol
          /*
          read : number,
      write : number*/
     /* this.rolSubs = MeteorObservable.subscribe('rolByUser').subscribe(() => {
          //this.todos = Todos.findOne();
          let rol = 1;
          if(!Meteor.user())
          {
              return;

          }
          
          //rol = Meteor.user().profile.rol;
          Roles.find().subscribe((data)=>{
            let res;
            if(!data || data.length===0)
            {
                return;
            }
            if(data[0])
            {
              res  = data[0].perm;
                
            }
            this.onRoles.emit(res)
          })
          
        });*/
        
        
        this.rolSubs =  new Observable<Permisos>((obs)=>{
          
          MethodsClass.call("getPermisosByRol", (res)=>{
            //TODO HACER QUE SEA SIN RECARGAR.
           // location.reload();
              obs.next(res)
            
           }) 

          Tracker.autorun(()=>{
            if(Meteor.user() && Meteor.user().profile.rol!== this.rolAnterior)
            {
              this.rolAnterior = Meteor.user().profile.rol;
              MethodsClass.call("getPermisosByRol", this.rolAnterior, (res)=>{
                //TODO HACER QUE SEA SIN RECARGAR.
               // location.reload();
                    obs.next(res)

               })   
              //this.rol.setIniRoles();
            /*Roles.find({codigo: Meteor.user().profile.rol}).subscribe((data)=>{
        
                let res;
                if(!data || data.length===0)
                {
                  return;
                }
                if(data[0])
                {
                  res  = data[0].perm;
                    
                }
                this.onRoles.emit(res)
              })
      
            }*/
          }
          });

        }).subscribe((res) => {
          //this.setMessage();

            //this.onRoles.emit(res)
            this.setRoles(res)
            this.redirectUrl();
          
        });


        
        
    }
    redirectUrl()
    { 
        // Get the redirect URL from our auth service
            // If no redirect has been set, use the default
            let redirect = this.rol.redirectUrl ?
             this.router.parseUrl(this.rol.redirectUrl) : '/inicio';
    
            // Set our navigation extras ñobject
            // that passes on our global query params and fragment
            let navigationExtras: NavigationExtras = {
              queryParamsHandling: 'preserve',
              preserveFragment: true
            };
    
            // Redirect the user
            this.router.navigateByUrl(redirect, navigationExtras);
    }
    loggingIn()
    {
      return Meteor.loggingIn()
    }
    constructor(private rol:RolesService, private router: Router)
    {
        

        
    }

}
