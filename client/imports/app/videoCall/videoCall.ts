import { Component, OnInit, OnDestroy, Input, HostListener, SecurityContext, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import {RtcService, VideoType} from "../services/rtc.service"

import { isUndefined } from 'util';
import {MethodsClass} from "../../../../imports/functions/methodsClass"
import { Tipo } from 'imports/models/enums';
import { Room, RoomFile, MessageRoom, MsgChat, TypeMsgChat } from 'imports/models/room';
import { FilesI } from 'imports/models/fileI';
import { FactoryCommon } from 'imports/functions/commonFunctions';
import { DomSanitizer } from '@angular/platform-browser';
import { isDefined } from '@angular/compiler/src/util';



@Component({
  selector: 'videoCall',
  templateUrl: 'videoCall.html',
  styleUrls: ['videoCall.scss'],
  styles: [`
  /*para que el input interior llegue hasta el final*/
        :host ::ng-deep fileInput button i {
           font-size: 1.1vw!important;
      }
  
  `]
})
export class VideoCall implements OnInit, OnDestroy, AfterViewChecked{
  
    @ViewChild('textchat') textChat: ElementRef;
    private _rtc: RtcService;
    private contador;
    private _clase : Room = {
      alumnoId : "",
      files : [],
      profId : "",
      chat : [],
      titulo : "",
      nomAlumn: "",
      nomProfe: "" ,
  


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
  isChatChanged: boolean;
  minutosLive: number;

   
    constructor( private sanitizer : DomSanitizer)
    {
       this.contador = {
            tipo :Tipo.CONT,
            secondsIni : 0,
            mostrar : true
         }
         this.isChatChanged =false;
        
    }
    @HostListener('document:keydown', ['$event']) 
    onKeydownHandler(event: KeyboardEvent) {

        
      this.fnKeyDetectPEntera(event);
  }
    fnKeyDetectPEntera = (event: KeyboardEvent) =>{
          if(event.key === "Escape" && this.isFullScreen())
          {
            event.preventDefault();
            console.log("ESCAPE")

            this.switchFullScreen();
          }
      }
    fnKeyDetectChat = (event: KeyboardEvent) =>{
        if(event.key === "Enter")
        {
          event.preventDefault();
          console.log("enter")

          this.newMsg();
        }
    }
    download(f : FilesI)
    {
      var link = document.createElement("a");
      link.download = f.filename;
      link.href = f.valueUrl;//this.getSecureUrl();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);


    }

    reconectarVideo()
    {
      
      this._rtc.reiniciar()
    }
    imOwner(e:MsgChat) : boolean
    { 

      return Meteor.userId() === e.owner;
      
    } 
    getSecureUrl(url :string) :string
    {
        return this.sanitizer.sanitize(SecurityContext.URL, url)//this.sanitizer.bypassSecurityTrustResourceUrl(url)
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
        if(this.isSendDisabled())
        {
          return false;
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
      vm.isChatChanged = true;
    }


    ngAfterViewChecked() {        

      if(this.isChatChanged)
      {
        this.scrollToBottom();        
        this.isChatChanged =false;
      }
    } 
    scrollToBottom(): void {
      try {
          this.textChat.nativeElement.scrollTop = this.textChat.nativeElement.scrollHeight;
        } catch(err) { 

          console.log(err);
        }                 
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

        if(!isUndefined(c) &&c!== null  && !isUndefined(c._id)   && c._id!==null)
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

      if(isDefined(this._rtc) && isDefined(this._rtc.rtc))
      {
         this._rtc.cancelarScreen = () =>{
              this.switchVideoSource()
         }
      }
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

    setContandorMinutosLive(min :number)
    {

        this.minutosLive = min;
    }
    ngOnInit()
    {
        
      }
    ngOnDestroy()
    {
        
      }
}
