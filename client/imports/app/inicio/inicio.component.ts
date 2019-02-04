import { Component } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import  {RolesService} from "../services/roles.service";
import {Generic} from "../services/generic.interface";
@Component({
  selector: 'inicioC',
  templateUrl: 'inicio.html',
  styleUrls: ['inicio.scss']
})
export class InicioComponent extends Generic{
  
    
   
    constructor( rol : RolesService)
    {
        super(0, 1, "comun", rol);

        
    }

 
/*    loggedIn() {
        return !!Meteor.user() ;
      }
    
    logginIn()
    {
        return Meteor.loggingIn();
    }
  */
}
