import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import  {RolesService} from "../services/roles.service";
import { Generic } from 'imports/clases/generic.class';
import { ConfigTags } from '../categorias/categorias.component';
import { FormBuilder } from '@angular/forms';
import { ModulesEnum } from 'imports/models/enums';

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
  constructor( rol : RolesService, private formBuilder: FormBuilder)
  {
      super(0, 1, "comun", rol);
      rol.setModulo(ModulesEnum.INICIO);
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



