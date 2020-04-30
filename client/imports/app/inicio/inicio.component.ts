import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import  {RolesService} from "../services/roles.service";
import { Generic } from 'imports/clases/generic.class';
import { ConfigTags } from '../categorias/categorias.component';
import { FormBuilder } from '@angular/forms';
import { ModulesEnum } from 'imports/models/enums';
import { MethodsClass } from 'imports/functions/methodsClass';

@Component({
  selector: 'inicioC',
  templateUrl: 'inicio.html',
  styleUrls: ['inicio.scss']
})
export class InicioComponent extends Generic{
  
  textSugerencia:string;
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

  canSendSugerencia() :boolean
  {
      return !!this.textSugerencia && this.textSugerencia !== "";
  }

  enviarSugerencia()
  {
    console.log("Enviando sugerencia, msg:" + this.textSugerencia);
    MethodsClass.call("sendSugerencia", this.textSugerencia,  (res)=>{
        console.log("Enviado con éxito");
        alert("Sugerencia enviada con éxito, muchas gracias.");
        this.textSugerencia="";
        
    }, (error)=>{
        console.log('Handle errors here: ', error);
    });
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



