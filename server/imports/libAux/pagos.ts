let api_key = 'sk_test_wFBgb0r4Kv2YgY5EIWEVsaYb00KkSnycJv';
const stripe = require('stripe')(api_key);

   
        interface Customer {
            email : string
            
            payment_method : string
        }
   
    /***
     *  Crea un customer en la plataforma stripe
     * 
     *  c : objecto Customer, actuqalmente solo teine email y el metodo de pago.
     */
   const crearCustomer = async (c : Customer) =>
    {
        //this.unblock();
        const customer = await stripe.customers.create({
            email: c.email,
            payment_method : c.payment_method/*,
            default_source : c.payment_method*/

            //source: 'src_18eYalAHEMiOZZp1l9ZTjSU0',
          });
          /*await stripe.customers.update(customer.id, {
          
            default_source : c.payment_method

            //source: 'src_18eYalAHEMiOZZp1l9ZTjSU0',
          });*/

        return customer;  
    }
    const getCustomer = async (c : Customer) =>
    {
        //this.unblock();
        const customer = await stripe.customers.create({
            email: c.email,
            payment_method : c.payment_method
            //source: 'src_18eYalAHEMiOZZp1l9ZTjSU0',
          });

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
              },{
                idempotency_key: "4pNfq2rEopfe3xsX2" // TODOOOOOOO generar por V4 UUIDs,
                
              }
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
              ]
            }
            );

            return res;
    }




   const removeSus  = async (idSus) =>
    {
      //TODO IMPORTANTE GUARDAR EL ID DE LA SUSCRIPCION CREADA
            const res = await stripe.subscriptions.del(idSus);

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

    module.exports = {crearCustomer,setupIntent, getAllCardsFromCustomer,
             removeCardFromCustomer, removeCustomer, getCustomer, getPlanesCobro,
             attachSucriptionToCustomer, chargeAmountToCustomer, getSuscriptionItem, removeSus,
             getCustomerInvoices};