
import { Component, OnInit, OnDestroy, ChangeDetectorRef, DoCheck } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import  {RolesService} from "../services/roles.service";
import  {BanderasService} from "../services/flags.service";

import { Room } from '../../../../imports/models/room';
import { Rooms } from '../../../../imports/collections/room';
import { Observable } from 'rxjs/Observable';
import { MeteorObservable } from 'meteor-rxjs';

import { FormGroup, FormBuilder,Validators,FormControl } from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import { User } from 'imports/models/User';
import { Users } from 'imports/collections/users';
import { Estado} from "../services/reduxC";
import { Action } from 'redux';
import { MsgTipo, Message, MessageRtc } from 'imports/models/message';
import { MsgClass, FactoryCommon, Log } from 'imports/functions/commonFunctions';

import {Perfil} from "../../../../imports/models/perfil"

import {RtcService} from "../services/rtc.service"

import {MethodsClass} from "../../../../imports/functions/methodsClass"
import { ConfigTags } from '../categorias/categorias.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalKpm } from '../modalKpm/modaKpm.component';
import { Score } from 'imports/models/kpm';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomClass, ETipo } from 'imports/clases/room.class';



//bug https://stackoverflow.com/questions/53029708/how-to-set-remote-description-for-a-webrtc-caller-in-chrome-without-errors
@Component({
  selector: 'roomA',
  templateUrl: 'roomAlumno.html',
  styleUrls: ['roomAlumno.scss']
})
export class RoomAlumnoComponent extends RoomClass implements OnInit, OnDestroy, DoCheck{
    selectedTag: string;
  
    clase : Room
    roomAlumno :Subscription;
    addForm: FormGroup;
  
    sanitizer : DomSanitizer;
    ///todos: Observable<Room>;
    flags : BanderasService;
    profesoresSuscription:  Subscription;

    profesores : Observable<User[]>;
    
    


    userCall : User;

    configTags : ConfigTags = {
        listCat : [],
        listCatBusc : []
    }
  
    
 
    constructor( private modalService: NgbModal,  rutas : Router ,private route: ActivatedRoute , rol : RolesService, private formBuilder: FormBuilder, sanitizer : DomSanitizer,flags : BanderasService, cd :ChangeDetectorRef)
    {

        super("alumno", rol, cd, rutas);

        
        
       // 
        
       
        this.sanitizer = sanitizer;
        this.flags = flags;
        let vm  = this;
      

       

        this.l.log("constructor  inicializacion")
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
        
        

        vm.redux.setReducer( function(state : Estado, action : Action<number>)
        {
            return vm.reducer(state, action);
        });
        this.l.log("constructor  reducer")
        
        
        /*
        RtcService.getPermisos((res)=>{

            if(res)
            {
                //obtiene permisos => iniciamos

                

            }
            else{
                alert("La aplicación necesita permisos de video y audio para poder ser usada. Por favor acepte los permisos para usarla.")
                this.rutas.navigate(["inicio"])
            }
        })

        */
    }
    

   
       
     

    getCategorias(categorias : Array<string>) : ConfigTags
    {
        return { 
            listCat : categorias,
         listCatBusc : []
        }
    }
  




      
      async openModalPuntuacion(claseId : string, fn ?: () => void) {

        try {

            this.l.log("openModalPuntuacion  modalService ModalKpm...")
            
            let result : Score = await this.modalService.open(ModalKpm, {size: 'lg',ariaLabelledBy: 'modal-basic-title'}).result;

            if(!result.updated)
            {
                throw "No ha contestado a ninguna pregunta"
            }
            alert("¡¡Muchas gracias por colaborar a un servicio mejor!!");
            this.l.log("openModalPuntuacion  modalService ModalKpm...OK")

            this.l.log("openModalPuntuacion  call(saveScoreFromAlumno");


            MethodsClass.call("saveScoreFromAlumno", claseId, result);
            
        } catch (error) {
            alert("¡¡Muchas gracias!!")
            this.l.log("openModalPuntuacion  " +error);
        }
        if(fn)
            {
                fn();
            }
        
        /*.then((result) => {
          //this.closeResult = `Closed with: ${result}`;
         
        }, (reason) => {
          //this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        })*/
        
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
       
        let input = {
            $and : [
                {_id: { $ne: vm.loggedIn() ? Meteor.userId() : "-" }},
                ...vm.configTags.listCatBusc

            ]
        }

        this.l.log("findProf input" + JSON.stringify(input));
        /*
 if(vm.configTags.listCatBusc 
            && vm.configTags.listCatBusc.length>0)
        {
            input["$and"] =vm.configTags.listCatBusc;
            }
           */
        //Meteor.subscribe('allAvalaibleTeacher', vm.configTags.listCatBusc);

        /*   let p = new Promise<User[]>((resolve, reject) => {
      
            
         MethodsClass.call("callAvalaibleTeacher", vm.configTags.listCatBusc, (result)=>{
              resolve(result); 
            })


          });*/
              
          
     
        vm.profesores =  Users.find(input,{ sort: [['profile.perfClase.ultElo', 'desc'], ['profile.name', 'asc']] });

        this.l.log("findProf find OOK");
    }

    onSelectTag(e :string)
    {
        this.selectedTag = e;
    }
    ngOnInit()
    {

        this.l.log("ngOnInit INi");

        let vm =this;
        
        let categorias  = this.route.snapshot.paramMap.get('categorias');
        
        if(categorias)
        {
            this.configTags.listCat = categorias.split(",")

        }
        let fnFind = () => {
            this.l.log("ngOnInit  fnFind"); 
                vm.findProf();
            //vm.findClass();
        };
        
        this.l.log("ngOnInit suscribe allAvalaibleTeacher"); 
        this.profesoresSuscription =  MeteorObservable.subscribe('allAvalaibleTeacher').subscribe(fnFind);
      
       
   
        this.l.log("ngOnInit suscribe getRoomForAlumno"); 
        if(vm.loggedIn())
        {
            this.roomAlumno =  MeteorObservable.subscribe('getRoomForAlumno').subscribe(() => {
                
    
                this.l.log("ngOnInit suscribe  Rooms.find()"); 
                    Rooms.find({alumnoId : Meteor.userId(), activo : true}).subscribe((data) => { 
                        vm.clase = data[0];
    
    
                        if(vm.clase && vm.clase.comenzado)
                        {
                            
                        this.l.log("ngOnInit subscribe clase " + JSON.stringify(vm.clase) );
                            
                        this.l.log("ngOnInit getDiffTimeInSeconds...");
                            MethodsClass.call("getDiffTimeInSeconds", vm.clase.fechaCom,(result)=>{
                                vm.secondsIniClass = result;
                                this.l.log("ngOnInit getDiffTimeInSeconds... ok sec:" +vm.secondsIniClass );
                            })
                        }
                        else{
                            vm.secondsIniClass = 0; 
                        }
                });
    
    
                
               // this.rol.setRoles(Roles.findOne().rol);
              
              });
            
        }

          vm.iniRoom()
          vm.intervalUpdAction()
    }

    
    
    clickBotonLlamarNoLogueado()
    {
        alert("NO logueado")
    }

    clickBotonLlamarLogueadoNoSuscrito()
    {
        alert("logueado No suscrito")
    }
    mostrarBotonLlamarNoLogueado(): boolean
    {
        return !this.loggedIn();
    }

    mostrarBotonLlamarLogueadoNoSuscrito(): boolean
    {
        return this.loggedIn() && false;
    }
    mostrarBotonLlamarLogueadoSuscrito(): boolean
    {
        return this.loggedIn() && true;
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
        this.intervalUpdAction()
        
    }

    isValid()
    {
        return this.addForm.valid;
    }
    
 

 

    cancelarCall()
    {
        let vm =this;
        this.l.log("cancelarCall CALL_CANCEL" );
        vm.sendMsg(vm.getUserCall()._id, MsgTipo.CALL_CANCEL);

        this.l.log("cancelarCall nextStatus INIT" );
        vm.redux.nextStatus({ type: ETipo.INIT });
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
                    vm.openModalPuntuacion(claseId,()=>{
                        vm.redux.nextStatus({ type: ETipo.INIT });
                        this.l.log("colgarCall openModalPuntuacion res next INIT");
                    })

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
    tryCallProfesor(profesor  : User )
    {   
        let vm =this;
        this.l.log("colgarCall tryCallProfesor profsor " + JSON.stringify(profesor));
        vm.setUserCall(profesor);

        this.l.log("colgarCall tryCallProfesor");
        vm.sendMsg(vm.getUserCall()._id, MsgTipo.CALL_INI);

        this.l.log("colgarCall next CALLING");
        vm.redux.nextStatus({ type: ETipo.CALLING });
    }

    private reducer (state : Estado = {}, action : Action<number>) : Estado
    {

        this.l.log("reducer");
        let vm =this;
        let nextState :Estado = {
            id : action.type,
            campos : {

            }
        }
        
        let  idAux;
        let mServ : MsgClass =  this.msgServ;
        let funciones : Map<Number, (m :Message)=> void > ;
        
        
        let  cancelarCall = ()  =>{
            this.l.log("cancelarCall");
            let fnGoInit = ()=> {
                vm.estado.userFrom = null;
                vm.redux.nextStatus({ type: ETipo.INIT });
            }


            if(vm.clase && vm.clase._id)
            {

                this.l.log("cancelarCall terminarClase");
                vm.terminarClase(false,()=>{
                    vm.clase = null;
                    
                    fnGoInit();
                });
            }
            else{

                fnGoInit();
            }

           // vm.estado.userFrom = null;
           // vm.redux.nextStatus({ type: ETipo.INIT });
        }
        let fnMsgCancelCall = function(m :Message)
        {
            this.l.log("cancelarCall fnMsgCancelCall");
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
            
            if(vm.estado.userFrom === m.from)
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
                
                vm.estado.campos.ping =0;
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
                vm.estado.campos.ping = 0;
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
                   
            
                    if(!vm.loggedIn() )
                    {
                        vm.redux.nextStatus({ type: ETipo.SEL_PROFESOR})
                    }
                    
                    //esta en una clase?
                    //borramos mensajes
                    let fn1 = resolve =>{

                        vm.borrarMsg(()=>{
                            resolve(1);
                        })
                    }
                    let fn2 = resolve =>{
                        let perfil : Perfil =  vm.loggedIn() ? Meteor.user().profile : undefined;
                        if(perfil && perfil.claseId && perfil.claseId !== "")
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
                    vm.estado.campos.idTimeOut= setTimeout(() =>{

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

                    clearTimeout(vm.estado.campos.idTimeOut)
                }


            break;
            
            case ETipo.CLASS:
                
            let sendMsgRtc =(msgRtc :MessageRtc) =>{
                vm.sendMsg(vm.getUserCall()._id, MsgTipo.RTC, msgRtc)
            }
            funciones = new Map();
            
            funciones[MsgTipo.CALL_COLGAR] = (msg :Message)=>{
                let claseId = Meteor.user().profile.claseId
                fnMsgCancelCall(msg);
                if(claseId)
                {
                    vm.openModalPuntuacion(claseId)

                }
            };
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
                if(vm.estado.campos.ping === vm.maxPing)//time out
                {
                    //TODO COLGAR
                    cancelarCall();
                }
                else{
                    let profile : Perfil=  Meteor.user().profile;
                    vm.sendMsg(vm.getUserCall()._id, MsgTipo.PING, profile.claseId);
                    vm.estado.campos.ping ++;
                }
            }

            nextState.ini =  ()  =>{

                vm.rtc =  RtcService.newRtc(vm.localVideoId,vm.remoteVideoId,sendMsgRtc, false, ()=>{
                    vm.empezarClase();
                }  );

                setTimeout(() => {
                    try {
                        vm.rtc.startWebRTC();
                        
                    } catch (error) {
                        alert("La aplicación necesita permisos de video y audio para poder ser usada. Por favor acepte los permisos para usarla.")
                        console.log("Error startWebRTC : " +error)
                        cancelarCall();
                    }
                   
                }, 500);

                vm.estado.campos.idIntervalPing= setInterval(fnInterval, vm.timePing)
            };


            nextState.dispatcher = function()
            {
                let profile : Perfil=  Meteor.user().profile;
                //MIRAR LOS STATUS DE RTC TODO
                if(!profile.claseId ||profile.claseId === "")
                    {
                        cancelarCall();
                    }
                mServ.readMsgs(funciones)
            }
            
            nextState.destroy = ()=>{

                vm.rtc.close();
                clearInterval(vm.estado.campos.idIntervalPing);

               

            }
            
            break;
            default:
              return state;
            }

            return nextState;
    }
 //Meteor.user().profile
 ngDoCheck() {
    
    //console.log("do check " + JSON.stringify(this.redux.estado));

}
}
