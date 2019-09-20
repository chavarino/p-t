import { Component, OnInit, OnDestroy, Input,Output,EventEmitter } from '@angular/core';
import  {RolesService} from "../services/roles.service";
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from '../../../../imports/collections/rol';
import { User } from 'imports/models/User';
import { FormGroup, FormBuilder,Validators,FormControl } from '@angular/forms';


import {MethodsClass} from "../../../../imports/functions/methodsClass"
@Component({
  selector: 'login',
  templateUrl: 'login.html',
  styleUrls: ['login.scss']
  
})
export class LoginComponent {
  rol:RolesService
  private _mostrar :boolean;
  
  
  constructor(rol:RolesService, private formBuilder: FormBuilder)
  {
    this.rol = rol;
    //this._mostrar = false;
    
  }
  @Input()
  set mostrar(mostrar: boolean) {
    this._mostrar = mostrar;
  }
 
  get mostrar(): boolean { 
    return this._mostrar; 
  }
  @Output() cambio = new EventEmitter<boolean>();

  cerrar()
  {
    //this._mostrar =false;
    this.cambio.emit(false);
  }

  loggedIn() {
    return !!Meteor.user();
  }

  
}
