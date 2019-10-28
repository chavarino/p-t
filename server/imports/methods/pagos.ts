import { Meteor } from 'meteor/meteor';

import {PagosFn} from "./../libAux/pagos";
import { isUndefined } from 'util';

 enum Planes {
  PLAN_PRUEBA_STRIPE = "P_PruebaCobro"

 }

let isLogged = () : boolean=>
{
  return !!Meteor.userId();
}
const modulo = "PagosMethods"
/*

 MethodsClass.except(500, modulo, "calcularElo : " + error, logPrivate);*/

Meteor.methods({

    async getInitPagoKey() 
    {   
        this.unblock();
        PagosFn.setupIntent()

        try {

            let result = await PagosFn.setupIntent()


            /*const result = HTTP.call('GET', 'http://api.twitter.com/xyz', {
              params: { user: userId }
            });*/
            console.log("setupIntent ok  " + result)
            return result;
          } catch (e) {
              console.log("setupIntent error")
            // Got a network error, timeout, or HTTP error in the 400 or 500 range.
            return null;
          }
    },
    async saveMetodoPago(payment_method :string)
    {

        
        this.unblock();
        
        
        try {
          if(!isLogged)
          {
              throw "No logueado"
            }
            if( isUndefined(payment_method) )
            {
              throw "payment_method nulo"
            }
            //actualizar metodo de pago default.
            await PagosFn.generarEntornoDePago(payment_method, Planes.PLAN_PRUEBA_STRIPE)
            console.log("saveMetodoPago ok  " )
            return true;
          } catch (e) {
              console.log("saveMetodoPago error")
            
            return false;
          }
        // 
        // crear customer
    }
    /*  
         retornar intento metodo id =>> en front obtiene datos


    */
});