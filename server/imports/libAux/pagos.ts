import { Customer, PerfilPagos } from 'imports/models/perfilPagos.model';
import { async } from '@angular/core/testing';
import { PerfilPagosColl } from 'imports/collections/perfilPagos.collection';
import { COD_ERROR, ExceptClass} from "../libAux/erroresCod"
import { MethodsClass } from 'imports/functions/methodsClass';
import { isUndefined } from 'util';


let api_key =  Meteor.isProduction ? 'sk_test_wFBgb0r4Kv2YgY5EIWEVsaYb00KkSnycJv'
    :'sk_test_wFBgb0r4Kv2YgY5EIWEVsaYb00KkSnycJv';

const stripe = require('stripe')(api_key);
const uuidv4 = require('uuid/v4');


const modulo = "PagosStripeModule"
stripe.setMaxNetworkRetries(3);

  
    const attachPayMethodToCustomer = async (idPM :string , cId :string )  => {
      return await stripe.paymentMethods.attach(idPM, {customer: cId});
    }  
    const detachPayMethodToCustomer = async (idPM :string  )  => {
      return await stripe.paymentMethods.detach(idPM);
    } 
        
   const updateCustomer = async (c : Customer) => {

     return await stripe.customers.update(c.id, c);
   }




    const crearCustomer = async (c : Customer, payment_method: string) =>
    {
        //this.unblock();
        const customer = await stripe.customers.create({
            email: c.email,
            payment_method : payment_method/*,
            default_source : c.payment_method*/

            //source: 'src_18eYalAHEMiOZZp1l9ZTjSU0',
          });
          /*await stripe.customers.update(customer.id, {
          
            default_source : c.payment_method

            //source: 'src_18eYalAHEMiOZZp1l9ZTjSU0',
          });*/

        return customer;  
    }
     const getCustomer = async (id :string) =>
     {
         //this.unblock();
         const customer = await stripe.customers.retrieve(
         id);
 
         return customer;  
     }
    //setupIntent para crear el metodo de pago y guardar tarjeta.
     const setupIntent = async () =>
    {
            const setupIntent = await stripe.setupIntents.create({})
            return setupIntent.client_secret;  
        }


    //setupIntent para crear el metodo de pago y guardar tarjeta.

  const getCard = async (idCustomer) =>
    {

        
           const customers =  
           stripe.paymentMethods.list(
            {customer: idCustomer, type: 'card'});
           
           /*await stripe.customers.listSources(
                idCustomer,
                {
                  limit: 3,
                  object: 'card',
                });*/
            return customers;  
        }

        const getPMethod = async (idPM) =>
        {
    
            
               const pm =  
               await stripe.paymentMethods.retrieve(
                idPM
              );
                return pm;  
            }

     const getAllCardsFromCustomer = async (idCustomer) =>
    {

        
           const customers =  
           await stripe.paymentMethods.list(
            {customer: idCustomer, type: 'card'});
           
           /*await stripe.customers.listSources(
                idCustomer,
                {
                  limit: 3,
                  object: 'card',
                });*/
            return customers;  
        }
    //setupIntent para crear el metodo de pago y guardar tarjeta.
     const removeCardFromCustomer = async (idPayMethod) =>
    {
            const res = await 
              stripe.paymentMethods.detach(
                idPayMethod
            );
            
          

            return res;
    }
     //setupIntent para crear el metodo de pago y guardar tarjeta.
      const removeCustomer = async (idCustomer) =>
     {
           const res = await  stripe.customers.del(
            idCustomer
                );
         }

    //setupIntent para crear el metodo de pago y guardar tarjeta.
     const getPlanesCobro = async () =>
    {
            const res = await stripe.plans.list(
                {limit: 3}
              );

            return res;
    }

         const getSuscriptionItem = async (idSub ) =>
    {
      
            const res = await stripe.subscriptionItems.list(
              {subscription: idSub}
            );

            return res;
    }

    interface Charge {
      quantity : number,
      timestamp ?: number,
      action ?: string
    }
    const chargeAmountToCustomer = async (idSubItem, obj : Charge, idempotency_key :string ) =>
    {
      
            const res = await stripe.subscriptionItems.createUsageRecord(
              idSubItem,
              {
                
                quantity: obj.quantity,
                timestamp: /*1522893428*/Math.floor((new  Date).getTime()/1000),
                action: obj.action || "increment"
                
              },{
                idempotency_key: idempotency_key || undefined // TODOOOOOOO generar por V4 UUIDs,
                
              }
            );
            
            
            return res;
    }



     const attachSuscriptionToCustomer = async (idCustomer, idPlan) =>
    {
      //TODO IMPORTANTE GUARDAR EL ID DE LA SUSCRIPCION CREADA
            const res = await stripe.subscriptions.create({
              customer: idCustomer,
              items: [
                {
                  plan: idPlan,
                  // quantity: 1 (PARA SUSCRIPCIONES FIJAS.)
                },
              ]/*,
              default_payment_method : idPM*/
            }
            );

            return res;
    }




    const removeSus  = async (idSus) =>
    {
      //TODO IMPORTANTE GUARDAR EL ID DE LA SUSCRIPCION CREADA
            const res = await stripe.subscriptions.del(
              idSus,
              {
                invoice_now : true
              });

            return res;
    }

     const getCustomerInvoices = async (idCustomer) =>
    {
      //TODO IMPORTANTE GUARDAR EL ID DE LA SUSCRIPCION CREADA
            const res = await stripe.invoices.retrieveUpcoming(
              {customer: idCustomer}
            );

            return res;
    }


     const getInvoice = async (id) =>
    {
      //TODO IMPORTANTE GUARDAR EL ID DE LA SUSCRIPCION CREADA
            const res = await stripe.invoices.retrieve(
              id
            );

            return res;
    }
    const getUsage = async (id) =>
    {
      //TODO IMPORTANTE GUARDAR EL ID DE LA SUSCRIPCION CREADA
            const res = await stripe.usageRecordSummaries.list(
              id,
              {limit: 10}
            );
            return res;
    }
    
    const setBlockedUpd = ( id: string, blocked : boolean, jsonCampos ?: any) =>
    {
      let jsonIn; 
      if(jsonCampos)
      {
        jsonIn =jsonCampos
        jsonIn.blocked = blocked;
      }
      else{
        jsonIn = {
           blocked
         }
      }

      PerfilPagosColl.update({_id:id }, {$set : jsonIn});
    }
    
    const borrarEntornoDePago = async ( ) =>
    {
     
      
      // Te permite BORRAR suscripcion si hay pago
      //pero no borra la tarjeta ahora mismo
      let uso = 0;

      //obtenemos perfil de pagos
      let perfilPago : PerfilPagos = PerfilPagosColl.findOne({idCliente: Meteor.userId() })
      
      try {
        //Combprobamos que este correcto los perfiles.
        if(!perfilPago || !perfilPago.idSuscription || !perfilPago.idPayment_method)
        {
          throw  new ExceptClass(COD_ERROR.PARAM_IN);
        }
        // comprobamos si está bloqueado el perfil (Si esta en uso)
        if(perfilPago.blocked)
        {
          throw  new ExceptClass(COD_ERROR.BLOCKED);
        }
        
        //bloqueamos el perfil.
        setBlockedUpd(perfilPago._id, true);

        try {
          //obtenemos si hay algun cargo pendiente.
            let res = await getUsage(perfilPago.idSusRecord);
  
            uso =res.data[0].total_usage;
        } catch (error) {
          throw  new ExceptClass(COD_ERROR.USAGE_GET, error);
        }
  
        try {
          await removeSus(perfilPago.idSuscription);
          perfilPago.idSuscription=undefined;
          perfilPago.idSusRecord =undefined;
        } catch (error) {
          throw  new ExceptClass(COD_ERROR.SUS_REMOVE, error);
        }
        // si no hay ningun cargo entonces borramos las tarjetas.
        if(uso === 0)
        {
          try {
            await removeCardFromCustomer(perfilPago.idPayment_method) // borramos el método de pago.
            perfilPago.customer.invoice_settings.default_payment_method = undefined;
            perfilPago.customer = await updateCustomer(perfilPago.customer);
           
            
          } catch (error) {
            
            //lo borramos
            MethodsClass.logError(modulo, (new ExceptClass(COD_ERROR.MP_CARD_REMOVE, error)).toString(),
             Meteor.userId());
            //throw  new ExceptClass(COD_ERROR.MP_CARD_REMOVE, error);
          }
        }

        // borramos las referencias.
        perfilPago.idSusRecord = undefined;
        perfilPago.idSuscription = undefined;
        perfilPago.idPayment_method = undefined;
        /*else{
          TODO mirar a ver lo de estar guardando la anterior tarjeta
  
          const perfilPagoConst : PerfilPagos = perfilPago;
  
          Meteor.setTimeout(async () =>{
  
          }, )
          perfilPago.idPayment_method = undefined;
          perfilPago.customer.invoice_settings.default_payment_method = undefined;
          perfilPago.customer = await updateCustomer(perfilPago.customer);
  
        }*/
          
        //actualizamos el objecto
        console.log("Metodo de pago borrado, actualizacndo perfil " + JSON.stringify(perfilPago))
        PerfilPagosColl.update({_id:perfilPago._id }, perfilPago);
      } catch (error) {
          throw error;
      }
      finally{
        // El bloque lo libera.
        setBlockedUpd(perfilPago._id, false)
      }
    }

    const cargarCantidadToCustomer= async (cantidad : number) =>
    {
      let perfilPago : PerfilPagos = PerfilPagosColl.findOne({idCliente: Meteor.userId() })


      
      let idempotency_key : string;
      try {
        //Combprobamos que este correcto los perfiles.

        
        
        if(isUndefined(cantidad) ||  isUndefined(perfilPago) 
        || isUndefined(perfilPago.idSusRecord) || isUndefined(perfilPago.idSuscription)
        || isUndefined(perfilPago.idPayment_method)
        || isUndefined(perfilPago.customer.invoice_settings.default_payment_method)  )
        {

          throw  new ExceptClass(COD_ERROR.PARAM_IN, JSON.stringify(perfilPago));
        }
        //si la cantidad es cero no se carga nada pero no habria error.
        if(cantidad===0)
        {
          return;
        }
        //bloqueamos el perfil.
        setBlockedUpd(perfilPago._id, true);

        let charge : Charge = {
          quantity : cantidad
        }


       idempotency_key  = perfilPago.lastCharge.idempotency_key || uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

       await chargeAmountToCustomer(perfilPago.idSusRecord, charge, idempotency_key)

       idempotency_key = undefined;  
      } catch (error) {
        throw  new ExceptClass(COD_ERROR.CHARGE_NEW, error);
      }
      finally{
        // El bloque lo libera.
        
        let jsonIn;
        if(perfilPago.lastCharge.idempotency_key !== idempotency_key)
        {
          perfilPago.lastCharge.idempotency_key = idempotency_key;
          jsonIn = {

            lastCharge : perfilPago.lastCharge
          }
        }
        else{
          jsonIn = undefined;
        }
        
        setBlockedUpd(perfilPago._id, false, jsonIn)
      }

    }


    const generarEntornoDePago = async (payment_method, idPlan) =>
    {
        
            
      let perfilPago : PerfilPagos = PerfilPagosColl.findOne({idCliente: Meteor.userId() })

      try {

        //Combprobamos que este correcto los perfiles.
        if(!payment_method || !idPlan)
        {
            throw  new ExceptClass(COD_ERROR.PARAM_IN);
        }


        //existe ya el customer?  si no existe se crea 
        if(!perfilPago)
        {
          // CREACION DE CUSTOMER Y METODO DE PAGO
          let c :Customer = {
            invoice_settings : {
              default_payment_method : payment_method
            },
            email : Meteor.user().emails[0].address
          }
  
          try {
            c = await  PagosFn.crearCustomer(c, payment_method);
            
          } catch (error) {
            throw  new ExceptClass(COD_ERROR.CUSTOMER_CREATE, error);
          }
          
          
          let sus;
          try {
            sus = await attachSuscriptionToCustomer(c.id, idPlan);
            
          } catch (error) {
            
            // si falla el suscription  borramos el customer
            await removeCustomer(c.id);

            throw  new ExceptClass(COD_ERROR.SUS_CREATE, error);
          }
          // creamos el objeto.
           perfilPago  = {
            blocked : false,
            idSuscription : sus.id,
            idSusRecord : sus.items.data[0].id,
            idPLan : idPlan,
            customer : c,
            idCliente: Meteor.userId(),
            idPayment_method : payment_method,
            lastCharge : {
            },
            view : {
               hasMthPago : !!payment_method
            }
            
          }
          //insertamos el perfil.
          PerfilPagosColl.insert(perfilPago);
        }
        else{
          //ACTUALIZACION DE CUSTOMER Y METODO DE PAGO
          //bloqueamos el perfil.
          setBlockedUpd(perfilPago._id, true);

          if(perfilPago.idPayment_method!==payment_method)
          {
            
            /// si tiene metodo de pago lo actualizamos.
            try {
              // añadimos el metodo de pago al customer Poir si falla
              await attachPayMethodToCustomer(payment_method, perfilPago.customer.id);
              
            } catch (error) {
              throw  new ExceptClass(COD_ERROR.MP_ATTACH, error);
            }
  
            const idMPAnterior = perfilPago.idPayment_method;
            perfilPago.idPayment_method = payment_method;
  
            
            /// actualizamos el emtodo de pago por defecto.
            try {
              
              perfilPago.customer.invoice_settings.default_payment_method = payment_method;
              perfilPago.customer = await updateCustomer(perfilPago.customer);
              
            } catch (error) {
              // borramos el metodo de pago nuevo que ha sido añadido
              await removeCardFromCustomer(perfilPago.idPayment_method)
              throw  new ExceptClass(COD_ERROR.CUSTOMER_UPDATE, error);        
            }
            
            //por ultimo si hay metodo de pago anterior, lo borramos.
            if(idMPAnterior)
            {
              // si existe metodo de pago, lo borramos y le añadimos el nuevo. 
              try {
                // borramos el meteodo de pago anterior.
                await removeCardFromCustomer(idMPAnterior) // borramos el emtodo de pago.
              
              } catch (error) {              
                MethodsClass.logError(modulo, (new ExceptClass(COD_ERROR.MP_CARD_REMOVE, error)).toString(),
                Meteor.userId());
              }
              
            }

          }
  
         
          if(!perfilPago.idSuscription)
          {

            let sus;
            try {
              sus = await attachSuscriptionToCustomer(perfilPago.customer.id,idPlan);
              perfilPago.idSuscription = sus.id;
              perfilPago.idSusRecord = sus.items.data[0].id;
              
            } catch (error) {
              // si falla el suscription.
              perfilPago.idSuscription = undefined;
              perfilPago.idSusRecord = undefined;

              MethodsClass.logError(modulo, (new ExceptClass(COD_ERROR.MP_CARD_REMOVE, error)).toString(),
                Meteor.userId());
            }
  
          }
       
          PerfilPagosColl.update({_id:perfilPago._id }, {$set : perfilPago});

        }
        
      } catch (error) {
        throw error;
      }
      finally{
        // El bloque lo libera.
        setBlockedUpd(perfilPago._id, false, {})
      }

    }

    const pago = async (payment_method, idPlan) =>
    {

    }
    
    export  const PagosFn = Meteor.isServer ? {crearCustomer,setupIntent, getAllCardsFromCustomer,
             removeCardFromCustomer, removeCustomer, getCustomer, getPlanesCobro,
             attachSuscriptionToCustomer, chargeAmountToCustomer, getSuscriptionItem, removeSus,
             getCustomerInvoices, getInvoice,   attachPayMethodToCustomer, detachPayMethodToCustomer,
             updateCustomer, generarEntornoDePago, borrarEntornoDePago, getUsage, cargarCantidadToCustomer, getPMethod} : {};