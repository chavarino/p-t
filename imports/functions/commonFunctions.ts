import {Message, MessageRtc, MsgTipo} from "../../imports/models/message"
import {MeteorObservable,} from "meteor-rxjs";
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import {Msg} from "../collections/msg";
import {MapN} from "../../imports/models/map";
import {Error} from "./errors"
export class MsgClass {

   
    private static profs:  Observable<Message>;
    //METER EL OBSERVABLE de  MENSAJES
    constructor()
    {
        this.suscribe();
    }
    private suscribe()
    {
        let vm =this;
        if(!MsgClass.profs)
        {
            
            MsgClass.profs = MeteorObservable.subscribe('allAvalaibleTeacher');
        }
        
    }
    borrarAllMsg()
    {
        Meteor.call("borrarAllMsg", Error.frontHandle);
    }
    borrarMsg(msg : Message)
    {
        Meteor.call("borrarMsg", Error.frontHandle);
    }
    sendMsg(to :string, tipo : MsgTipo, cuerpo ?: any)
    {
        let mensaje : Message = {
            to : to,
            from : Meteor.userId(),
            msgTipo : tipo,
            cuerpo : cuerpo,
            readed :false
        } 
        //send mensaje
        Meteor.call("sendMsg", mensaje, Error.frontHandle);
    }
    readMsgs(fns : MapN<(m : Message)=>void>) {
        
        let vm = this;
        
        MsgClass.profs.forEach(function(m : Message)
        {
            if(m)
             {
                 let fn : (m : Message)=>void = fns[m.msgTipo]
                 if(fn)
                 {
                    fn(m);
                    m.readed = true;
                    vm.borrarMsg(m);
                 }
             }


        })
        
    }

    cerrar()
    {
        MsgClass.profs = null;
    }
}