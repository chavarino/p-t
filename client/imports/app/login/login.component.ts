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
export class LoginComponent implements OnInit{
  rol:RolesService
  private _mostrar :boolean;
  userLogin : User;
  addForm: FormGroup;
  constructor(rol:RolesService, private formBuilder: FormBuilder)
  {
    this.rol = rol;

    this.userLogin = {
      username : "",
      password: ""
    }
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

  recargarPermisos()
  {
    this.rol.setRoles(Roles.findOne().rol);
  }
  loginFacebook()
  {
    let vm = this;
      Meteor.loginWithFacebook({requestPermissions: ['public_profile', 'email']}, function(err){
        if (err) {
            console.log('Handle errors here: ', err);
        }
        else{
          vm.recargarPermisos()
        }
    });
  }

  unirse()
  {
     
    if (this.addForm.valid) {

      MethodsClass.call("unirse", this.userLogin);
      
    }
    
  }
  loginWithPassword()
  {
    let vm =this;
    if (this.addForm.valid) {
    
        
        Meteor.loginWithPassword(this.userLogin.username, this.userLogin.password, function(err){
          if (err) {
              console.log('Handle errors here: ', err);
              alert(err)
          }else{
            vm.recargarPermisos();
              //alert("Loguea")
          }
      });
    
    }
  }
  loginGoogle()
  {
    let vm = this;
      Meteor.loginWithGoogle({requestPermissions: ['email', 'profile']}, function(err){
        if (err) {
            console.log('Handle errors here: ', err);
        }else{
          vm.recargarPermisos()
        }
    });
  }

  ngOnInit()
    {
      this.addForm = new FormGroup({
        'username': new FormControl(this.userLogin.username, [
        Validators.required,
        Validators.minLength(10),
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")
        ]),
        'password': new FormControl(this.userLogin.password, [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(20),
            //Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')
            ])
        
    });
    }
    isValid()
    {
        return this.addForm.valid;
    }
}
