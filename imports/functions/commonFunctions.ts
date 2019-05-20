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
    l : Log;

    contador = 0;
    //METER EL OBSERVABLE de  MENSAJES
    constructor()
    {
        this.suscribe();

        this.l = new Log("lectorMSG", Meteor.userId())
        this.contador = 0;
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
        


       

            if(vm.contador>0) return;
           
            vm.contador = vm.msgIn.length;
            while(vm.msgIn.length>0)
              {
                  let m : Message = vm.msgIn.shift()
                  vm.l.log("Read :" + JSON.stringify(m))
                  if(m && !m.readed)
                  {
                      
                           vm.l.log("Reading ")
                           let fn : (m : Message)=>void = fns[m.msgTipo]
                           if(fn)
                           {
                              fn(m);
                              
                          }
                          m.readed = true;
                          vm.borrarMsg(m,()=>{
                              vm.contador--;
                          })
                          //vm.setLeido(m);
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

export class Log{


  static on : boolean =true;
 modulo :string; 
 user :string;
 constructor(modulo : string, user:string, on ?: boolean)
 {
    this.modulo = modulo || "?";
    this.user = user || "?";
    Log.on = on || true;
 }
 
  
  
  log( msg:string, error ?:boolean)
    {
        if(Log.on)
        {
            
            let date = new Date();
            let res : string = `${this.user }-${date.toJSON()}-${this.modulo}-${msg}`;

            if(error)
            {
                console.error(res)
            }
            else{
                console.log(res)
            }
        }
        //TODO loguear en aplicaicon
    }

    static logStatic(modulo:string, msg:string, error ?:boolean)
    {
        if(this.on)
        {
            
            let date = new Date();
            let res = `${Meteor.userId() || "?" }-${date.toJSON()}-${modulo}-${msg}`;

            if(error)
            {
                console.error(res)
            }
            else{
                console.log(res)

            }
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