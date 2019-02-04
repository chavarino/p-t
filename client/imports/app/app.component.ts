
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import  {RolesService} from "./services/roles.service";
import  {BanderasService} from "./services/flags.service";
import { Meteor } from 'meteor/meteor';
import { MeteorObservable } from 'meteor-rxjs';

import { Roles } from '../../../imports/collections/rol';
import "material-design-icons";

@Component({
  selector: 'app',
  templateUrl: 'app.html',
  styleUrls: ['app.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  rol:RolesService
  rolSubs : Subscription
  flags  : BanderasService;
  constructor(rol:RolesService, flags : BanderasService)
  {
    this.rol = rol;
    this.flags = flags;
    this.flags.setModalConfig({

      config : {
          title : "",
          msg : "",
          tipo : -1
      },
      fn : function()
      {
         console.log ("Main")
      }
  })
  }
    ngOnInit() {
      //cargar rol
      /*
      read : number,
  write : number*/

    this.rolSubs = MeteorObservable.subscribe('rolByUser').subscribe(() => {
      //this.todos = Todos.findOne();
      let  jaleo = Roles.findOne();
      this.rol.setRoles(jaleo.rol);
    });
      
  }
  retornar ($event)
  {
     this.flags.getModalConfig().fn($event);
  }
  loggedIn() {
    return !!Meteor.user() ;
  }

logginIn()
{
    return Meteor.loggingIn();
}

  ngOnDestroy() {
    if (this.rolSubs) {
      this.rolSubs.unsubscribe();
    }
  }
  
}
