import { Meteor } from 'meteor/meteor';

import {PagosFn} from "./../libAux/pagos";
import { isUndefined } from 'util';
import { MethodsClass } from 'imports/functions/methodsClass';
import { ErrorClass } from 'imports/functions/errors';
import { ExceptClass } from '../libAux/erroresCod';
import  {secretshared} from '../libAux/sharedPass'
import { PerfilPagos, PublicPerfilPagos } from 'imports/models/perfilPagos.model';
import { PerfilPagosColl } from 'imports/collections/perfilPagos.collection';
import { Room } from 'imports/models/room';
import { Rooms } from 'imports/collections/room';
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

  async chargeQuantity(cantidad :number, idUser : string, secret : string, ipComprador ?:string) // cantidad de dinero.
  {   
        this.unblock();

        check(cantidad, Number);
        check(secret, String);
        check(idUser, String);

        console.log(`idUser: ${idUser}, cantidad : ${cantidad}, secret: ${secret}`)
        if(!isLogged())
        {
              MethodsClass.noLogueado();
        }


        if(secretshared !== secret)/// TODO COMPROBAR CON SECRETO.
        {
            MethodsClass.except(405 , modulo, "chargeQuantity : no permitido desde cliente" , "");
          
        }
        
          try {
              //intentamos 3 veces cargar y sino error
              // una unidad son 0.001 €
            await PagosFn.cargarCantidadToCustomer(cantidad, idUser, ipComprador);
           
        } catch (error) {

           
              let errorClass : ExceptClass = error as ExceptClass;
              //TODO SI HUBIESE ALGUNO TRATAMIENTO DE ERROR A PARTIR DEl error del CODIGO.
              MethodsClass.except(500, modulo, "chargeQuantity :  Error al adjuntar metodo de pago.", errorClass.toString());
             
            
              //console.log("saveMetodoPago error")
          
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
          return "OK"
         
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
            return "OK"
           
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
    async setupPayMethod()
    {
        this.unblock();

        if(!isLogged())
        {
          MethodsClass.noLogueado();
          
        }

       return  await PagosFn.setupIntent();
       
    },
    async getPayMethodInfo()
    {
        this.unblock();

        if(!isLogged())
        {
          MethodsClass.noLogueado();
          
        }
        let res : PublicPerfilPagos = {
          hasMthPago: false,
          tarjetaView : ""
        }
        try {

          let perfilPago : PerfilPagos = PerfilPagosColl.findOne({idCliente: Meteor.userId() })
          if(!perfilPago || !perfilPago.customer || !perfilPago.customer.id || !perfilPago.idPayment_method )
          {
          }
          else{
            let resMethod = await PagosFn.getPMethod(perfilPago.idPayment_method)
            res.tarjetaView = `**** **** **** ${ resMethod.card.last4}`;
            res.hasMthPago = true;
            let mes = (resMethod.card.exp_month) % 12 +1;
            let year = resMethod.card.exp_month===1 ? (resMethod.card.exp_year +1) : resMethod.card.exp_year;
            
            res.isExpired = (new Date()).getTime() >=   (new Date(`${year}-${mes}-1`)).getTime(); 
            /* "exp_month": 8,
            "exp_year": 2020,*/
          }
        
          return res
          
        } catch (error) {
            return res;
        }
    }
    
});