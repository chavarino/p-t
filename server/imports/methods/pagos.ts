import { Meteor } from 'meteor/meteor';

import {PagosFn} from "./../libAux/pagos";
import { isUndefined } from 'util';
import { MethodsClass } from 'imports/functions/methodsClass';
import { ErrorClass } from 'imports/functions/errors';
import { ExceptClass } from '../libAux/erroresCod';
import  {secretshared} from '../libAux/sharedPass'
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

  async chargeQuantity(cantidad :number, secret : string) 
  {   
        this.unblock();

        check(cantidad, Number);
        check(secret, String);

        if(!isLogged())
        {
              MethodsClass.noLogueado();
        }


        if(secretshared !== secret)/// TODO COMPROBAR CON SECRETO.
        {
            MethodsClass.except(405 , modulo, "chargeQuantity : no permitido desde cliente" , "");
          
        }

        try {
          //actualizar metodo de pago default.
          await PagosFn.cargarCantidadToCustomer(cantidad);
          //console.log("saveMetodoPago ok  " )
         
      } catch (error) {
            //console.log("saveMetodoPago error")
            let errorClass : ExceptClass = error as ExceptClass;
            //TODO SI HUBIESE ALGUNO TRATAMIENTO DE ERROR A PARTIR DEl error del CODIGO.
            MethodsClass.except(500, modulo, "chargeQuantity :  Error al adjuntar metodo de pago.", errorClass.toString());
        
        }
    },
    async borrarMetodoPago() 
    {   
        this.unblock();
        if(!isLogged())
        {
            //MethodsClass.except(500, modulo, "borrarMetodoPago : No logueado" , "");
            MethodsClass.noLogueado();
        }

        try {
          //actualizar metodo de pago default.
          await PagosFn.borrarEntornoDePago();
          //console.log("saveMetodoPago ok  " )
         
      } catch (error) {
            //console.log("saveMetodoPago error")
            let errorClass : ExceptClass = error as ExceptClass;
            //TODO SI HUBIESE ALGUNO TRATAMIENTO DE ERROR A PARTIR DEl error del CODIGO.
            MethodsClass.except(500, modulo, "borrarMetodoPago :  Error al adjuntar metodo de pago.", errorClass.toString());
        
        }
    },
    async saveMetodoPago(payment_method :string)
    {

        
        this.unblock();
        
        check(payment_method, String);

        
        if(!isLogged())
        {
          MethodsClass.noLogueado();
          
        }

        if(isUndefined(payment_method)  || payment_method === "")
        {
             
            MethodsClass.except(500, modulo, "saveMetodoPago : payment_method nulo", "");
        }

        try {
            //actualizar metodo de pago default.
            await PagosFn.generarEntornoDePago(payment_method, Planes.PLAN_PRUEBA_STRIPE)
            //console.log("saveMetodoPago ok  " )
           
        } catch (error) {
              //console.log("saveMetodoPago error")
              let errorClass : ExceptClass = error as ExceptClass;
              //TODO SI HUBIESE ALGUNO TRATAMIENTO DE ERROR A PARTIR DEl error del CODIGO.
              MethodsClass.except(500, modulo, "saveMetodoPago :  Error al adjuntar metodo de pago.", errorClass.toString());
          
          }
       
    },
    async ejecutarPagoProfesor()
    {
        this.unblock();

        if(!isLogged())
        {
          MethodsClass.noLogueado();
          
        }
       
    },
    async getPayMethodInfo()
    {
        this.unblock();

        if(!isLogged())
        {
          MethodsClass.noLogueado();
          
        }
        

       
    }
    
});