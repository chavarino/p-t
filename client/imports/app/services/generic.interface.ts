import  {RolesService} from "../services/roles.service";
import {RtcService} from "../services/rtc.service"
import { Meteor } from 'meteor/meteor';
import { Rol } from '../../../../imports/models/rol';
import { Map } from '../../../../imports/models/map';
import $ from "jquery";
import {Message, MessageRtc, MsgTipo} from "../../../../imports/models/message"
import {MsgClass, Log} from "../../../../imports/functions/commonFunctions"
import { User } from 'imports/models/User';

import {MethodsClass} from "../../../../imports/functions/methodsClass"
import { Estado } from './reduxC';
import { ChangeDetectorRef } from '@angular/core';

interface RolesEnt {
    module : string,
    min : Rol,
    fn ?: Function

}
export class Generic {
    minWrite : number;
    minRead : number;
    modulo : string;
    rol : RolesService;
    rolesElemnt : Map<RolesEnt> 
    msgServ : MsgClass;
    rtc : RtcService;
    secondsIniClass : number
    userCall : User;

    l : Log;
    estado: Estado = {

        id:-1
    };intervalUpd: any;
;
  
    constructor(minWrite : number,  minRead : number,modulo : string, rol : RolesService)
    {
        let vm = this;
        this.minRead = minRead;
        this.minWrite = minWrite;
        this.modulo = modulo;
        this.msgServ =  new MsgClass();
        this.rol = rol;
        
        this.rolesElemnt = 
        {
            peticion : {
                module : "alumno",
                min : {
                    read : 0,
                    write: 1
                }
            },
            clase : {
                module : "prof",
                min : {
                    read : 1,
                    write: 1
                }
            },
            prof : {
                module : "prof",
                min : {
                    read : 1,
                    write: 1
                }
            },
            login : {
                module : "comun",
                min : {
                    read : 0,
                    write: 0
                },
                fn : function()
                {
                    return !vm.loggedIn();
                }
            },
            opciones : {
                module : "comun",
                min : {
                    read : 1,
                    write: 1
                }
            },
            perfil : {
                module : "comun",
                min : {
                    read : 1,
                    write: 1
                }
            },
            suscripcion : {
                module : "alumno",
                min : {
                    read : 0,
                    write: 1
                },
                fn : function()
                {
                    return vm.loggedIn();
                }
            },
            facturacion : {
                module : "prof",
                min : {
                    read : 1,
                    write: 1
                }
            },
            admin : {
                module : "admin",
                min : {
                    read : 50,
                    write: 50
                }
            }

        }
    }

    loggedIn() {
        return !!Meteor.user() ;
      }
    
    logginIn()
    {
        return Meteor.loggingIn();
    }

    canWrite(modulo ?: string, min ?:number)
    {
        return this.rol.canWrite( modulo || this.modulo, min >=0 ? min : this.minWrite);
    }

    canRead(modulo ?: string, min ?:number)
    {
        return this.rol.canWrite(modulo ||this.modulo, min >=0 ? min :this.minRead);
    }


    canReadC(name)
    {
        let minPerm : RolesEnt = this.rolesElemnt[name];
        if(!minPerm)
        {
            return false;
        }
        let validador2 = true;
        if(minPerm.fn)
        {
            validador2 = minPerm.fn();
        }
        return this.canRead(minPerm.module, minPerm.min.read) && validador2;
    }

    canWriteC(name)
    {
        let minPerm : RolesEnt = this.rolesElemnt[name];
        if(!minPerm)
        {
            return false;
        }
        let validador2 = true;
        if(minPerm.fn)
        {
            validador2 = minPerm.fn();
        }
        return this.canRead(minPerm.module, minPerm.min.write) && validador2;
    }

    sendMsg(to :string, tipo : MsgTipo, cuerpo ?: any)
    {
        this.msgServ.sendMsg(to, tipo,cuerpo)
        //send mensaje
    }

    borrarMsg(fn ?: (any) =>any)
    {
        this.msgServ.borrarAllMsg(fn);
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

    setUserCall (userCall :User)
    {
        this.userCall = userCall;
    }

    cdUpdate(estado : Estado,cd :ChangeDetectorRef)
    {
        let vm=this;

        if(vm.estado !== estado)
        {
            vm.estado = estado;
            
            vm.estado.id = estado.id;

        }
        cd.reattach();//.detectChanges();
        //console.log("update cd " + vm.estado.id)
    }



    intervalUpdAction(cd)
    {
        let vm = this;
        if(!this.intervalUpd)  
        {
            this.intervalUpd = setInterval(()=>{
                vm.cdUpdate(vm.estado, cd)
            },500)

        }
        else {
            clearInterval(this.intervalUpd)
        }
    }
    
  }