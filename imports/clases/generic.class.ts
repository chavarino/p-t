import  {RolesService} from "../../client/imports/app/services/roles.service";

import { Meteor } from 'meteor/meteor';
import { Rol, Permisos } from '../models/rol';
import { Map } from '../models/map';

import { MsgTipo} from "../models/message"
import {MsgClass, Log} from "../functions/commonFunctions"




export class Generic {
    minWrite : number;
    minRead : number;
    modulo : string;
    rol : RolesService;
    rolesElemnt : Map<Permisos> 
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
            none : Permisos.NONE,
            login : Permisos.LOG,
            alumno : Permisos.ALUMNO,
            prof : Permisos.PROFES,
            
            admin :  Permisos.ADMIN,
            sAdmin :  Permisos.S_ADMIN

        }
    }

    loggedIn() {
        return !!Meteor.user() ;
      }
    
    logginIn()
    {
        return Meteor.loggingIn();
    }


   


    canReadC(name)
    {
        let minPerm : Permisos = this.rolesElemnt[name];
        if(!minPerm)
        {
            return false;
        }
        
        
        return this.rol.canRead(minPerm);
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