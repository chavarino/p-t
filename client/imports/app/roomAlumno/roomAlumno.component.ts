
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
import {ReduxC, Estado, LogicEstado} from "../services/reduxC";
import { Action } from 'redux';
import { MsgTipo, Message, MessageRtc } from 'imports/models/message';
import { MsgClass, FactoryCommon } from 'imports/functions/commonFunctions';
import { Msg } from 'imports/collections/msg';
import {Perfil, AutoCompleteModel} from "../../../../imports/models/perfil"

import {RtcService} from "../services/rtc.service"
import {Tipo} from "../timeCounter/timeCounter.component"
import {MethodsClass} from "../../../../imports/functions/methodsClass"
import { ConfigTags } from '../categorias/categorias.component';

import { Tracker } from 'meteor/tracker'
import { of } from 'rxjs/internal/observable/of';
import { from } from 'rxjs';
enum ETipo  {
    INIT = 1,
    CLASS = 2,
    SEL_PROFESOR = 3,
    CALLING =4,
    
}

//bug https://stackoverflow.com/questions/53029708/how-to-set-remote-description-for-a-webrtc-caller-in-chrome-without-errors
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
    temp: object;
    profesores : Observable<User[]>;
    redux : ReduxC;
    estadoLogic :  LogicEstado[];
    localVideoId : string;
    remoteVideoId : string;
    maxPing : number;
    userCall : User;

    configTags : ConfigTags = {
        listCat : [],
        listCatBusc : []
    }

    getCategorias(categorias : Array<string>) : ConfigTags
    {
        return { 
            listCat : categorias,
         listCatBusc : []
        }
    }
    constructor( rol : RolesService, private formBuilder: FormBuilder, sanitizer : DomSanitizer,flags : BanderasService)
    {

        super(1, 1, "comun", rol);
        this.temp = {
            tipo :Tipo.TEMP,
            secondsIni : 30,
            mostrar : true
        }
        this.inClass = false;
        this.sanitizer = sanitizer;
        this.flags = flags;
        let vm  = this;
        vm.maxPing = 3;

        vm.localVideoId ="localVideo"
        vm.remoteVideoId ="remoteVideo";

        
        vm.estadoLogic =[
            
            // init : 
            {
                action : ETipo.INIT,
                fromEstado : [null, undefined, ETipo.CLASS,ETipo.CALLING] 
            },
            //            waitCall :
            {
                action : ETipo.SEL_PROFESOR,
                fromEstado : [ETipo.INIT]
            }
            ,
            //            waitCall :
            {
                action : ETipo.CALLING,
                fromEstado : [ETipo.SEL_PROFESOR]
            },
            //waitCallAccept :
            {
                action : ETipo.CLASS,
                fromEstado : [ ETipo.CALLING]
            }
        ]
        
        vm.redux = new ReduxC()
        vm.redux.setReducer( function(state : Estado, action : Action<number>)
        {
            return vm.reducer(state, action);
        });


        vm.redux.nextStatus({ type: ETipo.INIT });
    }
    
    isInClass()
    {
        return this.inClass;
    }

    canActivate() {
        //const party = Parties.findOne(this.partyId);
        return this.canRead() && this.loggedIn();
      }



 



    setModalConfig(prof : User)
    {
        let vm =this;
        let msg =  MethodsClass.msg.modal.confirm;
        this.flags.setModalConfig(MethodsClass.getConfigConfirm(msg.title, msg.bProfCall,function(evento){

            if(evento)
            {
                vm.tryCallProfesor(prof)
            }
            
        } ));
    }

    getUrl()
    {
        if(this.clase.urlVideo === "")
        {
            return this.sanitizer.bypassSecurityTrustResourceUrl("");
        }
        return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${this.clase.urlVideo}?autoplay=1&controls=0&disablekb=1&modestbranding=1&iv_load_policy=3`);
    }


    findProf()
    {

        let vm =this;
       
       /* let input = {
            $and : [
                {_id: { $ne: Meteor.userId() }},
                ...vm.configTags.listCatBusc

            ]
        }
 if(vm.configTags.listCatBusc 
            && vm.configTags.listCatBusc.length>0)
        {
            input["$and"] =vm.configTags.listCatBusc;
            }
           */
        //Meteor.subscribe('allAvalaibleTeacher', vm.configTags.listCatBusc);

        let p = new Promise<User[]>((resolve, reject) => {
      
   
            MethodsClass.call("callAvalaibleTeacher", vm.configTags.listCatBusc, (result)=>{
              resolve(result); 
            })
          });
              
          
     
        vm.profesores =  from(p);
    }
    ngOnInit()
    {

       

        let vm =this;
        
        let fnFind = () => {
          
                vm.findProf();
            //vm.findClass();
        };
        
            
        //this.profesoresSuscription =  MeteorObservable.subscribe('allAvalaibleTeacher').subscribe(fnFind);
      
       
        Tracker.autorun(()=>{
            let p = new Promise<User[]>((resolve, reject) => {
      
   
                MethodsClass.call("callAvalaibleTeacher", vm.configTags.listCatBusc, (result)=>{
                  resolve(result); 
                })
              });
                  
              
         
            vm.profesores =  from(p);
        })
        
        this.roomAlumno =  MeteorObservable.subscribe('getRoomForAlumno').subscribe(() => {
            
                Rooms.find({alumnoId : Meteor.userId(), activo : true}).subscribe((data) => { 
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
                //this.iniClase();
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
        this.redux.cerrar();

        this.msgServ.cerrar();
        
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
    cancelarCall()
    {
        let vm =this;

        vm.sendMsg(vm.getUserCall()._id, MsgTipo.CALL_CANCEL);
        vm.redux.nextStatus({ type: ETipo.INIT });
    }

    colgarCall()
    {
        let vm =this;
        let fnGoInit = ()=> {
            vm.redux.estado.userFrom = null;
            vm.sendMsg(vm.getUserCall()._id, MsgTipo.CALL_COLGAR);
            vm.redux.nextStatus({ type: ETipo.INIT });
        }
        if(vm.clase && vm.clase._id)
        {
                this.terminarClase(false,()=>{
                    vm.clase = null;
                    fnGoInit();
                   
                });
        }
        else{
            fnGoInit();
        }
        
    }
    tryCallProfesor(profesor  : User )
    {   
        let vm =this;
        vm.setUserCall(profesor);
        vm.sendMsg(vm.getUserCall()._id, MsgTipo.CALL_INI);
        vm.redux.nextStatus({ type: ETipo.CALLING });
    }


    isEstadoIni() :boolean
    {
        let vm = this;

        return vm.redux.estado.id === ETipo.INIT;
    }
    isEstadoSelProf() :boolean
    {
        let vm = this;

        return vm.redux.estado.id === ETipo.SEL_PROFESOR;
    }
    isEstadoCalling() :boolean
    {
        let vm = this;

        return vm.redux.estado.id === ETipo.CALLING;
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
        
        let  cancelarCall = ()  =>{

            let fnGoInit = ()=> {
                vm.redux.estado.userFrom = null;
                vm.redux.nextStatus({ type: ETipo.INIT });
            }


            if(vm.clase && vm.clase._id)
            {
                vm.terminarClase(false,()=>{
                    vm.clase = null;
                    
                    fnGoInit();
                });
            }
            else{

                fnGoInit();
            }

           // vm.redux.estado.userFrom = null;
           // vm.redux.nextStatus({ type: ETipo.INIT });
        }
        let fnMsgCancelCall = function(m :Message)
        {
            
            if(vm.getUserCall()._id === m.from)
            {
                
                //cancelamos y vamos a init
                cancelarCall();
            }
        }

        let fnMsgAcceptCall =function(m :Message)
        {
            
            if(vm.getUserCall()._id === m.from)
            {
                let claseId = "";

                
                //crear CLASE
                let fn1 = resolve =>{
                    MethodsClass.call("crearClase", vm.getUserCall()._id, ()=>{

                        resolve(1);
                    })
                }

                let fn2 = resolve =>{
                    
                    claseId = Rooms.findOne({alumnoId : Meteor.userId()})._id;
                    //Asginarse clase
    
                    //enviar mensaje de go clase.
                    vm.sendMsg(m.from, MsgTipo.GO_CLASS, claseId)
    
                    vm.redux.nextStatus({ type: ETipo.CLASS });
                  
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
            

        }


/*
        //go class
        let fnMsgGoClassCall = function(m :Message)
        {
            
            if(vm.redux.estado.userFrom === m.from)
            {
                
               

                profile.claseId = m.cuerpo;
                vm.redux.nextStatus({ type: ETipo.CLASS });

            }
            

        }*/

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
            
                    
                    
                    //esta en una clase?
                    //borramos mensajes
                    let fn1 = resolve =>{

                        vm.borrarMsg(()=>{
                            resolve(1);
                        })
                    }
                    let fn2 = resolve =>{

                        if(perfil.claseId && perfil.claseId !== "")
                        {
                            //si
                            
                            //mandamos mensaje de resconexion
                
                            //TODO
                            let profId : string;
                            
                            let clase = vm.clase
                                if(!vm.clase)
                                {
                                   clase = Rooms.findOne(perfil.claseId)
                                    
                                }

                                if(clase)
                                {
                                    profId = clase.profId;
                                    vm.sendMsg(profId, MsgTipo.RECONNECT);
                    
                                    vm.redux.nextStatus({ type: ETipo.CLASS})
                                
                                    resolve(1);
                                }
                                else{
                                    vm.terminarClase(false,()=>{
    
                                        vm.redux.nextStatus({ type: ETipo.SEL_PROFESOR})
                                        resolve(1);
                                    });
                                }
                            
                
                        }
                        else{
                                //no está en clase
                                //ponemos la disponibilidad a true;
                
                                
                                vm.redux.nextStatus({ type: ETipo.SEL_PROFESOR})
                        }

                        resolve(1)
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
            break;
            case ETipo.SEL_PROFESOR:
                
                nextState.ini= function()
                {
                    
                
        
                }
            break;
            case ETipo.CALLING:
                 funciones = new Map();
                funciones[MsgTipo.CALL_CANCEL] = fnMsgCancelCall;
                funciones[MsgTipo.CALL_OK] = fnMsgAcceptCall;
                
                nextState.userFrom = state.userFrom;
                nextState.campos = {

                    idTimeOut : -1
                }
               
                nextState.ini =  ()  =>{
                    vm.redux.estado.campos.idTimeOut= setTimeout(() =>{

                        //si pasa el tiempo y se ejecuta se cancela.

                       
                        vm.sendMsg(vm.getUserCall()._id, MsgTipo.CALL_CANCEL);
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
            
            case ETipo.CLASS:
                
            let sendMsgRtc =(msgRtc :MessageRtc) =>{
                vm.sendMsg(vm.getUserCall()._id, MsgTipo.RTC, msgRtc)
            }
            funciones = new Map();
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
                if(vm.redux.estado.campos.ping === vm.maxPing)//time out
                {
                    //TODO COLGAR
                    cancelarCall();
                }
                else{

                    vm.sendMsg(vm.getUserCall()._id, MsgTipo.PING, profile.claseId);
                    vm.redux.estado.campos.ping ++;
                }
            }

            nextState.ini =  ()  =>{

                vm.rtc =  RtcService.newRtc(vm.localVideoId,vm.remoteVideoId,sendMsgRtc, false, ()=>{
                    vm.empezarClase();
                }  );

                setTimeout(() => {
                    
                    vm.rtc.startWebRTC();
                   
                }, 500);

                vm.redux.estado.campos.idIntervalPing= setInterval(fnInterval, time)
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

                vm.rtc.close();
                clearInterval(vm.redux.estado.campos.idIntervalPing);

               

            }
            
            break;
            default:
              return state;
            }

            return nextState;
    }
 //Meteor.user().profile
  
}
