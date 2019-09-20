import { Component, OnInit, OnDestroy } from '@angular/core';
import  {RolesService} from "../services/roles.service";
import { Generic } from 'imports/clases/generic.class';
import { User } from 'imports/models/User';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MethodsClass } from 'imports/functions/methodsClass';

//import {Meteor} from "meteor/meteor";


@Component({
  selector: 'barraNav',
  templateUrl: 'barraNav.html',
  styleUrls: ['barraNav.scss']
})
export class BarraNavComponent extends Generic implements OnInit, OnDestroy{
  
    mostrarLogin : boolean = false;
    userLogin : User;
    addForm: FormGroup;
    constructor( rol : RolesService, private formBuilder: FormBuilder)
    {
        super(0, 1, "comun", rol);

        this.userLogin = {
            username : "",
            password: ""
          }

    }
    
    mostrarLoginAc (mostrar : boolean)
    {
      this.mostrarLogin=mostrar
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


    recargarPermisos()
  {

    //TODO 
    location.reload();
    /*
    let input  = {codigo: Meteor.user().profile.rol};
    let rol =  Roles.findOne(input);
    this.rol.setRoles(rol.rol);*/
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
     let vm=this;
    if (this.addForm.valid) {

      MethodsClass.call("unirse", this.userLogin,  (res)=>{
          console.log("Registrado con existo");
          alert("Usuario registrado con exito.")
          vm.loginWithPassword();
      }, (error)=>{
          console.log('Handle errors here: ', error);
      });
      
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
