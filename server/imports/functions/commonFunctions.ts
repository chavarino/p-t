import {Message, MessageRtc, MsgTipo} from "../../../imports/models/message"

import {MapN} from "../../../imports/models/map";
export class Msg {

    msgsIn : Message[] = []
    //METER EL OBSERVABLE de  MENSAJES
    constructor()
    {

    }

    borrarMsgs()
    {

    }

    readMsgs(fns : MapN<()=>void>) {
        
        let vm = this;
        
        vm.msgsIn.forEach(function(m : Message)
        {
            if(m)
             {
                 let fn : ()=>void = fns[m.msgTipo]
                 if(fn)
                 {
                     fn();
                 }
             }


        })
        
    }
}