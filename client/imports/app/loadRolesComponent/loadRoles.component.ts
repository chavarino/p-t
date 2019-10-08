import { Component, OnInit, OnDestroy, EventEmitter} from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import {Roles} from "../../../../imports/collections/rol"
import { Permisos } from '../../../../imports/models/rol';
@Component({
    selector: 'loadRoles',
    template: "",
    styleUrls: [],
    outputs : ["onRoles"]
  })
export class LoadRoles  implements OnInit, OnDestroy{

    rolSubs : Subscription
    
    
    onRoles: EventEmitter<Permisos> = new EventEmitter<Permisos>();
    
    
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
      this.rolSubs = MeteorObservable.subscribe('rolByUser').subscribe(() => {
          //this.todos = Todos.findOne();
          let rol = 1;
          if(this.loggingIn())
          {
            rol = Meteor.user().profile.rol;
          }
          
          Roles.find({codigo: rol}).subscribe((data)=>{
            let res;
            if(data[0])
            {
              res  = data[0].perm;
                
            }
            this.onRoles.emit(res)
          })
          
        });
    
        Tracker.autorun(()=>{
          if(Meteor.user())
          {
            //this.rol.setIniRoles();
            Roles.find({codigo: Meteor.user().profile.rol}).subscribe((data)=>{
      
              let res;
              if(data[0])
              {
                res  = data[0].perm;
                  
              }
              this.onRoles.emit(res)
            })
    
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
