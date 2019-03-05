import { Component, OnInit, OnDestroy, Input,Output,EventEmitter } from '@angular/core';
import {RtcService, VideoType} from "../services/rtc.service"
import {Tipo} from "../timeCounter/timeCounter.component"
import { isUndefined } from 'util';
import {MethodsClass} from "../../../../imports/functions/methodsClass"

@Component({
  selector: 'videoCall',
  templateUrl: 'videoCall.html',
  styleUrls: ['videoCall.scss']
})
export class VideoCall implements OnInit, OnDestroy {
  
  
    private _rtc: RtcService;
    private contador;
    
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

   
    constructor()
    {
       this.contador = {
            tipo :Tipo.CONT,
            secondsIni : 0,
            mostrar : true
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
