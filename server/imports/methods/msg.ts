import { Meteor } from 'meteor/meteor';
import { Error } from '../../../imports/functions/errors'
import { Msg } from '../../../imports/collections/msg';
import { Message } from '../../../imports/models/message';

Meteor.methods({
  
    sendMsg(msg : Message)
    {

        if(!Meteor.user())
        {  
            Error.noLogueado();
          }

        if(!msg || msg ===null || msg.to === null || msg.from === null || msg.msgTipo ===null)
        {
            Error.camposInsuficientes();
        }


        Msg.insert(msg);
    },
    borrarMsg(id : string)
    {
        //solo pueden borrar mensaje los receptores

        if(!Meteor.user())
        {  
            Error.noLogueado();
          }
          
       let message :Message=  Msg.findOne({_id : id});

       if(!message || message.to !== Meteor.userId())
       {
            Error.noPermisos();
       }

       Msg.remove(id)
    },
    setReaded(id : string) {

        
        let filter = {
          "_id": id
        };
        let input : any = {$set : { readed : true}}
        //validar TODO
        
        console.log(filter + ", " + input)
        Msg.update(filter, input);
      },
    borrarAllMsg()
    {
        //Borramos todos nuestro mensajes de entrada

        if(!Meteor.user())
        {  
            Error.noLogueado();
          }

       

       Msg.remove({to : Meteor.userId()})
    }
})
