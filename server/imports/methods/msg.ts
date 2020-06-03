import { Meteor } from 'meteor/meteor';
import { MethodsClass } from '../../../imports/functions/methodsClass'
import { Msg } from '../../../imports/collections/msg';
import { Message } from '../../../imports/models/message';
let isLogged = () : boolean=>
{
  return !!Meteor.userId();
}
Meteor.methods({
  
    sendMsg(msg : Message)
    {

        if(!isLogged())
        {  
            MethodsClass.noLogueado();
          }
        
        if(!msg || msg ===null || msg.to === null || /*msg.from === null ||*/ msg.msgTipo ===null)
        {
            MethodsClass.camposInsuficientes();
        }
        msg.from = Meteor.userId();
        msg.fecha = new Date();
        return Msg.insert(msg);
    },
    borrarMsg(id : string)
    {
        //solo pueden borrar mensaje los receptores
        check(id, String)

        if(!isLogged())
        {  
            MethodsClass.noLogueado();
        }

         // console.log("MENSAJE ID " +id );  
       let message :Message=  Msg.findOne({_id : id});
        if( !message  || !message.to )
        {

          return -1;
        }
       //console.log("mensjae a borrar " +JSON.stringify(message))
       if(!message || message.to !== Meteor.userId())
       {
            MethodsClass.noPermisos();
       }

       return Msg.remove(id).toPromise()
    },
    setReaded(id : string) {

        check(id, String);

        if(!isLogged())
        {
              MethodsClass.noLogueado();
        }
        let filter = {
          "_id": id
        };
        let input : any = {$set : { readed : true}}
        //validar TODO

        let message :Message=  Msg.findOne({_id : id});
       
        //console.log("mensjae a borrar " +JSON.stringify(message))
        if(!message || message.to !== Meteor.userId())
        {
              MethodsClass.noPermisos();
        }
        
       // console.log(filter + ", " + input)
        Msg.update(filter, input);
      },
    borrarAllMsg()
    {
        //Borramos todos nuestro mensajes de entrada

        if(!isLogged())
        {    console.log("borrarAllMsg : no logueado")
            return;
            //MethodsClass.noLogueado();
          }

       

       Msg.remove({to : Meteor.userId()})
    }
})
