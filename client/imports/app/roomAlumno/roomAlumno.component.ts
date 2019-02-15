
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
import {Perfil} from "../../../../imports/models/perfil"
import {Error} from "./../../../../imports/functions/errors"
import {RtcService} from "../services/rtc.service"
import { resolve } from 'dns';
enum ETipo  {
    INIT = 1,
    CLASS = 2,
    SEL_PROFESOR = 3,
    CALLING =4,
    
}


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
    redux : ReduxC;
    estadoLogic :  LogicEstado[];
    localVideoId : string;
    remoteVideoId : string;
    maxPing : number;
    profCall : User;
    constructor( rol : RolesService, private formBuilder: FormBuilder, sanitizer : DomSanitizer,flags : BanderasService)
    {

        super(1, 1, "comun", rol);
        
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



    setModalConfig(prof : User)
    {
        let vm =this;
        this.flags.setModalConfig({config: {title: "Confirmacion", msg : "Quieres llamar  aeste profesor?", tipo : 1}, fn : function(evento){

            if(evento)
            {
                vm.tryCallProfesor(prof)
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

        vm.sendMsg(vm.profCall._id, MsgTipo.CALL_CANCEL);
        vm.redux.nextStatus({ type: ETipo.INIT });
    }

    colgarCall()
    {
        let vm =this;

        vm.sendMsg(vm.redux.estado.userFrom, MsgTipo.CALL_COLGAR);
        vm.redux.nextStatus({ type: ETipo.INIT });
    }
    tryCallProfesor(profesor  : User )
    {   
        let vm =this;
        vm.profCall = profesor;
        vm.sendMsg(vm.profCall._id, MsgTipo.CALL_INI);
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
            vm.redux.estado.userFrom = null;
            vm.redux.nextStatus({ type: ETipo.INIT });
        }
        let fnMsgCancelCall = function(m :Message)
        {
            
            if(vm.profCall._id === m.from)
            {
                
                //cancelamos y vamos a init
                cancelarCall();
            }
        }

        let fnMsgAcceptCall =function(m :Message)
        {
            
            if(vm.profCall._id === m.from)
            {
                let claseId = "";

                
                //crear CLASE
                let fn1 = resolve =>{

                    Meteor.call("crearClase",vm.profCall._id, (error) => {
                        Error.frontHandle(error,()=>{

                            resolve(1);
                        });
                        
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
                            let idAlumno :string;
                                if(vm.clase && vm.clase.profId)
                                {
                                    profId =  vm.clase.profId;
                                }
                                else{
                                    vm.clase =  Rooms.findOne(perfil.claseId);
                                    idAlumno = vm.clase.alumnoId;
                                }
                                
                                vm.sendMsg(idAlumno, MsgTipo.RECONNECT);
                
                                vm.redux.nextStatus({ type: ETipo.CLASS})
                            
                
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

                       
                        vm.sendMsg(vm.profCall._id, MsgTipo.CALL_CANCEL);
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
                vm.sendMsg(vm.redux.estado.userFrom, MsgTipo.RTC, msgRtc)
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
 //Meteor.user().profile
  
}
