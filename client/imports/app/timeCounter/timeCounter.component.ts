import { Component, OnInit, OnDestroy, Input,Output,EventEmitter } from '@angular/core';

import  {RolesService} from "../services/roles.service";
import { isUndefined } from 'util';

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
    private _secondsIni: number;
    private  _tipo: Tipo;
    private _mostrar :boolean
    comenzado : boolean;
    tView : TiempoView;
    constructor()
    {
       

        
    }

    @Input()
    set mostrar(mostrar: boolean) {
      this._mostrar = mostrar;
      if(mostrar===false)
      {
        this.ngOnDestroy();
      }
      else{
        this.comenzar()
      }
    }
   
    
     get mostrar(): boolean { 
       
       
       return this._mostrar; 
     
     }
     @Input()
     set secondsIni(seconds: number) {
       this._secondsIni = seconds;
       this.comenzar()
      }
      
      get secondsIni(): number { 
        
        return this._secondsIni; 
      
      }
      @Input()
      set tipo(tipo: Tipo) {
        this._tipo = tipo;
        this.comenzar()
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
        let seconds =vm.secondsIni;
        if(vm.secondsIni >0)
        {
          vm.tView.horas = Math.floor(seconds/3600);
  
          vm.tView.minutos = Math.floor((seconds % 3600)/60);
  
          vm.tView.segundos = seconds % 60;

        }


      //  alert(`${horas} - ${minutos} - ${sec}`)
      }

      digitToString(numero)
      {
         if(numero<10)
         {
            return "0"+numero;
         }
         else{
           return numero.toString();
         }
      }
      comenzar()
      {
        let vm = this;
      
        if( this.comenzado || !this._mostrar || !this._tipo || !this._secondsIni && this._secondsIni!==0)
        {
          return;
        }
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
            if(isUndefined(vm._secondsIni) || vm._secondsIni<0)
            {
              vm._secondsIni = 0;

            }


           vm.idInterval = setInterval(contIntervalFn, 1000)
            
          }
          else{
            vm.crearTemporizador();
            var elem = document.getElementById("myBar");   
            if(elem)
            {

              elem.style.width = '100%'; 
              var width = 100;
              let contador = 0;
              vm.idInterval = setInterval(tempIntervalFn, 10);
            }
            else{
              return;
            }
          }
          this.comenzado =true;
      }
  
      crearTemporizador()
      {

        var elem = document.getElementById("myBar");   
        if(!elem)
        {
          var div1 = document.createElement("DIV");
          div1.setAttribute("id", "myProgress") //myProgress
          div1.style.cssText ='width: 100%;background-color: #ddd;height: 20px;height: auto;';
          var div2 = document.createElement("DIV");
          
          div2.setAttribute("id", "myBar") //myProgress
          div2.style.cssText = "width: 100%;background-color: #4CAF50;height: 20px;";
          div1.appendChild(div2);
          document.getElementById("temporizador").appendChild(div1);

        }
        else {
          elem.style.width = '100%'; 
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
        this.comenzado =false;
        if(this.idInterval)
        {
          clearInterval(this.idInterval);
        }
      }
    }
