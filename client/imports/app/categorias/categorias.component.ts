import { Component, Input, Output, EventEmitter } from '@angular/core';
import {CategoriasPatron, AutoCompleteModel,Perfil, CategoriasPatronClass} from '../../../../imports/models/perfil';
import { isString } from 'util';
import { Users } from '../../../../imports/collections/users';
import { MethodsClass } from 'imports/functions/methodsClass';
import { Observable } from 'rxjs/Observable';
import { from,of } from 'rxjs';
export interface ConfigTags {
  listCat : Array<string> ;
  listCatBusc : Array<CategoriasPatronClass>;
}

@Component({
  selector: 'categorias',
  templateUrl: 'categorias.html',
  styleUrls: ['categorias.scss']
})
export class Categorias{
  
  private _config : ConfigTags = {
    listCat  : [],
    listCatBusc : []

  }
  lista  = [];
  private autoComplete = [];
  private _readOnly : boolean  = false;
  private _select : string  = "";

  private _placeHolder = 'Categorias*';

  private _generarInput = false

 @Input()
  set generarInput(_generarInput : boolean)
  {
    this._generarInput = _generarInput;
  }

  get generarInput() :boolean
  {
     return this._generarInput;
  }
  
  @Input()
  set placeHolder(_placeHolder : string)
  {
    this._placeHolder = _placeHolder;
  }

  get placeHolder() :string
  {
     return this._placeHolder;
  }


  @Input()
  set readOnly(readOnly : boolean)
  {
    this._readOnly = readOnly
  }

  get readOnly() :boolean
  {
     return this._readOnly;
  }

  @Input()
  set select(tag : string)
 {
 
  if(tag && tag!=="" && this.config.listCat.indexOf(tag) === -1)
  {
      this._select = tag;
      //this.lista.push(this._select)
      this.onAddTag(this._select);
      let aux = this.config.listCat ;
      this.config.listCat = [];
      this.config.listCat.push(...aux);

  }
   
 }
 
 get select () : string
 {
   return this._select;
 }

 @Input()
 set array(array : Array<string>)
{

  this._config.listCat = array || [];
}

get array () : Array<string>
{
  return this._config.listCat;
}
  @Input()
  set config(config : ConfigTags) {
    
      let vm=this;
      this._config =  config || {
      listCat  : [],
      listCatBusc : []
  
    };
    
    if(!this._config.listCatBusc)
    {
        this._config.listCatBusc = [];
    }

    if(!this._config.listCat)
    {
      this._config.listCat = [];
    }
    else if(this._generarInput){

      let aux : Array<string>= this._config.listCat;
      this._config.listCat =[]

      aux.forEach((e : string)=>{
        vm.onAddTag(e)

      })
    }
    



  }
 

@Output() onAdd = new EventEmitter<boolean>();

@Output() onSelect= new EventEmitter<string>();


public onSelectItem($event)
{
  let str = "";
  if($event)
  {

    str = isString($event) ? $event : $event.value;
  }

  this.onSelect.emit(str)
}
  get config(): ConfigTags { return this._config; }
   
 
  
  public onAdding(tag: AutoCompleteModel): Observable<AutoCompleteModel> {
    //const confirm = window.confirm('Do you really want to add this tag?');

    tag.display = tag.value;
    return of(tag);
}
  public requestAutocompleteItems = (text: string):  Observable<AutoCompleteModel[]> => {
    let p = new Promise<AutoCompleteModel[]>((resolve, reject) => {
      
   
      MethodsClass.call("getAutoCompleteList", text, (result)=>{
        resolve(result); 
      })
    });
        
    
        return from(p);

  };

  onTextChange($event)
  {
    let str = "";
    if($event)
    {

      str = isString($event) ? $event : $event.value;
    }
    this.autoComplete = [];
    MethodsClass.call("getAutoCompleteList", str, (result)=>{
      this.autoComplete = result;
    })
      console.log("onTextChange: " +str)
     
  }

  onAddTag($event)
  {
    let str = "";
    if($event)
    {
      str = isString($event) ? $event : $event.value;
      this._config.listCat.push(str)
      this._config.listCatBusc.push(new CategoriasPatronClass(str));

    }

    this.onAdd.emit(true);
      console.log("add: " +$event.value)
  }
 onRemoveTag($event)
  {
    let str ="";
    if($event)
    {
      str = isString($event) ? $event : $event.value;

    }

    let index = this._config.listCat.indexOf(str);
    this._config.listCat.splice(index, 1);
    this._config.listCatBusc.splice(index, 1);
/*  
    let array = ;

    for (let i = 0; i < array.length; i++) {
      const e : CategoriasPatronClass = array[i];

      if(e.equals(str))
      {
        array.splice(i, 1);
        break;
      }
      
    }*/
    this.onAdd.emit(true);
    console.log("remove: " +$event)
  }
  /*public requestAutocompleteItems = (text: string): Observable<Response> => {
    const url = `https://my.api.com/search?q=${text}`;
    return this.http
        .get(url)
        .map(data => data.json());
};*/

    constructor()
    {
       

        
    }


}
