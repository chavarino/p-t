import { Meteor } from 'meteor/meteor';
import { MethodsClass } from '../../../imports/functions/methodsClass'
import { Msg } from '../../../imports/collections/msg';
import { Message } from '../../../imports/models/message';

Meteor.methods({
  
    sendMsg(msg : Message)
    {

        if(!Meteor.user())
        {  
            MethodsClass.noLogueado();
          }

        if(!msg || msg ===null || msg.to === null || msg.from === null || msg.msgTipo ===null)
        {
            MethodsClass.camposInsuficientes();
        }

        msg.fecha = new Date();
        Msg.insert(msg);
    },
    borrarMsg(id : string)
    {
        //solo pueden borrar mensaje los receptores

        if(!Meteor.user())
        {  
            MethodsClass.noLogueado();
          }
          console.log("MENSAJE ID " +id );  
       let message :Message=  Msg.findOne({_id : id});
       console.log("mensjae a borrar " +JSON.stringify(message))
       if(!message || message.to !== Meteor.userId())
       {
            MethodsClass.noPermisos();
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
            MethodsClass.noLogueado();
          }

       

       Msg.remove({to : Meteor.userId()})
    }
})
