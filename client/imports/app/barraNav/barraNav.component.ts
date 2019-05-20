import { Component, OnInit, OnDestroy } from '@angular/core';
import  {RolesService} from "../services/roles.service";
import {Generic} from "../services/generic.interface";
//import {Meteor} from "meteor/meteor";


@Component({
  selector: 'barraNav',
  templateUrl: 'barraNav.html',
  styleUrls: ['barraNav.scss']
})
export class BarraNavComponent extends Generic implements OnInit, OnDestroy{
  
    mostrarLogin : boolean = true;

    constructor( rol : RolesService)
    {
        super(0, 1, "comun", rol);

        

    }
    
    mostrarLoginAc (mostrar : boolean)
    {
      this.mostrarLogin=mostrar
    }
    ngOnInit() {
        
        
    }
    logout()
    {
       
        Meteor.logout(function(err)
        {
            
        })
    }
    getNombre()
    {
        return Meteor.user().profile.nombre + " " + Meteor.user().profile.apellidos;
    }

    getUrlFoto()
    {
        return  { "background-image": "url("+ Meteor.user().profile.foto+")"};
    }
    ngOnDestroy() {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        
    }
}
