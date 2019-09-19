import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import {RtcService, VideoType} from "../services/rtc.service"

import { isUndefined } from 'util';
import {MethodsClass} from "../../../../imports/functions/methodsClass"
import { Tipo } from 'imports/models/enums';
import { Room, RoomFile, MessageRoom, MsgChat, TypeMsgChat } from 'imports/models/room';
import { FilesI } from 'imports/models/fileI';
import { FactoryCommon } from 'imports/functions/commonFunctions';



@Component({
  selector: 'videoCall',
  templateUrl: 'videoCall.html',
  styleUrls: ['videoCall.scss']
})
export class VideoCall implements OnInit, OnDestroy{
  
  
    private _rtc: RtcService;
    private contador;
    private _clase : Room = {
      alumnoId : "",
      files : [],
      profId : "",
      chat : [],
      titulo : "",      
    }; 

    private chat : Array<MsgChat>= [];
    private videos ={
      remote : {
        isFullScreen : false
      },
      local : 
      {
        1: { //CAM
          isOnVideo: true,

        },
        2 : //SCREEN
        {
          isOnVideo: true,
        },
        isOnMicro: true,
        videoType : 1 
      }
    }
  msg: string = "";

   
    constructor()
    {
       this.contador = {
            tipo :Tipo.CONT,
            secondsIni : 0,
            mostrar : true
         }

        
    }

    download(f : FilesI)
    {
      var link = document.createElement("a");
      link.download = f.filename;
      link.href = f.valueUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);


    }

    imOwner(user : string) : boolean
    { 

      return Meteor.userId() === user;
      
    } 

    addFile(files : Array<FilesI>)
    {
        if(files && files.length>0 && FactoryCommon.isDocCorrect(files[0]))
        {
            // image/png
            //this.perfil.foto = files[0].valueUrl;
            // uploadFile(claseId :string ,filesIn: Array<RoomFile>)
            MethodsClass.call("uploadFile",  this._clase._id,  files, (res)=>{
                
            }, (error)=>{
                alert(error);
            });
        }
        else{
            alert("Imagen incorrecta. La imagen debe ser un formato compatible (*.png, .jpg ...) y de un tamaño máximo de 5MB ");
        }
    }

   
    isFile(e:MsgChat)
    {
        return e.type === TypeMsgChat.FILE;
    }
    isMsg(e:MsgChat)
    {
        return e.type === TypeMsgChat.MSG;
    }

    newMsg()
    {
        let msgSend  : MessageRoom ={
            msg : this.msg,
            type : TypeMsgChat.MSG
        }


        MethodsClass.call("newMsgChat",  this._clase._id, msgSend, (res)=>{
                  
        }, (error)=>{
            alert(error);
        });

        this.msg ="";
    }

    isSendDisabled() : boolean
    {
        return !this.msg || this.msg.trim() === "";
    }
    createChat()
    {

      let vm=this;

      vm.chat = [...vm._clase.chat, ... vm._clase.files];
      let fnSort = (a : MsgChat, b : MsgChat) :number =>{

           if(!a.fecha)
           {
             return 1
           }
           if(!b.fecha)
           {
             return -1
           }
          return a.fecha.getTime()-b.fecha.getTime();
      }
      vm.chat.sort(fnSort)
    }
    
    @Input()
    set secondsIni(seconds: number) {
        if(isUndefined(seconds) || seconds<0)
        {
            seconds = 0;
        }
        this.contador.secondsIni =seconds;
    }
   
    
    get secondsIni(): number { 
       
       
       return this.contador.secondsIni; 
     
     }




     @Input()
     set  clase( c : Room) 
     {

        if(c !== null && c._id!==null)
        {
          
          this._clase = c;

          this.createChat()

        }
     }

    
     get clase(): Room { 
       
       
      return this._clase; 
    
    }

    @Input()
    set rtc(rtc: RtcService) {
      this._rtc =rtc;
    }
   
    
     get rtc(): RtcService { 
       
       
       return this._rtc; 
     
     }
     mostrar() :boolean
     {
       return this._rtc.isConnected();
     }


     async shareDesk()
    {
        let vm = this;
        vm._rtc.setVideoTypeScreen();
        await vm._rtc.mediaUser();
        vm.restablecerConfigAfterSwitchSource()
    }
    async cam()
    {
        let vm = this;
        vm._rtc.setVideoTypeCam();
        
       await vm._rtc.mediaUser();

       vm.restablecerConfigAfterSwitchSource()
        
    }

    restablecerConfigAfterSwitchSource()
    {
      let vm=this;
      vm.switchMicro(vm.videos.local.isOnMicro);
      vm.switchVideo(vm.videos.local[vm._rtc.getVideoType()].isOnVideo);
    }
    switchMicro(flag)
    { 

      let vm = this;
      
       vm.videos.local.isOnMicro = vm._rtc.switchAudioMute(flag);
    }
    switchVideo(flag)
    {
      let vm = this;
      
      vm.videos.local[vm._rtc.getVideoType()].isOnVideo = vm._rtc.switchVideoMute(flag);
    }
    
    isSonidoOn() :boolean
    {
      let vm=this;
      return vm.videos.local.isOnMicro;
    }
    isVideoOn() :boolean
    {
      let vm=this;
        return  vm.videos.local[vm._rtc.getVideoType()].isOnVideo;
    }

    isModeCam()
    {
      let vm =this;
      return vm._rtc.getVideoType() === VideoType.CAM;
    }
    switchFullScreen()
    {
      this.videos.remote.isFullScreen = !this.videos.remote.isFullScreen;
    }
    isFullScreen() :boolean
    {
      return this.videos.remote.isFullScreen;
    }

    switchVideoSource()
    {
        let vm =this;
        
        let tipoAnterior = vm._rtc.getVideoType();

        
        try{
          if(vm._rtc.getVideoType() === VideoType.CAM)
          {
            vm.shareDesk()
  
          }
          else if(vm._rtc.getVideoType() === VideoType.SCREEN){
            vm.cam();
  
          }

        }
        catch(e)
        { 
          //restablecer
          //COMPROBAR
          vm._rtc.setVideoTypeTo(tipoAnterior);
          vm.restablecerConfigAfterSwitchSource();
          MethodsClass.errorAsignarSource();
          
        }
    }


    ngOnInit()
    {
        
      }
    ngOnDestroy()
    {
        
      }
}
