import { Component } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import  {RolesService} from "../services/roles.service";
import { Generic } from 'imports/clases/generic.class';
import { ConfigTags } from '../categorias/categorias.component';

@Component({
  selector: 'inicioC',
  templateUrl: 'inicio.html',
  styleUrls: ['inicio.scss']
})
export class InicioComponent extends Generic{
  
    categorias  :string = "" 
    configTags : ConfigTags = {
      listCat : [],
      listCatBusc : []
  }
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
