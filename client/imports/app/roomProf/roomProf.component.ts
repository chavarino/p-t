
import { Meteor } from 'meteor/meteor';
import  {RolesService} from "../services/roles.service";
import {RtcService} from "../services/rtc.service"

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
import { MsgTipo, Message, MessageRtc } from 'imports/models/message';
import { MsgClass,FactoryCommon } from 'imports/functions/commonFunctions';
import { Msg } from 'imports/collections/msg';
import {MethodsClass} from "../../../../imports/functions/methodsClass"
import {Tipo} from "../timeCounter/timeCounter.component"
import { User } from 'imports/models/User';
import { Users } from 'imports/collections/users';
enum ETipo  {
    INIT = 1,
    CLASS = 2,
    WAIT_CALL = 3,
    WAIT_CALL_ACCEPT =4,
    WAIT_CLASS=5,
    
}



@Component({
  selector: 'roomP',
  templateUrl: 'roomProf.html',
  styleUrls: ['roomProf.scss']
})
export class RoomProfComponent extends Generic  implements OnInit, OnDestroy{
    
    clase : Room
    roomProf :Subscription;
    alumnoSus :Subscription;
    addForm: FormGroup;
    existePet : boolean;
    interval : any;
    redux : ReduxC;
    estadoLogic :  LogicEstado[];
    localVideoId : string;
    remoteVideoId : string;
    maxPing : number;
    temp: object;
    alumnoCall : User;
    constructor( rol : RolesService, private formBuilder: FormBuilder )
    {
        super(1, 1, "Prof", rol);

        let vm =this;
       vm.maxPing = 3;

        vm.localVideoId ="localVideo"
        vm.remoteVideoId ="remoteVideo";

        this.temp = {
            tipo :Tipo.TEMP,
            secondsIni : 30,
            mostrar : true
        }
        
        vm.estadoLogic =[
            
            // init : 
            {
                action : ETipo.INIT,
                fromEstado : [null, undefined, ETipo.WAIT_CALL_ACCEPT,ETipo.WAIT_CLASS, ETipo.CLASS] 
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
            },
            //waitCallAccept :
            {
                action : ETipo.WAIT_CLASS,
                fromEstado : [ ETipo.WAIT_CALL_ACCEPT]
            },
            //waitCallAccept :
            {
                action : ETipo.CLASS,
                fromEstado : [ ETipo.WAIT_CLASS]
            }
        ]
        
        
        
        this.existePet = false;
        //vm.setDisponible(true)
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
        
        vm.redux = new ReduxC()
        vm.redux.setReducer( function(state : Estado, action : Action<number>)
        {
            return vm.reducer(state, action);
        });
        
    

         vm.redux.nextStatus({ type: ETipo.INIT });
    }

 


    

    
    isEstadoIni() :boolean
    {
        let vm = this;

        return vm.redux.estado.id === ETipo.INIT;
    }
    isEstadoWaitCall() :boolean
    {
        let vm = this;

        return vm.redux.estado.id === ETipo.WAIT_CALL;
    }
    isEstadoWaitAcceptCall() :boolean
    {
        let vm = this;

        return vm.redux.estado.id === ETipo.WAIT_CALL_ACCEPT;
    }
    isEstadoWaitClass() :boolean
    {
        let vm = this;

        return vm.redux.estado.id === ETipo.WAIT_CLASS;
    }

    isEstadoClass() :boolean
    {
        let vm = this;

        return vm.redux.estado.id === ETipo.CLASS;
    }

    
    
    private reducer (state : Estado = {}, action : Action<number>) : Estado
    {
        let vm =this;
        let nextState :Estado = {
            id : action.type,
            campos : {

            }
        }
        const time = 30000;
        let  idAux;
        let mServ : MsgClass =  this.msgServ;
        let funciones : Map<Number, (m :Message)=> void > ;
        let profile : Perfil=  Meteor.user().profile;
        let fnMsgCallIni = function(m :Message)
        {
            
            if(profile.disponible)
            {
                
                let fn1 = resolve =>{
                    
                    vm.setDisponible(false, ()=>{
    
                        vm.redux.estado.userFrom = m.from;
                        vm.alumnoCall = Users.findOne({_id : vm.redux.estado.userFrom});
                        vm.redux.nextStatus({ type: ETipo.WAIT_CALL_ACCEPT});
                        resolve(1)
                    });
                }
                FactoryCommon.promisesAnid(fn1)
                        .then(function(res)
                        {

                        })
                        .catch(error =>{
                        
                            alert(error);
                            console.error(error);
                        });

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
        //go class
        let fnMsgGoClassCall = function(m :Message)
        {
            
            if(vm.redux.estado.userFrom === m.from)
            {
                
               

                profile.claseId = m.cuerpo;
                vm.redux.nextStatus({ type: ETipo.CLASS });

            }
            

        }

        //recibe MSG PING 
        let fnMsgPing = function(m :Message)
        {
            
            if(vm.redux.estado.userFrom === m.from)
            {
                
                mServ.sendMsg(m.from,MsgTipo.PONG)
            }
            

        }
        //recibe MSG PING 
        let fnMsgPong = function(m :Message)
        {
            
            if(vm.redux.estado.userFrom === m.from)
            {
                
                vm.redux.estado.campos.ping =0;
            }
            

        }

        let fnMsgRtc = function(m :Message)
        {
            
            if(vm.redux.estado.userFrom === m.from)
            {
                //en el cuerpo lleva el mensaje RTC
                vm.rtc.getMsg(m.cuerpo);
            }
            

        }

        let fnMsgReconnect = function(m :Message)
        {
            
            if(vm.redux.estado.userFrom === m.from)
            {
                //en el cuerpo lleva el mensaje RTC
                vm.redux.estado.campos.ping = 0;
            }
            

        }
        
        //action.type
        let tipo  = action.type;
        
        
        tipo = vm.redux.canGo(vm.estadoLogic, state, tipo);

       /* if(!state.id && tipo ===-1)
        {
            tipo =ETipo.INIT
        }*/

        switch (tipo) {
            case ETipo.INIT:
  
                nextState.ini= function()
                {
                    
                    let perfil : Perfil =   Meteor.user().profile;
                    let fn1 = (resolve)=>
                    {
                
                        if(perfil.disponible)
                        {
                            
                            vm.setDisponible(false, function()
                            {
                                resolve(1);
                            })
                            perfil.disponible = false;
                            
                        }
                        else{
                            resolve(1);
                        }

                    }
            
                    //esta en una clase?
                    //borramos mensajes

                    let fn2 = (resolve) =>
                    {
                        vm.borrarMsg(()=>{
                            resolve(1)
                        })

                    }

                    let fn3 = (resolve) =>
                    {
                        
                        if(perfil.claseId && perfil.claseId !== "")
                        {
                            

                            
                            let idAlumno : string;
                            let clase = vm.clase
                                if(!vm.clase)
                                {
                                   clase = Rooms.findOne(perfil.claseId)
                                    
                                }

                                if(clase)
                                {
                                    idAlumno = clase.alumnoId;
                                    vm.sendMsg(idAlumno, MsgTipo.RECONNECT);
                    
                                    vm.redux.nextStatus({ type: ETipo.CLASS})
                                
                                    resolve(1);
                                }
                                else{
                                    this.terminarClase(()=>{
    
                                        vm.redux.nextStatus({ type: ETipo.WAIT_CALL})
                                        resolve(1);
                                    });
                                }
                                
                                
                        }
                        else{
                                //no está en clase
                                //ponemos la disponibilidad a true;
                
                                vm.setDisponible(true, ()=>{
    
                                    vm.redux.nextStatus({ type: ETipo.WAIT_CALL})
                                    resolve(1);
                                })
                        }

                    }

                        FactoryCommon.promisesAnid(fn1, fn2, fn3)
                        .then(function(res)
                        {

                        })
                        .catch(error =>{
                        
                            alert(error);
                            console.error(error);
                        });
            
                    }
            break;
            case ETipo.WAIT_CALL:
                funciones = new Map();
                funciones[MsgTipo.CALL_INI] = fnMsgCallIni;
                nextState.dispatcher = function()
                {
                    
                    mServ.readMsgs(funciones)
                }


            break;
            case ETipo.WAIT_CALL_ACCEPT:
                funciones = new Map();
                funciones[MsgTipo.CALL_INI] = fnMsgCallIni;
                funciones[MsgTipo.CALL_CANCEL] = fnMsgCancelCall;
                nextState.userFrom = state.userFrom;
                nextState.campos = {

                    idTimeOut : -1
                }
               
                nextState.ini =  ()  =>{
                    vm.redux.estado.campos.idTimeOut= setTimeout(() =>{

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
                
                nextState.destroy = ()=>{

                    clearTimeout(vm.redux.estado.campos.idTimeOut)
                }
                
            break;
            case ETipo.WAIT_CLASS:
            
                     funciones = new Map();
                    funciones[MsgTipo.CALL_CANCEL] = fnMsgCancelCall;
                    funciones[MsgTipo.GO_CLASS] = fnMsgGoClassCall;
                    nextState.userFrom = state.userFrom;
                   
                    nextState.campos = {

                        idTimeOut : -1
                    }
                    nextState.ini =  ()  =>{
                        vm.redux.estado.campos.idTimeOut= setTimeout(() =>{

                            //si pasa el tiempo y se ejecuta se cancela.

                        
                            vm.sendMsg(vm.redux.estado.userFrom, MsgTipo.CALL_CANCEL);
                            //enviar mensaje de cancelacion
                            //COLGAR
                            //goInit
                            cancelarCall();
                            

                        }, time)
                    };
                    nextState.dispatcher = function()
                    {
                        
                        mServ.readMsgs(funciones)
                    }
                    
                    nextState.destroy = ()=>{

                        clearTimeout(vm.redux.estado.campos.idTimeOut)
                    }
                    
                break;
                
                case ETipo.CLASS:
                funciones = new Map();   
                let sendMsgRtc =(msgRtc :MessageRtc) =>{
                    vm.sendMsg(vm.redux.estado.userFrom, MsgTipo.RTC, msgRtc)
                }
                funciones[MsgTipo.CALL_COLGAR] = fnMsgCancelCall;
                funciones[MsgTipo.RTC] = fnMsgRtc;
                funciones[MsgTipo.CALL_RECONNECT] = fnMsgReconnect;
                funciones[MsgTipo.PING] = fnMsgPing;
                funciones[MsgTipo.PONG] = fnMsgPong;


                nextState.userFrom = state.userFrom;
               
                nextState.campos = {
                    ping : 0,
                    idIntervalPing : -1
                }
                nextState.ini =  ()  =>{


                    vm.rtc =  RtcService.newRtc(vm.localVideoId,vm.remoteVideoId,sendMsgRtc );


                    vm.rtc.startWebRTC();

                    vm.redux.estado.campos.idIntervalPing= setInterval(() =>{

                        //si pasa el tiempo y se ejecuta se cancela.
                        //ping
                        if(vm.redux.estado.campos.ping === vm.maxPing)//time out
                        {
                            //TODO COLGAR
                            cancelarCall();
                        }
                        else{

                            vm.sendMsg(vm.redux.estado.userFrom, MsgTipo.PING, profile.claseId);
                            vm.redux.estado.campos.ping ++;
                        }
                        
                        

                    }, time)
                };



                nextState.dispatcher = function()
                {

                    //MIRAR LOS STATUS DE RTC TODO
                    if(!profile.claseId ||profile.claseId === "")
                        {
                            cancelarCall();
                        }
                    mServ.readMsgs(funciones)
                }
                
                nextState.destroy = ()=>{

                    clearInterval(vm.redux.estado.campos.idIntervalPing);

                    //TODO CERRAR CONEXION (CERRAR CLASE)

                }
                
            break;

            default:
              return state;
            }

            return nextState;
    }


    botonAceptarCall()
    {
        let vm= this;

        /*algoritmo
           

            
            => next stat wait class

        
        */
        vm.sendMsg(vm.redux.estado.userFrom, MsgTipo.CALL_OK);
        vm.redux.nextStatus({ type: ETipo.WAIT_CLASS });



        

    }
    setDisponible(disponible : Boolean, fn ?: () =>void)
    {

        let  p  : Perfil = Meteor.user().profile
        p.disponible= disponible;
        MethodsClass.call("setDisponible", disponible, fn);
    }
    isInClass()
    {
      return this.existePet;
    }
    ngOnInit()
    {

    

        let vm =this;

        this.alumnoSus =  MeteorObservable.subscribe('alumnoCall').subscribe(() => {
            
           // this.rol.setRoles(Roles.findOne().rol);
          // this.clase = Rooms.findOne({profId : Meteor.userId()});
          

           
          });
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
              
                //
            }
    }

    ngOnDestroy()
    {
        let vm =this;
        vm.setDisponible(false)

         if (this.alumnoSus) {
            this.alumnoSus.unsubscribe();
          }
        if (this.roomProf) {
            this.roomProf.unsubscribe();
          }
          if(this.interval)
          {

              clearInterval(this.interval);
          } 
          vm.redux.cerrar();
          this.msgServ.cerrar();
    }

    isValid()
    {
        return this.addForm.valid;
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



