
import { Meteor } from 'meteor/meteor';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, DoCheck, HostListener } from '@angular/core';
import  {RolesService} from "../services/roles.service";
import {RtcService, DevicesSelected} from "../services/rtc.service"

import {Room} from "../../../../imports/models/room"
import {Perfil, PerfClase} from "../../../../imports/models/perfil"
import { Rooms } from '../../../../imports/collections/room';
import { FormGroup, FormBuilder,Validators,FormControl } from '@angular/forms';

import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs/Subscription';

import {ReduxC, Estado, LogicEstado} from "../services/reduxC";
import { Action } from 'redux';
import { MsgTipo, Message, MessageRtc } from 'imports/models/message';
import { MsgClass,FactoryCommon, Log, EloIntefaceModel } from 'imports/functions/commonFunctions';

import {MethodsClass} from "../../../../imports/functions/methodsClass"

import { Users } from 'imports/collections/users';
import { ConfigTags } from '../categorias/categorias.component';
import { RoomClass, ETipo } from 'imports/clases/room.class';
import { Router } from '@angular/router';
import { ModulesEnum } from 'imports/models/enums';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { isDefined } from '@angular/compiler/src/util';
import { SoundClass } from 'imports/clases/sound';
import { ModalDevSelectComponent } from '../modalDevSelect/modalDevSelect.component';




@Component({
  selector: 'roomP',
  templateUrl: 'roomProf.html',
  styleUrls: ['roomProf.scss']
})
export class RoomProfComponent extends RoomClass  implements OnInit, OnDestroy , DoCheck {

    
    clase : Room
    roomProf :Subscription;
    alumnoSus :Subscription;
    addForm: FormGroup;
    
    interval : any;
    
    

  
   
    //audios : Map<string, AudioC>;
    perfil : Perfil;
    perfClase : PerfClase ;
    configTags : ConfigTags = {
        listCat : [],
        listCatBusc : []
    }
    userSuscripcion: Subscription;
    tonoLlamada: SoundClass;
    numberAlumnosConect: number;
    tIntNumAlumnsConnected : number;
    tonoBip: SoundClass;
   
    constructor( rol : RolesService,  rutas : Router , private formBuilder: FormBuilder, cd :ChangeDetectorRef, modalService: NgbModal )
    {
        super( "Prof", rol, cd, rutas, modalService);
        rol.setModulo(ModulesEnum.CLASE_PRFSOR);
        this.tIntNumAlumnsConnected = 5000;
        this.numberAlumnosConect = 0;
        this.tonoLlamada = SoundClass.crearTonoLlamada("/sounds/ring.mp3");
        this.tonoBip = SoundClass.crearBip("/sounds/bipConectado.mp3");
        let vm =this;
        vm.perfClase = {
            categorias : [],
            clases : [],
            eloModel : {} as EloIntefaceModel,
            nombre : "",
            ultElo : 0,
            ultPrecio : 0,
            
        }
        this.addForm = vm.addForm = new FormGroup({
            'ultPrecio': new FormControl(vm.perfClase.ultPrecio, [
            Validators.required,
            Validators.nullValidator
            
            ])
            
        });
       
       
        
        

        
    
        vm.estadoLogic =[
            
            // init : 
            {
                action : ETipo.INIT,
                fromEstado : [null, undefined, ETipo.WAIT_CALL_ACCEPT,ETipo.WAIT_CLASS, ETipo.CLASS] 
            },
            // pre class // config  : 
            {
                action : ETipo.PRE_CLASS,
                fromEstado : [ETipo.INIT, ETipo.WAIT_CALL] 
            },
            //            waitCall :
            {
                action : ETipo.WAIT_CALL,
                fromEstado : [ETipo.PRE_CLASS]
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
                fromEstado : [ ETipo.WAIT_CLASS, ETipo.INIT]
            }
        ]
        
        
        
     
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
        
        
        

        // setTimeout()
        vm.redux.setReducer( function(state : Estado, action : Action<number>)
        {
            return vm.reducer(state, action);
        });
        
        

        
      
    }

    ngDoCheck() {
    
       // console.log("do check " + JSON.stringify(this.redux.estado));

    }

  


    async openModalDeviceIOConfig()
    {


        let result : DevicesSelected = await this.modalService.open(ModalDevSelectComponent, {size: 'lg',ariaLabelledBy: 'modal-basic-title'}).result;

        if(result)
        {

            RtcService.setSelectedDevices(result, this.rtc);

            //si está definido rtc => cambiar configuracion
            
        }
    }
    
    isDisabledPrecio()
    {
        return true;
    }
    
    private reducer (state : Estado = {}, action : Action<number>) : Estado
    {
        let vm =this;
        let nextState :Estado = {
            id : action.type,
            campos : {

            }
        }
       
        let  idAux;
        let mServ : MsgClass =  this.msgServ;
        let funciones : Map<Number, (m :Message)=> void > ;
        
        let fnMsgCallIni = function(m :Message)
        {
            let profile : Perfil=  Meteor.user().profile;
            if(profile.disponible)
            {
                
                let fn1 = resolve =>{
                    
                    vm.setDisponible(false, ()=>{
    
                        
                            resolve(1)
                        
                    });
                }

                let fn2 = resolve =>{
                    
                    vm.redux.estado.userFrom = m.from;
                    

                    MethodsClass.call("findUser", vm.redux.estado.userFrom, (user)=>{

                        if(user)
                        {
                            vm.setUserCall(user);
                            vm.redux.nextStatus({ type: ETipo.WAIT_CALL_ACCEPT});
                            resolve(1)
                        }
                        else {
                            vm.setDisponible(true);
                            resolve(1)
                        }


                    });
                   
                    
                }
                FactoryCommon.promisesAnid(fn1, fn2)
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


            let fnGoInit = ()=> {
                vm.setUserCall(null);
                
                vm.redux.nextStatus({ type: ETipo.INIT });
            }

            if(vm.clase && vm.clase._id)
            {
                //vm.setDisponible(false)
                vm.terminarClase(true,()=>{
                    vm.clase = null;
                    
                    fnGoInit();
                });
            }
            else{

                fnGoInit();
            }
        }
        
        let fnMsgCancelCall = function(m :Message)
        {
            
            if(vm.getUserCall()._id === m.from)
            {
                
                //cancelamos y vamos a init
                cancelarCall();

                

            }
            

        }
        //go class
        let fnMsgGoClassCall = function(m :Message)
        {
            
            if(vm.getUserCall()._id === m.from)
            {
                
               
                let profile : Perfil=  Meteor.user().profile;
                profile.claseId = m.cuerpo;
                vm.redux.nextStatus({ type: ETipo.CLASS });

            }
            

        }

        //recibe MSG PING 
        let fnMsgPing = function(m :Message)
        {
            
            if(vm.getUserCall()._id === m.from)
            {
                
                mServ.sendMsg(m.from,MsgTipo.PONG)
            }
            

        }
        //recibe MSG PING 
        let fnMsgPong = function(m :Message)
        {
            
            if(vm.getUserCall()._id === m.from)
            {
                
                vm.redux.estado.campos.ping =0;
            }
            

        }

        let fnMsgRtc = function(m :Message)
        {
            
            if(vm.getUserCall()._id === m.from)
            {
                //en el cuerpo lleva el mensaje RTC
                vm.rtc.getMsg(m.cuerpo);
            }
            

        }

        let fnMsgReconnect = function(m :Message)
        {
            
            if(vm.getUserCall()._id === m.from)
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

                                    
                                    
                                    MethodsClass.call("findUser", idAlumno, (user)=>{
                                        
                                        if(user)
                                        {
                                            vm.setUserCall(user);
                                            vm.sendMsg(idAlumno, MsgTipo.RECONNECT);
                                            resolve(ETipo.CLASS);
                                            
                                        }
                                        else {
                                            vm.terminarClase(true,()=>{
    
                                                resolve(ETipo.PRE_CLASS);
                                            });
                                        }
                
                
                                    });
                                    
                                }
                                else{
                                    vm.terminarClase(true,()=>{
    
                                        resolve(ETipo.PRE_CLASS);
                                    });
                                }
                                
                                
                        }
                        else{
                                //no está en clase
                                //ponemos la disponibilidad a true;
                
                              
                                resolve(ETipo.PRE_CLASS);
                               // vm.setDisponible(true, ()=>{ })
                        }

                    }

                        FactoryCommon.promisesAnid(fn1, fn2, fn3)
                        .then(function(res)
                        {
                            vm.redux.nextStatus( { type: res[res.length-1]} )
                            
                        })
                        .catch(error =>{
                        
                            alert(error);
                            console.error(error);
                        });
            
                    }
            break;
            case ETipo.PRE_CLASS:
                
                nextState.ini= function()
                {
                    //
                    vm.perfClase = Meteor.user().profile.perfClase; 
                    
                    vm.perfil = Meteor.user().profile;
                }

                nextState.destroy = ()=>{
                  
                    
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
                    //vm.audios["call"].play();
                    this.tonoLlamada.play();
                    vm.redux.estado.campos.idTimeOut= setTimeout(() =>{

                        //si pasa el tiempo y se ejecuta se cancela.

                       
                        vm.sendMsg(vm.getUserCall()._id, MsgTipo.CALL_CANCEL);
                        //enviar mensaje de cancelacion

                        //goInit
                        cancelarCall();
                        

                    }, vm.timeWaitCall)
                };
                nextState.dispatcher = function()
                {
                    
                    mServ.readMsgs(funciones)
                }
                
                nextState.destroy = ()=>{
                    //vm.audios["call"].stop()
                    this.tonoLlamada.stop();
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

                        
                            vm.sendMsg(vm.getUserCall()._id, MsgTipo.CALL_CANCEL);
                            //enviar mensaje de cancelacion
                            //COLGAR
                            //goInit
                            cancelarCall();
                            

                        }, vm.timeWaitCall)
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
                    vm.sendMsg(vm.getUserCall()._id, MsgTipo.RTC, msgRtc)
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

                let fnInterval = () =>{

                    //si pasa el tiempo y se ejecuta se cancela.
                    //ping
                    if(vm.rtc.isConnectionRelayType && vm.clase.isConnectionRelayType !== vm.rtc.isConnectionRelayType)
                    {
                            vm.clase.isConnectionRelayType = vm.rtc.isConnectionRelayType;
                    }


                    if(vm.redux.estado.campos.ping === vm.maxPing)//time out
                    {
                        //TODO COLGAR
                        cancelarCall();
                    }
                    else{
                        let profile : Perfil=  Meteor.user().profile;
                        vm.sendMsg(vm.getUserCall()._id, MsgTipo.PING, profile.claseId);
                        vm.redux.estado.campos.ping ++;
                    }
                }

                nextState.ini =  ()  =>{

                    vm.rtc =  RtcService.newRtc(vm.localVideoId,vm.remoteVideoId,sendMsgRtc, true, ()=>{
                        vm.empezarClase();

                        
                    } );

                    setTimeout(() => {
                        
                        try {
                            vm.rtc.startWebRTC();
                            
                        } catch (error) {
                            alert("La aplicación necesita permisos de video y audio para poder ser usada. Por favor acepte los permisos para usarla.")
                            console.log("Error startWebRTC : " +error)
                            cancelarCall();
                        }
                        
                    }, 500);

                    vm.redux.estado.campos.idIntervalPing= setInterval(fnInterval, vm.timePing)
                };



                nextState.dispatcher = function()
                {

                    //MIRAR LOS STATUS DE RTC TODO
                   /* if(!profile.claseId ||profile.claseId === "")
                        {
                            cancelarCall();
                        }*/
                    mServ.readMsgs(funciones)
                }
                
                nextState.destroy = ()=>{

                    clearInterval(vm.redux.estado.campos.idIntervalPing);
                    
                    vm.rtc.close();
                    vm.rtc = undefined;
                }
                
            break;

            default:
              return state;
            }

            return nextState;
    }

    cancelarEspera()
    {
        let vm =this;
        vm.setDisponible(false, ()=>{
            vm.redux.nextStatus({ type: ETipo.PRE_CLASS });
            
        })

    }
    botonAceptarCall()
    {
        let vm= this;

        /*algoritmo
           

            
            => next stat wait class

        
        */
        vm.sendMsg(vm.getUserCall()._id, MsgTipo.CALL_OK);
        vm.redux.nextStatus({ type: ETipo.WAIT_CLASS });



        

    }
    setDisponible(disponible : Boolean, fn ?: () =>void)
    {

        let  p  : Perfil = Meteor.user().profile
        p.disponible= disponible;
        MethodsClass.call("setDisponible", disponible, fn);
    }
 
    ngOnInit()
    {

    

        let vm =this;
        this.rol.fnSetAlive = ()=>{
                

            let  p  : Perfil = Meteor.user().profile
            if(!p.disponible &&  vm.isEstadoWaitCall())
            {
                vm.setDisponible(true);  
              }
            return true;
        }
        

        /*this.numberAlumnosConect =  MeteorObservable.subscribe('usersConected').subscribe((value) => {

            console.log("conectados " + JSON.stringify(value))
            Users.find({_id:Meteor.userId()}).subscribe((data)=>{

                if(data[0])
                {
                    let p : Perfil = data[0].profile;
                    let precio = this.perfClase ? this.perfClase.ultPrecio : p.perfClase.ultPrecio;
                    this.perfClase = p.perfClase;
                    this.perfClase.ultPrecio = isDefined(precio) && precio >0 ? precio : 0  ;
                }
                else{
                  //this.rol.setRoles(data[0].rol);
        
                }
              })
           // this.rol.setRoles(Roles.findOne().rol);

          });*/

        this.userSuscripcion =  MeteorObservable.subscribe('usersProfile').subscribe(() => {

            Users.find({_id:Meteor.userId()}).subscribe((data)=>{

                if(data[0])
                {
                    let p : Perfil = data[0].profile;
                    let precio = this.perfClase ? this.perfClase.ultPrecio : p.perfClase.ultPrecio;
                    this.perfClase = p.perfClase;
                    this.perfClase.ultPrecio = isDefined(precio) && precio >0 ? precio : 0  ;
                }
                else{
                  //this.rol.setRoles(data[0].rol);
        
                }
              })
           // this.rol.setRoles(Roles.findOne().rol);

          });
    
        this.roomProf =  MeteorObservable.subscribe('getRoomForProf').subscribe(() => {
            
           // this.rol.setRoles(Roles.findOne().rol);
          // this.clase = Rooms.findOne({profId : Meteor.userId()});
          

           Rooms.find({profId : Meteor.userId(), activo : true}).subscribe((data) => { 
                    vm.clase = data[0];
                    if(vm.clase && vm.clase.comenzado)
                    {
                        MethodsClass.call("getDiffTimeInSeconds", vm.clase.fechaCom,(result)=>{
                            vm.secondsIniClass = result;

                        })
                    }
                    else{
                        vm.secondsIniClass = 0; 
                    }
                    //vm.findClass();
            });
          });
          vm.intervalUpdAction(()=>{
              MethodsClass.call("getNumAlumnosConectados",(result: number)=>{
                            if(vm.numberAlumnosConect<result)
                            {
                                this.tonoBip.play();
                            }
                            vm.numberAlumnosConect = result;

                        })
          }, this.tIntNumAlumnsConnected)

          vm.iniRoom()
    }



    ngOnDestroy()
    {
        let vm =this;
        this.rol.fnSetAlive = undefined;
        
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

          if (this.userSuscripcion) {
            this.userSuscripcion.unsubscribe();
          }
          vm.intervalUpdAction()
          this.tonoLlamada.destroy();
    }

    isValid()
    {
        return this.addForm && this.addForm.valid;
    }

    
    async save()
    {
        let vm=this;
        //this.addForm.
       // this.perfil.perfClase.categorias = this.configTags.listCat;
        if (this.addForm.valid) {
            this.l.log("save() ini")
           
            let perfil : Perfil = Meteor.user().profile;

            perfil.perfClase = vm.perfClase;
            perfil.disponible = true;//nos ponemos disponibles.
            try{
               
                
                MethodsClass.call("savePerfil", perfil, ()=>
                {
                    this.l.log("save() savePrecio OK")
                    this.l.log("save() setDisponible OK")
                    vm.redux.nextStatus({ type: ETipo.WAIT_CALL });
                    
                });

               
                //await p2;

            }
            catch(e)
            {
                alert("ERROR al guardar")
                this.l.log("save() error")
            }

            
        }
       else  {
        alert("Invalido")
        }
    }
 

    colgarCall()
    {
        let vm =this;

        let claseId = Meteor.user().profile.claseId
        this.l.log("colgarCall clase=" +claseId );
        let fnGoInit = ()=> {

            this.l.log("colgarCall fnGoInit COLGAR");
            vm.estado.userFrom = null;
            vm.sendMsg(vm.getUserCall()._id, MsgTipo.CALL_COLGAR);


            if(claseId)
            {

                this.l.log("colgarCall fnGoInit openModalPuntuacion");
                vm.redux.nextStatus({ type: ETipo.INIT });
              
            

                }
            
            
        }
        
        if(vm.clase && vm.clase._id)
        {

            this.l.log("colgarCall terminarClase");
                this.terminarClase(false,()=>{
                    vm.clase = null;
                    fnGoInit();
                   
                });
        }
        else{
            fnGoInit();
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



