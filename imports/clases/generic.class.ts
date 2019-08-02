import  {RolesService} from "../../client/imports/app/services/roles.service";

import { Meteor } from 'meteor/meteor';
import { Rol } from '../models/rol';
import { Map } from '../models/map';

import { MsgTipo} from "../models/message"
import {MsgClass, Log} from "../functions/commonFunctions"



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
    
    l : Log;
  
    constructor(minWrite : number,  minRead : number,modulo : string, rol : RolesService)
    {
        let vm = this;
        this.minRead = minRead;
        this.minWrite = minWrite;
        this.modulo = modulo;
        this.msgServ =  new MsgClass();
        this.rol = rol;
        this.l = new Log(this.modulo, Meteor.userId());
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
 

    
    
  }