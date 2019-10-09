import { Component, OnInit, OnDestroy, EventEmitter} from '@angular/core';
import { Meteor } from 'meteor/meteor';

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
    outputs : ["onRoles"]
  })
export class LoadRoles  implements OnInit, OnDestroy{

   
    
    
    onRoles: EventEmitter< Observable<Permisos>> = new EventEmitter<Observable<Permisos>>();
    rolAnterior : number

    ngOnDestroy(): void {
        
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
        
        
   



          
        let o = new Observable<Permisos>((obs)=>{
          
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

        })

        this.onRoles.emit(o);
        
        
    }

    

    loggingIn()
    {
      return Meteor.loggingIn()
    }
    constructor(private rol:RolesService)
    {
        

        
    }

}
