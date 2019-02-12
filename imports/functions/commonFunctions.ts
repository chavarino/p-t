import {Message, MessageRtc, MsgTipo} from "../../imports/models/message"
import {MeteorObservable,} from "meteor-rxjs";
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import {Msg} from "../collections/msg";
import {MapN} from "../../imports/models/map";
import {  OnInit, OnDestroy } from '@angular/core';
import {Error} from "./errors"
export class MsgClass{

   
    private  msgIn: Message[]// Observable<Message>;
    private  sus: Subscription;
    //METER EL OBSERVABLE de  MENSAJES
    constructor()
    {
        this.suscribe();
    }
    private suscribe()
    {
        let vm =this;
        this.msgIn = [];
        vm.sus = MeteorObservable.subscribe('getMsg').subscribe(() => {
            
            Msg.find().forEach((lista : Message[])=>{

                 vm.msgIn = lista;
            });
            //vm.findClass();
        });;
        
        
        
    }
    borrarAllMsg()
    {
        Meteor.call("borrarAllMsg", Error.frontHandle);
    }
    borrarMsg(msg : Message)
    {
        Meteor.call("borrarMsg", msg._id, Error.frontHandle);
    }

    setLeido(msg : Message)
    {
        Meteor.call("setReaded", msg._id, Error.frontHandle);
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
    readMsgs(fns : Map<Number, (m : Message)=>void>) {
        
        let vm = this;
          /*MsgClass.msgIn.forEach(function(m : Message)
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
            


        })*/
      while(vm.msgIn.length>0)
        {
            let m : Message = vm.msgIn.shift()

                if(m && !m.readed)
                 {
                     let fn : (m : Message)=>void = fns[m.msgTipo]
                     if(fn)
                     {
                        fn(m);
                        
                        m.readed = true;
    
                        vm.setLeido(m);
                    }
                 }
           


        }
        
    }


    cerrar()
    {
        if (this.sus) {
            this.sus.unsubscribe();
       }
    }
}