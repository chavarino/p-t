import { Customer, PerfilPagos } from 'imports/models/perfilPagos.model';
import { async } from '@angular/core/testing';
import { PerfilPagosColl } from 'imports/collections/perfilPagos.collection';

export enum COD_ERROR 
{
    GENERIC = "Generico - ",
    PARAM ="Parametros incorrectos - ",
    

}


let api_key = 'sk_test_wFBgb0r4Kv2YgY5EIWEVsaYb00KkSnycJv';
const stripe = require('stripe')(api_key);



  
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
     const chargeAmountToCustomer = async (idSubItem, obj ) =>
    {
      
            const res = await stripe.subscriptionItems.createUsageRecord(
              idSubItem,
              {
                
                quantity: obj.quantity,
                timestamp: /*1522893428*/Math.floor((new  Date).getTime()/1000),
                action: obj.action || "increment"
                
              }/*,{
                idempotency_key: "4pNfq2rEopfe3xsX2" // TODOOOOOOO generar por V4 UUIDs,
                
              }*/
            );

            return res;
    }
     const attachSucriptionToCustomer = async (idCustomer, idPlan) =>
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
    
    

    const borrarEntornoDePago = async ( ) =>
    {
     
      let perfilPago : PerfilPagos = PerfilPagosColl.findOne({idCliente: Meteor.userId() })

      if(!perfilPago || !perfilPago.idSuscription || !perfilPago.idPayment_method)
      {
        throw COD_ERROR.PARAM + " ";

      }
      // NO PERMITIR BORRAR TARJETA SI HAY UN PAGO POR MEDIO.
      await removeSus(perfilPago.idSuscription);
      perfilPago.idSuscription=undefined;
      perfilPago.idSusRecord =undefined;
      
      await removeCardFromCustomer(perfilPago.idPayment_method) // borramos el emtodo de pago.
      perfilPago.idPayment_method = undefined;
      perfilPago.customer.invoice_settings.default_payment_method = undefined;
      perfilPago.customer = await updateCustomer(perfilPago.customer);

      PerfilPagosColl.update({_id:perfilPago._id }, {$set : perfilPago});
    }




    const generarEntornoDePago = async (payment_method, idPlan) =>
    {
        
            
      let perfilPago : PerfilPagos = PerfilPagosColl.findOne({idCliente: Meteor.userId() })
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
        c = await  PagosFn.crearCustomer(c, payment_method);
        
        
        let sus = await attachSucriptionToCustomer(c.id,idPlan);
    
        
         perfilPago  = {
          idSuscription : sus.id,
          idSusRecord : sus.items.data[0].id,
          idPLan : idPlan,
          customer : c,
          idCliente: Meteor.userId(),
          idPayment_method : payment_method,
          lastCharge : {
          },
          view : {

          }
          
        }

        PerfilPagosColl.insert(perfilPago);
      }
      else{
          //ACTUALIZACION DE CUSTOMER Y METODO DE PAGO
        if(perfilPago.idPayment_method)
        {
          
          // añadimos el metodo de pago al customer Poir si falla
          await attachPayMethodToCustomer(payment_method, perfilPago.customer.id);
          // si existe metodo de pago, lo borramos y le añadimos el nuevo. 
          
          await removeCardFromCustomer(perfilPago.idPayment_method) // borramos el emtodo de pago.
         
          perfilPago.idPayment_method = payment_method;
          perfilPago.customer.invoice_settings.default_payment_method = payment_method;
          perfilPago.customer = await updateCustomer(perfilPago.customer)

          //PerfilPagosColl.insert(perfilPago);
          
         // console.log(JSON.stringify(input));
        }

       
        if(!perfilPago.idSuscription)
        {
          let sus = await attachSucriptionToCustomer(perfilPago.customer.id,idPlan);

          perfilPago.idSuscription = sus.id;
          perfilPago.idSusRecord = sus.items.data[0].id;
        }
        
        PerfilPagosColl.update({_id:perfilPago._id }, {$set : perfilPago});







      }

      
    }

    export  const PagosFn = {crearCustomer,setupIntent, getAllCardsFromCustomer,
             removeCardFromCustomer, removeCustomer, getCustomer, getPlanesCobro,
             attachSucriptionToCustomer, chargeAmountToCustomer, getSuscriptionItem, removeSus,
             getCustomerInvoices, getInvoice,   attachPayMethodToCustomer, detachPayMethodToCustomer,updateCustomer,
              generarEntornoDePago, borrarEntornoDePago, getUsage};