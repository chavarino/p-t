import {Message, MessageRtc, MsgTipo} from "../../imports/models/message"
import {MeteorObservable,} from "meteor-rxjs";
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import {Msg} from "../collections/msg";
import {MapN} from "../../imports/models/map";
import {  OnInit, OnDestroy } from '@angular/core';


import {MethodsClass} from "./methodsClass"
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
    borrarAllMsg(fn ?: (any) =>any)
    {
        
        MethodsClass.call("borrarAllMsg", fn);
        
    }
    borrarMsg(msg : Message,fn ?: (any) =>any)
    {
        MethodsClass.call("borrarMsg", msg._id, fn);
    }

    setLeido(msg : Message, fn ?: (any) =>any)
    {
        MethodsClass.call("setReaded", msg._id, fn);
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
        MethodsClass.call("sendMsg", mensaje);
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
                        
                    }
                    m.readed = true;

                    vm.setLeido(m);
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

export class FactoryCommon
{
    constructor()
    {

    }

    static promesa(fn : (valor : any)=>any) {
        return new Promise(fn);
      }
    
      
      
     static  promisesAnid(...fn )
      {
          let vm=this;
        async function promesasAnidadas() {
      

            let array = [];
            for(let i = 0; i<fn.length; i++)
          {
              let res = await FactoryCommon.promesa(fn[i])
            if(res)
            {
                array.push(res);
            }
          }
          
          return array;
        } 

        return promesasAnidadas();
      }
}

export class AudioC extends Audio {

    /*this.audio = new Audio();   
    this.audio.src = "./../../assets/ring.mp3";
    this.audio.load();*/
    constructor(source : string)
    {
        super(source)
        
        this.loop = true;
    }


   

 stop()
{
    this.pause();
	this.load()
}	




}