import {Message, MessageRtc, MsgTipo} from "../../imports/models/message"
import {MeteorObservable,} from "meteor-rxjs";
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import {Msg} from "../collections/msg";
import {MapN} from "../../imports/models/map";
import {  OnInit, OnDestroy } from '@angular/core';


import {MethodsClass} from "./methodsClass"
import { Perfil } from 'imports/models/perfil';
import { FilesI } from 'imports/models/fileI';

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

export enum PATTERN{

    EMAIL = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$",
    MIN_8CHAR = "^.{8,}$",
    NUMEROS = "[0-9]+",
    LETRAS = "[a-zA-Z]+",
    LETRAS_MIN = "[a-z]+",
    LETRAS_MAY = "[A-Z]+",
    RARE_CHAR = "[!@#\$%\^\&*\)\(+=._-]+",
    PASS = "^[0-9a-zA-Z!@#\$%\^\&*\)\(+=._-]{8,20}$"

}

export class FactoryCommon
{

   static  MAX_SIZE_FOTO :number = 5242880 ;
   static   MAX_SIZE_DOCS:number  = 10485760;
   static  MIME_FORMATS : Array<string> = ["application/pdf","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/msword","application/zip","application/x-7z-compressed","application/x-rar-compressed","application/x-tar"] 
   
   
   constructor()
    {

    }
    /**
     * 
     * @param strIn param a limpiar
     * 
     * limmpiar la cadena de etiquetas mal intencionadas como scrip.
     */
    static limpiar( strIn : string, onlyScript ?: boolean) : string
    {
        if(onlyScript)
        {
            return strIn.replace(/<\/?[script^>]+(>|$)/g, "");
        }
        else{
            return strIn.replace(/<\/?[^>]+(>|$)/g, "");

        }
        
    }
    static getSizeFileB64(encoded_string: string) : number
    {
        return 3 * encoded_string.length / 4
    }

    static convertMBtoB(n : number) :number
    {   
        return n *  Math.pow(1024, 2)
    }
    static isDocCorrect(file : FilesI) :boolean
    {
        

        
            return   this.isImageCorrect(file) || file.size <= FactoryCommon.MAX_SIZE_DOCS  && this.MIME_FORMATS.reduce((a: boolean,act : string)=>{

                return a || file.valueUrl.includes(act);
            }, false)
            
            /// menos oigual a 5 MBx
    }

    static isImageCorrectFromUrl(url :string) :boolean
    {
        if(!url)
        {
            return false;
        }
       return url.includes("http") || this.isImageCorrect({filename : "", valueUrl : url, filetype: "", valueB64: "", size : this.getSizeFileB64(url.split(",")[1])})
    }
    static isImageCorrect(file : FilesI) :boolean
    {
         
            return  file.valueUrl.includes("data:image/") && file.size <= FactoryCommon.MAX_SIZE_FOTO /// menos oigual a 5 MBx
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
/*
export class AudioC extends Audio {

    this.audio = new Audio();   
    this.audio.src = "./../../assets/ring.mp3";
    this.audio.load();
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
*/
export interface  EloIntefaceModel 
{   
    eloIni : number,
    eloTotal :  number,
    i : number,
    notas : Array<number>,
    dTipicaI :  number,
    mediaI : number,
    score : number,
    factor : number,
    
    racha : {
      maxScoreRacha : number,
      score :number
    },
    factorInit :{
        positivo : number,
        mal : number,
        muyMal :  number
    },
    maxScoreTotal : number,
    maxElo : number,
    minElo :number,
    ref : number,
    scoreRacha : number,

    logueo  : string
}

export let  iniEloModel : EloIntefaceModel=  {
    eloIni :1000,
    eloTotal :  1000,
    i : 0,
    notas : [],
    dTipicaI : 0,
    mediaI : 0,
    score : 0,
    factor : 20,
    
    racha : {
      maxScoreRacha : 200,
      score :5
    },
    factorInit :{
        positivo : 20,
        mal : 100,
        muyMal :  150
    },
    maxScoreTotal : 300,
    maxElo : 7000,
    minElo :0,
    ref : 3,
    scoreRacha : 0,

    logueo    :""

}

export let  iniProfesorModel = (profile: Perfil) =>{
    profile.perfClase = {
      categorias: [],
      clases: [],
      ultElo: iniEloModel.eloIni,
      nombre: "",
      ultPrecio: 0,
      updated: false,
      eloModel: iniEloModel
    };
  }
export class Elo {
    modelo;

constructor(modelo)
{
    this.modelo =  modelo ||iniEloModel
}
add(nota)
{
    this.modelo.i++;
    this.modelo.notas.push(nota);
}

media()
{
    let res = this.modelo.notas.reduce((res, vActual)=>{
        return res + vActual;
    },0)

    return res / this.modelo.i;
}

desTipica(media ?: number)
{
    if(!media && media!==0)
    {
        media = this.media();
    }

    let res = this.modelo.notas.reduce((res, vActual)=>{

        return res + Math.pow(vActual-media, 2);
    },0)
    
    return Math.sqrt(res/this.modelo.i); 
}


calcularRacha() :number
{
  let vm= this;
 
  
  let ultimaNota = this.modelo.notas[this.modelo.notas.length-1]-this.modelo.ref;
  if(ultimaNota===0)
  {
    return 0;
  }

  let signo = 1;
  if(ultimaNota <0 )
  {
    signo = -1;
  }

  
  let numRacha = 1;
  
  for(let i = this.modelo.notas.length-2; i>=0; i--)
  {
    let n = this.modelo.notas[i]-vm.modelo.ref;

    if(n>=0 && signo<0 || n<=0 && signo>0)
    {
      //pierde racha
      break;

    }

    numRacha++;
  }
  this.logueoCol("numero de rachas: " + numRacha);
 
  if(signo>0)
  {
    return Math.min(this.modelo.racha.score * numRacha , this.modelo.racha.maxScoreRacha) * signo ;
  }
  else{
    return this.modelo.racha.score * numRacha *3  * signo ;
  }
  
  
}

logueoCol(col)
{
    this.modelo.logueo = this.modelo.logueo + `${col}\n`;
    //console.log(col);
}

calcularElo()
{
    if(Meteor.isClient)
    {
        return;
    }
    //si la ultima nota sacada es muy baja y tiene un factor mayor
    let ultimaNota = this.modelo.notas[this.modelo.notas.length-1];
    this.modelo.mediaI = this.media();
    this.modelo.dTipicaI =  this.desTipica();
    this.logueoCol("nota: " +ultimaNota);
    this.logueoCol(`i = ${this.modelo.i} ----------------`);
    this.logueoCol(`media = ${this.modelo.mediaI}`);
    this.logueoCol(`Raiz(Varianza) = ${this.modelo.dTipicaI}`);
    
    switch(ultimaNota-3)
    {
      case -1 :
      this.modelo.factor = this.modelo.factorInit.mal
      this.logueoCol("MAL " + this.modelo.factor);
      
      break;
      case -2 :
      this.modelo.factor = this.modelo.factorInit.muyMal
      this.logueoCol("Muy MAL " + this.modelo.factor);
         break;
         default:
         this.modelo.factor = this.modelo.factorInit.positivo;
            this.logueoCol("Positivo " + this.modelo.factor);
            
         break;
        }
        
      


      let scoreRacha = this.calcularRacha();
      this.logueoCol("scoreRacha :" +scoreRacha);
  
      
      this.modelo.score = this.modelo.factor *(this.modelo.mediaI * 0.2  + ultimaNota * 0.8  -this.modelo.ref) +  scoreRacha;
      let dTipica = this.modelo.score <0 ? 0 :this.modelo.dTipicaI;
      
      this.modelo.eloTotal = this.modelo.eloTotal +  (ultimaNota === this.modelo.ref ? 0 : this.modelo.score)/ (1+dTipica) ;

      this.logueoCol(`score = ${this.modelo.score}`);
      this.logueoCol(`score/Varianza = ${(ultimaNota === this.modelo.ref ? 0 : this.modelo.score)/ (1+dTipica)}`);
      
      if(this.modelo.eloTotal>this.modelo.maxElo)
      {
        this.logueoCol(`Elo maximo  = ${this.modelo.maxElo}`);
        this.modelo.eloTotal = this.modelo.maxElo;
      }
      else if(this.modelo.eloTotal<this.modelo.minElo)
      {
        this.logueoCol(`Elo minimo  = ${this.modelo.minElo}`);
        this.modelo.eloTotal = this.modelo.minElo;
      }
      this.logueoCol(`Elo Total = ${this.modelo.eloTotal}`);
      this.logueoCol("***********************")
   
    return  this.modelo.eloTotal;
}

toString()
{
  let ultimaNota = this.modelo.notas[this.modelo.notas.length-1];
     let dTipica = this.modelo.score <0 ? 0 :this.modelo.dTipicaI;
    console.log(`i = ${this.modelo.i} ----------------`);
    console.log(`media = ${this.modelo.mediaI}`);
    console.log(`Raiz(Varianza) = ${this.modelo.dTipicaI}`);
    console.log(`Factor = ${this.modelo.factor}`)
    console.log(`score = ${this.modelo.score}`);
    console.log(`score/Varianza = ${(ultimaNota === this.modelo.ref ? 0 : this.modelo.score)/ (1+dTipica)}`)
    console.log(`Elo Total = ${this.modelo.eloTotal}`);

}

}