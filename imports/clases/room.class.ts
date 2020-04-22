import { Generic } from './generic.class';
import { RolesService } from 'client/imports/app/services/roles.service';


import { MethodsClass } from 'imports/functions/methodsClass';
import { User } from 'imports/models/User';
import { Estado, ReduxC, LogicEstado } from 'client/imports/app/services/reduxC';
import { RtcService, DevicesSelected } from 'client/imports/app/services/rtc.service';
import { isUndefined } from 'util';

import { ChangeDetectorRef } from '@angular/core';

import { Router } from '@angular/router';
import { Tipo } from 'imports/models/enums';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';





/*enum ETipo  {
    INIT = 1,
    CLASS = 2,
    
    
}*/

export enum ETipo  {
    INIT = 1,
    CLASS = 2,
    WAIT_CALL = 3,
    WAIT_CALL_ACCEPT =4,
    WAIT_CLASS=5,
    PRE_CLASS = 6,
    SEL_PROFESOR = 7,
    CALLING =8
}


export class RoomClass extends Generic {
    cd: ChangeDetectorRef;
    timePing : number;
    timeWaitCall : number;
    maxPing: number;
    //RtcService
     temp: object;
     rtc : RtcService;
    userCall : User;
    secondsIniClass : number
    localVideoId : string;
    remoteVideoId : string;
    estado: Estado = {

        id:-1
    }
    intervalUpd: any;
    redux : ReduxC;

    estadoLogic :  LogicEstado[];
    constructor(modulo:string, rol : RolesService, cd :ChangeDetectorRef, private rutas : Router, public modalService: NgbModal)
    {
        super(1, 1, modulo, rol)
        let vm=this;
        vm.maxPing = 3; //numero maximo de pings, empezando en 0 son 4.
        vm.timePing = 6000; // tiempo en lanzar cada ping.
        vm.timeWaitCall = 20000; // tiempo entre esperas maximo 20 segundos
        this.cd = cd ;
        this.rutas =rutas;
        this.temp = {
            tipo :Tipo.TEMP,
            secondsIni : 20, //  segundos de los temporizadores visibles hacia atras de las clases y esperas.
            mostrar : true
        }
        vm.localVideoId ="localVideo"
        vm.remoteVideoId ="remoteVideo";

        vm.redux = new ReduxC((estado :Estado)=>{

            vm.cdUpdate(estado)
        })
    }

    empezarClase(fn ?: (any) =>any)
    {
        MethodsClass.call("empezarClase", fn)
    }

    terminarClase (profesor : boolean, fn?: (any) =>any)
    {
        
        MethodsClass.call("terminarClase",profesor, fn)
    }

    getUserCall() : User {
        return this.userCall;
    }


    isConnected():boolean
    {
        let vm =this;
        return vm.rtc && vm.rtc.rtc && vm.rtc.rtc.pc && vm.rtc.rtc.pc.iceConnectionState==="connected";
    }
    setUserCall (userCall :User)
    {
        this.userCall = userCall;
    }

    cdUpdate(estado : Estado)
    {
        let vm=this;

        if(vm.estado !== estado)
        {
            vm.estado = estado;
            
            vm.estado.id = estado.id;

        }
        
        //this.cd.reattach();.detectChanges();
        //console.log("update cd " + vm.estado.id)
    }

    


    canColgar() :boolean 
    {
        return !isUndefined(this.getUserCall() )&& !isUndefined(this.getUserCall()._id);
    }

    intervalUpdAction()
    {
        let vm = this;
        if(!this.intervalUpd)  
        {
            /*this.intervalUpd = setInterval(()=>{
                vm.cdUpdate(vm.estado)
            },500)*/

        }
        else {
            clearInterval(this.intervalUpd)
        }
    }

    isEstadoIni() :boolean
    {
        let vm = this;

        return vm.redux.estado.id === ETipo.INIT;
    }
    isEstadoClass() :boolean
    {
        let vm = this;

        return vm.estado.id === ETipo.CLASS;
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
    isEstadoPreClass() :boolean
    {
        let vm = this;

        return vm.redux.estado.id === ETipo.PRE_CLASS;
    }



    isEstadoSelProf() :boolean
    {
        let vm = this;

        return vm.estado.id === ETipo.SEL_PROFESOR;
    }
    isEstadoCalling() :boolean
    {
        let vm = this;

        return vm.estado.id === ETipo.CALLING;
    }



    
    async iniRoom() {
        
        let vm=this;
        this.l.log("IniRoom setTimeout  nextStatus INIT");

        if(!vm.loggedIn())
        {
            this.l.log("iniRoom  nextStatus INIT");
                vm.redux.nextStatus({ type: ETipo.INIT });
            return;

        }

        let p1 = await new Promise((resolve, reject)=>{


            setTimeout(() => {
                //TODO ha cargado??
                this.l.log("IniRoom setTimeout  OK");
                resolve(1)
            }, 500);
            
        })
        
        this.l.log("iniRoom  getPermises video");
        let p2 :boolean = await new Promise((resolve, reject)=>{
            RtcService.getPermisos((isPerm)=>{
                resolve(isPerm)
             })
            });
        if(p2)
        {
                this.l.log("iniRoom  nextStatus INIT");
                vm.redux.nextStatus({ type: ETipo.INIT });

            }
            else{
                alert("Para ser usada la aplicación necesita permisos para microfono y video.")
                vm.rutas.navigate(["inicio"])
            }
    }
  
}