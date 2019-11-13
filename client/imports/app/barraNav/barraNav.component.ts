import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import  {RolesService} from "../services/roles.service";
import { Generic } from 'imports/clases/generic.class';
import { User } from 'imports/models/User';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MethodsClass } from 'imports/functions/methodsClass';
import { PATTERN } from 'imports/functions/commonFunctions';

import{ CommonModule } from '@angular/common';


@Component({
  selector: 'barraNav',
  templateUrl: 'barraNav.html',
  styleUrls: ['barraNav.scss']
})
export class BarraNavComponent extends Generic implements OnInit, OnDestroy{
  
    mostrarLogin : boolean = false;
    userLogin : User;
    addForm: FormGroup;
    addForm2: FormGroup;
    fortalezaPassSel; 
    fortalezaPass  = {
      incorrecta: {
        texto : "Incorrecta", // solo letras(en may o min) o numeros
         style: {
            color: "red"
         } 
      },
      insegura: {
          texto : "Insegura", // solo letras(en may o min) o numeros
         style: {
          color: "grey"
         } 
      },
      debil: {
        texto : "Debil", // letras(en may o min) y numeros o letras (en may y min)
         style: {
          color: "orange"
         }
      },
      segura: {  // letras(en may y min) y  numeros 
        texto : "Segura",
         style: {
          color: "#6ead35"
         }
      },
      muySegura: { // letras(en may y min), numeros y simbolos
        texto : "Muy segura",
         style: {
          color: "green"
         }
      }
    }
    constructor( rol : RolesService, private formBuilder: FormBuilder)
    {
        super(0, 1, "comun", rol);

        this.userLogin = {
            username : "",
            password: "",
            profile: {
                apellidos : "",
                nombre : ""
            }
          }
        this.fortalezaPassSel = this.fortalezaPass.insegura;
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
/*
    FB.init({
      appId      : '489516028440012',
      cookie     : true,
      xfbml      : true,
      version    : 'v5.0'
    });
      
    FB.AppEvents.logPageView();   

    
    FB.getLoginStatus(function(response) {
      console.log(JSON.stringify(response));
    });*/
  }

  unirse()
  {
     let vm=this;
    if (this.addForm2.valid) {

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

      let reqUsername  =[
        Validators.required,
        Validators.minLength(10),
        Validators.pattern(PATTERN.EMAIL)
        ]
        let reqPass = [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
          Validators.pattern(PATTERN.PASS)
          ]

        

      this.addForm = new FormGroup({
        'username': new FormControl(this.userLogin.username, reqUsername),
        'password':new FormControl(this.userLogin.password, reqPass)
        
      });

    this.addForm2 = new FormGroup({
      'username': new FormControl(this.userLogin.username, reqUsername),
      'password':new FormControl(this.userLogin.password, reqPass),
      "nombre" : new FormControl(this.userLogin.profile.nombre, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20),
        //Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')
        ]),
        "apellidos" : new FormControl(this.userLogin.profile.nombre, [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
          //Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')
          ]),
      });
    }
    isValid()
    {
        return this.addForm.valid;
    }

    isValidReg()
    {
      return this.addForm2.valid;
    }


    comprobarFortalezaPass()
    {

      let vm =this;

      let pass : string  = vm.addForm2.value.password;
      let [min, letras, letras_min, letras_may,  numeros, simbolos] = 
      [pass.match( PATTERN.PASS.toString()), pass.match( PATTERN.LETRAS.toString()), pass.match( PATTERN.LETRAS_MIN.toString()),
         pass.match( PATTERN.LETRAS_MAY.toString()), pass.match( PATTERN.NUMEROS.toString()),  pass.match( PATTERN.RARE_CHAR.toString())]
      if(!min)
      {
          this.fortalezaPassSel = this.fortalezaPass.incorrecta
      } 
      // muysegura
      else if(letras_min && letras_may && numeros && simbolos)
      {
          this.fortalezaPassSel = this.fortalezaPass.muySegura
      }
      //segura
      else if(
            !letras_min && letras_may && numeros && simbolos
          || letras_min && !letras_may && numeros && simbolos
          || letras_min && letras_may && !numeros && simbolos
          ||letras_min && letras_may && numeros && !simbolos )
      {
          this.fortalezaPassSel = this.fortalezaPass.segura
      }
      else 
      {
          this.fortalezaPassSel = this.fortalezaPass.debil
      } 

    }
}
