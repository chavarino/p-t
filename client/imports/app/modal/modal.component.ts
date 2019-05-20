import { Component, Input,Output,EventEmitter } from '@angular/core';

import {Map} from "../../../../imports/models/map";

@Component({
  selector: 'modal',
  templateUrl: 'modal.html',
  styleUrls: ['modal.scss']
  
})
export class ModalComponent {
  
  //private _mostrar :boolean;
  private _config : any;
  private tipos  : Map<number>
  constructor()
  {

    this.tipos  = {

      confirm : 1
    }
      this._config = {
           tipo :-1
       }
  }

  @Input()
  set config(config : object)
  {
      this._config = config;
  }

  get config() : object
  {
    return this._config;
  }

  /*@Input()
  set mostrar(mostrar: boolean) {
    this._mostrar = mostrar;
  }
 
  get mostrar(): boolean { 
    
    return this._mostrar; 
  
  }
  @Output() cambio = new EventEmitter<boolean>();

  cerrar()
  {
    //this._mostrar =false;
    this.cambio.emit(false);
  }*/
@Output() retorno = new EventEmitter<any>();


retornar()
{
    let vm = this;
    if(vm._config.tipo = vm.tipos.confirm)
    {

        this.retorno.emit(true);
    }
}

}
