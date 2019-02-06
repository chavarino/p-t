
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import  {RolesService} from "../services/roles.service";
import  {BanderasService} from "../services/flags.service";
import {Generic} from "../services/generic.interface";
import { Room } from '../../../../imports/models/room';
import { Rooms } from '../../../../imports/collections/room';
import { Observable } from 'rxjs/Observable';
import { MeteorObservable } from 'meteor-rxjs';
import { CanActivate } from '@angular/router';
import { FormGroup, FormBuilder,Validators,FormControl } from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import { User } from 'imports/models/User';
import { Users } from 'imports/collections/users';
@Component({
  selector: 'roomA',
  templateUrl: 'roomAlumno.html',
  styleUrls: ['roomAlumno.scss']
})
export class RoomAlumnoComponent extends Generic implements OnInit, OnDestroy, CanActivate{
  
    clase : Room
    roomAlumno :Subscription;
    addForm: FormGroup;
    inClass : boolean;
    sanitizer : DomSanitizer;
    ///todos: Observable<Room>;
    flags : BanderasService;
    profesoresSuscription:  Subscription;

    profesores : Observable<User[]>;

    constructor( rol : RolesService, private formBuilder: FormBuilder, sanitizer : DomSanitizer,flags : BanderasService)
    {

        super(1, 1, "comun", rol);
        this.iniClase();
        this.inClass = false;
        this.sanitizer = sanitizer;
        this.flags = flags;
    }
    
    isInClass()
    {
        return this.inClass;
    }
    iniClase()
    {
        this.clase = {
            alumnoId : "",
            peticion : "",
            titulo : "",
            urlVideo : ""           
        }
    }
    canActivate() {
        //const party = Parties.findOne(this.partyId);
        return this.canRead() && this.loggedIn();
      }
    save()
    {
        let vm =this;
        //this.addForm.
        if (this.addForm.valid) {
           
            Meteor.call('savePeticion', this.clase, (error, result) => {
                
                if(error)
                {
                    alert(error);
                }
                else {
                    alert("Guardado")
                    vm.findClass()
                   // window.location.reload();
                }
            });
        }
       else  {
          alert("Invalido")
        }
    }


    tryCallProfesor(profesor  : User )
    {
        console.log(profesor)

    }
    terminar()
    {
        let vm =this;
        
           
            Meteor.call('terminar', this.clase._id, (error, result) => {
                
                if(error)
                {
                    alert(error);
                }
                else {
                    alert("Clase terminada")
                    vm.findClass()
                   // window.location.reload();
                }
            });
        
    }



    setModalConfig()
    {
        this.flags.setModalConfig({config: {title: "Confirmacion", msg : "Quieres llamar  aeste profesor?", tipo : 1}, fn : function(evento){

            if(evento)
            {
                alert("OKEY")
            }
            
        }})
    }
    getUrl()
    {
        if(this.clase.urlVideo === "")
        {
            return this.sanitizer.bypassSecurityTrustResourceUrl("");
        }
        return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${this.clase.urlVideo}?autoplay=1&controls=0&disablekb=1&modestbranding=1&iv_load_policy=3`);
    }
    ngOnInit()
    {
        /*this.addForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellidos: ['', Validators.required],
          });*/

          this.addForm = new FormGroup({
                    'peticion': new FormControl(this.clase.peticion, [
                    Validators.required,
                    Validators.minLength(10),
                   // Validators.maxLength(40),
                   // Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')
                    ]),
                    'titulo': new FormControl(this.clase.titulo, [
                        Validators.required,
                        Validators.minLength(1),
                        Validators.maxLength(70),
                        //Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')
                        ])
                    
                });
       

        let vm =this;
        
            
        this.profesoresSuscription =  MeteorObservable.subscribe('allAvalaibleTeacher').subscribe(() => {
            
            vm.profesores = Users.find({_id: { $ne: Meteor.userId() }});
            //vm.findClass();
        });
        
        this.roomAlumno =  MeteorObservable.subscribe('getRoomForAlumno').subscribe(() => {
            
                Rooms.find({alumnoId : Meteor.userId(), activo : true}).subscribe((data) => { 
                    this.clase = data[0];
                    vm.findClass();
            });
           // this.rol.setRoles(Roles.findOne().rol);
          
          });
    }
    findClass()
    {
       // this.clase = Rooms.findOne(Meteor.userId);
            if(this.clase && this.clase._id)
            {
                this.inClass = true;
            }
            else{
                this.inClass= false;
                this.iniClase();
            }
    }

    ngOnDestroy()
    {
        if (this.roomAlumno) {
            this.roomAlumno.unsubscribe();
          }

        if (this.profesoresSuscription) {
             this.profesoresSuscription.unsubscribe();
        }
    }

    isValid()
    {
        return this.addForm.valid;
    }
    
    isComenzado()
    {
        return this.clase.comenzado;

    }

    
    isTerminado()
    {
        return this.clase.activo;
    }

    getTextEstado()
    {
       
    }
    
 //Meteor.user().profile
  
}
