import { Component, OnInit, OnDestroy, Input,Output,EventEmitter } from '@angular/core';
import {RtcService} from "../services/rtc.service"
import {Tipo} from "../timeCounter/timeCounter.component"
import { isUndefined } from 'util';


@Component({
  selector: 'videoCall',
  templateUrl: 'videoCall.html',
  styleUrls: ['videoCall.scss']
})
export class VideoCall implements OnInit, OnDestroy {
  
  
    private _rtc: RtcService;
    private contador;
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
     
    ngOnInit()
    {
        
      }
    ngOnDestroy()
    {
        
      }
}
