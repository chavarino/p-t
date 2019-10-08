import { Component, OnInit, OnDestroy, EventEmitter} from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import {Roles} from "../../../../imports/collections/rol"
import { Permisos } from '../../../../imports/models/rol';
import { MethodsClass } from 'imports/functions/methodsClass';
@Component({
    selector: 'loadRoles',
    template: "",
    styleUrls: [],
    outputs : ["onRoles"]
  })
export class LoadRoles  implements OnInit, OnDestroy{

    rolSubs : Subscription
    
    
    onRoles: EventEmitter<Permisos> = new EventEmitter<Permisos>();
    
    rolAnterior : number
    
    ngOnDestroy(): void {
        if (this.rolSubs) {
            this.rolSubs.unsubscribe();
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
        MethodsClass.call("getPermisosByRol", (res)=>{
          //TODO HACER QUE SEA SIN RECARGAR.
         // location.reload();
            
            this.onRoles.emit(res)
         }) 
        Tracker.autorun(()=>{
          if(Meteor.user() && Meteor.user().profile.rol!== this.rolAnterior)
          {
            this.rolAnterior = Meteor.user().profile.rol;
            MethodsClass.call("getPermisosByRol", this.rolAnterior, (res)=>{
              //TODO HACER QUE SEA SIN RECARGAR.
             // location.reload();
                this.onRoles.emit(res)
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
        
    }
  
    loggingIn()
    {
      return Meteor.loggingIn()
    }
    constructor()
    {
        

        
    }

}
