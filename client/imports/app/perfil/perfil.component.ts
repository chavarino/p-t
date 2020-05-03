import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import  {RolesService} from "../services/roles.service";

import { Perfil } from '../../../../imports/models/perfil';
import { Users } from '../../../../imports/collections/users';
import { MeteorObservable } from 'meteor-rxjs';

import { FormGroup, FormBuilder,Validators,FormControl } from '@angular/forms';
import  {BanderasService} from "../services/flags.service";
import {MethodsClass} from "../../../../imports/functions/methodsClass"
import {ConfigTags} from  "../categorias/categorias.component"

import { FactoryCommon } from 'imports/functions/commonFunctions';
import { Generic } from 'imports/clases/generic.class';
import { FilesI } from 'imports/models/fileI';
import { ModulesEnum } from 'imports/models/enums';




@Component({
  selector: 'perfilC',
  templateUrl: 'perfil.html',
  styleUrls: ['perfil.scss']
})
export class PerfilComponent extends Generic implements OnInit, OnDestroy{
  
    perfil : Perfil
    userSuscripcion :Subscription;
    updated : boolean;
    addForm: FormGroup;
    flags : BanderasService;
    configTags : ConfigTags = {
        listCat : [],
        listCatBusc : []
    }
    constructor( rol : RolesService, private formBuilder: FormBuilder,flags : BanderasService,private cd :ChangeDetectorRef )
    {

        super(1, 1, "comun", rol);
        this.updated=false;
        rol.setModulo(ModulesEnum.PERFIL);
        this.perfil = {
            foto : "",
            rol : 0,
            email : "",
            nombre : "",
            apellidos : "",
            disponible: false,
            perfClase : {
                categorias : [],
                clases : [],
                ultElo : 0,
                eloModel : undefined,
                nombre : "",
                ultPrecio: 0,
                updated : false
            },
            descripcion : ""
        }
        this.flags = flags;
    }
    
    addFile(files : Array<FilesI>)
    {
        if(files && files.length>0 && FactoryCommon.isImageCorrect(files[0]))
        {
            // image/png
            this.perfil.foto = files[0].valueUrl;
        }
        else{
            alert("Imagen incorrecta. La imagen debe ser un formato compatible (*.png, .jpg ...) y de un tamaño máximo de 5MB ");
        }
    }

   
    save()
    {
        //this.addForm.
        if(this.perfil.perfClase)
        {
            this.perfil.perfClase.categorias = this.configTags.listCat;

        }
        if (this.addForm.valid) {
            alert("Guardado")

            MethodsClass.call("savePerfil", this.perfil);
            
        }
       else  {
        alert("Invalido")
        }
        this.updated =false;
    }
    ngOnInit()
    {
        /*this.addForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellidos: ['', Validators.required],
          });
          let vm=this;
          Tracker.autorun(()=>{
            if(Meteor.user() )
            {
                let rol =  Meteor.user().profile.rol;
                setTimeout(()=>{

                    vm.cd.reattach();
            
                  }, 500)
            }
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
                        ]),
                    'descripcion': new FormControl(this.perfil.descripcion, [
                        
                        Validators.maxLength(500)
                        
                        ])
                    
                });
       
              

        this.userSuscripcion =  MeteorObservable.subscribe('usersProfile').subscribe((valueSus) => {

            Users.find({_id:Meteor.userId()}).subscribe((data)=>{

                if(data[0] &&  !this.updated)
                {
                    
                    this.perfil = data[0].profile;
                    if(this.perfil.perfClase)
                    {

                        this.configTags.listCat = this.perfil.perfClase.categorias || [];
                    }

                    this.updated=true;
                }
                else{
                  //this.rol.setRoles(data[0].rol);
        
                }
              })
           // this.rol.setRoles(Roles.findOne().r7ol);

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
        MethodsClass.call("changePerfilToProfesor", ()=>{
            //TODO HACER QUE SEA SIN RECARGAR.
            //location.reload();
            vm.perfil = Meteor.user().profile;
        })
      /*
        this.flags.setModalConfig(MethodsClass.getConfigConfirm(msg.title, msg.bSetProfesor,  function(evento){

            if(evento)
            {
                //vm.tryCallProfesor(prof)
            }
            
        }));*/
    }
    
    
 //Meteor.user().profile
  
}
