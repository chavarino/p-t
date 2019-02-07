
import { Meteor } from 'meteor/meteor';
import  {RolesService} from "../services/roles.service";
import {Room} from "../../../../imports/models/room"
import {Perfil} from "../../../../imports/models/perfil"
import { Rooms } from '../../../../imports/collections/room';
import { FormGroup, FormBuilder,Validators,FormControl } from '@angular/forms';
import {Generic} from "../services/generic.interface";
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs/Subscription';


import {ReduxC, Estado, LogicEstado} from "../services/reduxC";
import { Action } from 'redux';
import { MsgTipo, Message } from 'imports/models/message';
import { MsgClass } from 'imports/functions/commonFunctions';

enum ETipo  {
    INIT = 1,
    GO_CLASS = 2,
    WAIT_CALL = 3,
    WAIT_CALL_ACCEPT =4
}



@Component({
  selector: 'roomP',
  templateUrl: 'roomProf.html',
  styleUrls: ['roomProf.scss']
})
export class RoomProfComponent extends Generic  implements OnInit, OnDestroy{
    
    clase : Room
    roomProf :Subscription;
    addForm: FormGroup;
    existePet : boolean;
    interval : any;
    redux : ReduxC;
    estadoLogic :  LogicEstado[];
    constructor( rol : RolesService, private formBuilder: FormBuilder )
    {
        super(1, 1, "Prof", rol);

        let vm =this;

        vm.redux = new ReduxC(function(state : Estado, action : Action<number>)
        {
            return vm.reducer(state, action);
        })
        
        vm.estadoLogic =[

           // init : 
            {
                action : ETipo.INIT,
                fromEstado : [null, undefined, ETipo.WAIT_CALL_ACCEPT] 
            },
//            waitCall :
            {
                action : ETipo.WAIT_CALL,
                fromEstado : [ETipo.INIT]
            },
            //waitCallAccept :
            {
                action : ETipo.WAIT_CALL_ACCEPT,
                fromEstado : [ ETipo.WAIT_CALL]
            }
        ]


        this.iniClase();
        this.existePet = false;
        vm.setDisponible(true)
        window.onbeforeunload = function (event) {

            
            var message = 'Important: Please click on \'Save\' button to leave this page.';
            if (typeof event == 'undefined') {
                event = window.event;
            }
            if (event) {
                event.returnValue = message;
            }
            
            
            vm.setDisponible(false)
            return message;
        };

        
       /* this.interval =setInterval(function(){ 

            if(!vm.clase || !vm.clase.alumnoId ||vm.clase.alumnoId==="")
            {
                Meteor.call('bindProf', (error, result) => {
                   
                    if(error)
                    {
                        alert(error);
                        console.error(error);
                    }
                    
                });

            }
        
         }, 2000);*/
    }

    //TODO crear lector de mensajes.


    //BORRAR MENSAJES


    

    

    


    private reducer (state : Estado = {}, action : Action<number>) : Estado
    {
        let vm =this;
        let nextState :Estado = {
            id : action.type
        }
        let mServ : MsgClass =  this.msgServ;
        let funciones : Map<Number, (m :Message)=> void > ;
        let profile : Perfil=  Meteor.user().profile;
        let fnMsgCallIni = function(m :Message)
        {
            
            if(profile.disponible)
            {
                profile.disponible =false;
                vm.setDisponible(false);
                vm.redux.estado.userFrom = m.from;
                vm.redux.nextStatus({ type: ETipo.WAIT_CALL_ACCEPT});


            }
            else{
                mServ.sendMsg(m.from,MsgTipo.CALL_NO_DISPONIBLE)
            }

        }
        let  cancelarCall = ()  =>{
            vm.redux.estado.userFrom = null;
            vm.redux.nextStatus({ type: ETipo.INIT });
        }
        let fnMsgCancelCall = function(m :Message)
        {
            
            if(vm.redux.estado.userFrom === m.from)
            {
                
                //cancelamos y vamos a init
                cancelarCall();

                

            }
            

        }
        
        //action.type
        let tipo  = action.type;
        
        
        tipo = vm.redux.canGo(vm.estadoLogic, state, tipo);



        switch (tipo) {
            case ETipo.INIT:
                nextState.ini= function()
                {
                
                let perfil : Perfil =   Meteor.user().profile;
        
                if(perfil.disponible)
                {
                    //TODO quitar disponible
                    vm.setDisponible(false)
                    perfil.disponible = false;
                    
                }
        
                //esta en una clase?
                //borramos mensajes
                vm.borrarMsg()
                if(perfil.claseId && perfil.claseId !== "")
                {
                    //si
                    
                    //mandamos mensaje de resconexion
        
                    //TODO
                    let idAlumno : string;
                        if(vm.clase && vm.clase.alumnoId)
                        {
                            idAlumno =  vm.clase.alumnoId;
                        }
                        else{
                            idAlumno = Rooms.findOne(perfil.claseId).alumnoId;
                        }
                        
                        vm.sendMsg(idAlumno, MsgTipo.RECONNECT);
        
                        vm.redux.nextStatus({ type: ETipo.GO_CLASS})
                    
        
                }
                else{
                        //no está en clase
                        //ponemos la disponibilidad a true;
        
                        vm.setDisponible(true)
                        vm.redux.nextStatus({ type: ETipo.WAIT_CALL})
                }
        
                }
            break;
            case ETipo.WAIT_CALL:
                
                funciones[MsgTipo.CALL_INI] = fnMsgCallIni;
                nextState.dispatcher = function()
                {
                    
                    mServ.readMsgs(funciones)
                }


            break;
            case ETipo.WAIT_CALL_ACCEPT:
                
                funciones[MsgTipo.CALL_INI] = fnMsgCallIni;
                funciones[MsgTipo.CALL_CANCEL] = fnMsgCancelCall;
                nextState.userFrom = state.userFrom;
                const time = 10000;
                let  idAux;
                nextState.ini =  ()  =>{
                    idAux= setTimeout(() =>{

                        //si pasa el tiempo y se ejecuta se cancela.

                      
                        vm.sendMsg(vm.redux.estado.userFrom, MsgTipo.CALL_CANCEL);
                        //enviar mensaje de cancelacion

                        //goInit
                        cancelarCall();
                        

                    }, time)
                };
                nextState.dispatcher = function()
                {
                    
                    mServ.readMsgs(funciones)
                }
                const idTOut = idAux;
                nextState.destroy = ()=>{

                    clearTimeout(idTOut)
                }
                
            break;
            default:
              return state;
            }

            return nextState;
    }

    setDisponible(disponible : Boolean)
    {

        let  p  : Perfil = Meteor.user().profile
        p.disponible= false;
        Meteor.call('setDisponible', disponible, (error, result) => {
                   
            if(error)
            {
                alert(error);
                console.error(error);
            }
            
        });
    }
    isInClass()
    {
      return this.existePet;
    }
    ngOnInit()
    {
        /*this.addForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellidos: ['', Validators.required],
          });*/
          this.clase.urlVideo
          
          this.addForm = new FormGroup({
                    'urlVideo': new FormControl(this.clase.urlVideo, [
                    Validators.required,
                    Validators.minLength(1),
                   // Validators.maxLength(40),
                   // Validators.pattern('^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$')
                    ])
                    
                });
       

        let vm =this;
        this.roomProf =  MeteorObservable.subscribe('getRoomForProf').subscribe(() => {
            
           // this.rol.setRoles(Roles.findOne().rol);
          // this.clase = Rooms.findOne({profId : Meteor.userId()});
          

           Rooms.find({profId : Meteor.userId(), activo : true}).subscribe((data) => { 
                    this.clase = data[0];
                    vm.findClass();
            });
          });
          
    }

    findClass()
    {
        
            if(this.clase)
            {
                this.existePet = true;
            }
            else{
                this.existePet= false;
                this.iniClase();
                //
            }
    }

    ngOnDestroy()
    {
        let vm =this;
        if (this.roomProf) {
            this.roomProf.unsubscribe();
          }
          if(this.interval)
          {

              clearInterval(this.interval);
          } 

          vm.setDisponible(false)
    }

    isValid()
    {
        return this.addForm.valid;
    }

    iniClase()
    {
        this.clase = {
            alumnoId : "",
            peticion : "",
            titulo : ""           
        }
    }
    comenzar()
    {
       let vm = this;
       //this.addForm.
       if (this.addForm.valid) {
          
           Meteor.call('comenzar', this.clase, (error, result) => {
               
               if(error)
               {
                   alert(error);
               }
               else {
                   alert("Guardado")
                   //vm.findClass()
                   //window.location.reload();
               }
           });
       }
      else  {
         alert("Invalido")
       }
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



