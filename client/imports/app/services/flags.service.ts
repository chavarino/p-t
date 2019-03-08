import { Injectable } from '@angular/core';

import {Map} from "../../../../imports/models/map";


export interface modalObj {
    config : Map<any>,

    fn : Function

}

@Injectable({
  // we declare that this service should be created
  // by the root application injector.
  providedIn: 'root',
})
export class BanderasService {

   
    private modal : modalObj;

    


    contructor()
    {
        this.setModalConfig({

            config : {
                title : "",
                msg : "",
                tipo : -1
            },
            fn : function()
            {

            }
        })
    }

    setModalConfig(modal : modalObj)
    {
        if(modal === null)
        {
            return;
        }
        this.modal = modal;
    }
    
    getModalConfig()
    {
        return this.modal;
    }
    
}


/*


let keys: keyof Map<number>; // string
let value: Map<number>['foo']; // numb*/