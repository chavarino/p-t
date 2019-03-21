import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import  {RolesService} from "../services/roles.service";
import {Generic} from "../services/generic.interface";
import { Perfil } from '../../../../imports/models/perfil';
import { Users } from '../../../../imports/collections/users';
import { MeteorObservable } from 'meteor-rxjs';
import { CanActivate } from '@angular/router';
import { FormGroup, FormBuilder,Validators,FormControl } from '@angular/forms';
import  {BanderasService} from "../services/flags.service";
import {MethodsClass} from "../../../../imports/functions/methodsClass"
@Component({
  selector: 'perfilC',
  templateUrl: 'perfil.html',
  styleUrls: ['perfil.scss']
})
export class PerfilComponent extends Generic implements OnInit, OnDestroy, CanActivate{
  
    perfil : Perfil
    userSuscripcion :Subscription;
    addForm: FormGroup;
    flags : BanderasService;
    constructor( rol : RolesService, private formBuilder: FormBuilder,flags : BanderasService)
    {

        super(1, 1, "comun", rol);
       this.perfil = {
            foto : "",
            rol : 0,
            email : "",
            nombre : "",
            apellidos : "",
            disponible: false,
            categorias : [],
            descripcion : ""
        }
        this.flags = flags;
    }
    
    canActivate() {
        //const party = Parties.findOne(this.partyId);
        return this.canRead() && this.loggedIn();
      }
    save()
    {
        //this.addForm.
        if (this.addForm.valid) {
            alert("Guardado")

            MethodsClass.call("savePerfil", this.perfil);
            
        }
       else  {
        alert("Invalido")
        }
    }
    ngOnInit()
    {
        /*this.addForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellidos: ['', Validators.required],
          });*/

          this.addForm = new FormGroup({
                    'nombre': new FormControl(this.perfil.nombre, [
                    Validators.required,
                    Validators.minLength(1),
                    Validators.maxLength(40),
                    Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')
                    ]),
                    'apellidos': new FormControl(this.perfil.apellidos, [
                        Validators.required,
                        Validators.minLength(1),
                        Validators.maxLength(70),
                        Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')
                        ])
                    
                });
       


        this.userSuscripcion =  MeteorObservable.subscribe('usersProfile').subscribe(() => {
            this.perfil = Users.findOne({_id:Meteor.userId()}).profile;
            
           // this.rol.setRoles(Roles.findOne().rol);

          });
    }
    ngOnDestroy()
    {
        if (this.userSuscripcion) {
            this.userSuscripcion.unsubscribe();
          }
    }

    isValid()
    {
        return this.addForm.valid;
    }

    setModalConfig()
    {
        let vm =this;
        let msg =  MethodsClass.msg.modal.confirm;
        this.flags.setModalConfig(MethodsClass.getConfigConfirm(msg.title, msg.bSetProfesor,  function(evento){

            if(evento)
            {
                MethodsClass.call("changePerfilToProfesor", ()=>{
                    
                })
                //vm.tryCallProfesor(prof)
            }
            
        }));
    }
    
    
 //Meteor.user().profile
  
}
