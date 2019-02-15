import { Component, OnInit, OnDestroy, Input,Output,EventEmitter } from '@angular/core';

import  {RolesService} from "../services/roles.service";

export enum Tipo
{
  CONT = 1,
  TEMP =-1
}
interface TiempoView {
  segundos: number,
  minutos : number,
  horas : number
}
@Component({
  selector: 'timeCounter',
  templateUrl: 'timeCounter.html',
  styleUrls: ['timeCounter.scss']
})
export class TimeCounter implements OnInit, OnDestroy {
  
    idInterval;
    _secondsIni: number;
    _tipo: Tipo;
    _mostrar :boolean
   
    tView : TiempoView;
    constructor()
    {
       

        
    }

    @Input()
    set mostrar(mostrar: boolean) {
      if(mostrar===false)
      {
        this.ngOnDestroy();
      }
      else{
        this.comenzar()
      }
      this._mostrar = mostrar;
    }
   
    
     get mostrar(): boolean { 
       
       
       return this._mostrar; 
     
     }
     @Input()
     set secondsIni(seconds: number) {
       this._secondsIni = seconds;
      }
      
      get secondsIni(): number { 
        
        return this._secondsIni; 
      
      }
      @Input()
      set tipo(tipo: Tipo) {
        this._tipo = tipo;
       }
       
       get tipo(): Tipo { 
         
         return this._tipo; 
       
       }
      isTipoCont()
      {
        return this._tipo === Tipo.CONT
      }
      isTipoTemp()
      {
        return this._tipo === Tipo.TEMP

      }

      isMostrar()
      {
        return this._mostrar;
      }
      setTimeView() : void
      {
        let vm = this;
        let seconds //TODO
        if(vm.secondsIni >0)
        {
          vm.tView.horas = Math.floor(seconds/3600);
  
          vm.tView.minutos = Math.floor((seconds % 3600)/60);
  
          vm.tView.segundos = seconds % 60;

        }


      //  alert(`${horas} - ${minutos} - ${sec}`)
      }


      comenzar()
      {
        let vm = this;
      

        let  contIntervalFn =() => {
            vm._secondsIni ++;

            vm.setTimeView();
        }
        

        let tempIntervalFn =()=> {
        
          if (width <= 0) {
            clearInterval(vm.idInterval);
          } else {
            width =width - 0.01 * (100/vm._secondsIni) ; 
            elem.style.width = width + '%'; 
          }
        }
          
  
          if(vm.isTipoCont())
          {
            vm.tView = {
              segundos : 0,
              minutos : 0,
              horas : 0
            }
            vm._secondsIni = 0;


           vm.idInterval = setInterval(contIntervalFn, 1000)
            
          }
          else{
            var elem = document.getElementById("myBar");   
            elem.style.width = '100%'; 
            var width = 100;
            let contador = 0;
            vm.idInterval = setInterval(tempIntervalFn, 10);
          }

      }
  
      ngOnInit()
      {
          this.tView = {
            segundos : 0,
            minutos : 0,
            horas : 0
          }
      }
      ngOnDestroy()
      {
        if(this.idInterval)
        {
          clearInterval(this.idInterval);
        }
      }
    }
