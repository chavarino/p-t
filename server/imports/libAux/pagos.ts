import { Customer, PerfilPagos, IpsInterface } from 'imports/models/perfilPagos.model';
import { async } from '@angular/core/testing';
import { PerfilPagosColl } from 'imports/collections/perfilPagos.collection';
import { COD_ERROR, ExceptClass} from "../libAux/erroresCod"
import { MethodsClass } from 'imports/functions/methodsClass';
import { isUndefined } from 'util';
import { isDefined } from '@angular/compiler/src/util';
import { SecretServices, test } from './sharedPass';
import { FactoryCommon } from 'imports/functions/commonFunctions';

const precioUnidad = 0.001;
let api_key =  Meteor.isProduction ? SecretServices.prod.stripe.secret
    : SecretServices.dev.stripe.secret;

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
        
   const updateCustomer = async (id:string, c : Customer) => {

     return await stripe.customers.update(id, c);
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
                timestamp: Math.floor((new  Date).getTime()/1000),
                action: obj.action || "increment"
                
              },{
                idempotency_key: idempotency_key || undefined ,
                
              }
            );
            
            
            return res;
    }



     const attachSuscriptionToCustomer = async (idCustomer, idPlan, idPM) =>
    {
      //TODO IMPORTANTE GUARDAR EL ID DE LA SUSCRIPCION CREADA
            const res = await stripe.subscriptions.create({
              customer: idCustomer,
              items: [
                {
                  plan: idPlan,
                  // quantity: 1 (PARA SUSCRIPCIONES FIJAS.)
                },
              ],
              default_payment_method : idPM
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

      /*let perfilPago : PerfilPagos = PerfilPagosColl.findOne({idCliente: Meteor.userId() })
      if(perfilPago)
      {
        console.log("Bloqueo antes ? :" + perfilPago.blocked);

      }*/
      PerfilPagosColl.update({_id:id }, {$set : jsonIn});
      /*perfilPago  = PerfilPagosColl.findOne({idCliente: Meteor.userId() })

      if(perfilPago)
      {
        console.log("Bloqueo antes ? :" + perfilPago.blocked);

      }*/

    }
    

    const getCustomerByEmail = async (email ) =>
    {
      const res = await stripe.customers.list(
        {limit: 1}
      );

      return res.data[0];
    }
    const borrarEntornoDePago = async ( ) =>
    {
     
      
      // Te permite BORRAR suscripcion si hay pago
      //pero no borra la tarjeta ahora mismo
      let uso = 0;

      //obtenemos perfil de pagos
      const perfilPago : PerfilPagos = PerfilPagosColl.findOne({idCliente: Meteor.userId() })
      
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
           // perfilPago.customer.invoice_settings.default_payment_method = undefined;
            let  cUpdate : Customer = {
              invoice_settings : {
                default_payment_method : undefined
              }
            }

            perfilPago.customer = await updateCustomer(perfilPago.customer.id,cUpdate);
            
           
            
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



    /**
     * 
     * @param cantidad cantidad a cargar en euros.
     * @param precioUnidadIn precio por unidad €/unidad
     */
    const cargarCantidadToCustomer= async (cantidad : number, userId:string, idProducto: String, ips:IpsInterface, precioUnidadIn ?: number) =>
    {

      //MIRAR LO DEL USUARIO ID IGUAL ESTÄ MAL QUIEN PAGA.
      let vm=this;
      const perfilPago : PerfilPagos = PerfilPagosColl.findOne({idCliente: userId })
      //cantidad es en euros
      precioUnidadIn =  isUndefined(precioUnidadIn) ?  precioUnidad : precioUnidadIn;
      let pagado = false;
      let idempotency_key : string;
      let error: ExceptClass;
      //Combprobamos que este correcto los perfiles.
      if(isUndefined(cantidad) ||  isUndefined(perfilPago) 
      || isUndefined(perfilPago.idSusRecord) || isUndefined(perfilPago.idSuscription)
      || isUndefined(perfilPago.idPayment_method)
      || isUndefined(perfilPago.customer.invoice_settings.default_payment_method)  )
      {
        
        throw  new ExceptClass(COD_ERROR.PARAM_IN, JSON.stringify(perfilPago));
      }
     
      //se intentara 2 veces cobrar (solo en caso que falle)
      //guardamos cantida de euros a deber + lo que debia de anteriormente 
          perfilPago.lastCharge.cantidad = cantidad+ (perfilPago.lastCharge.cantidad || 0);
          //si la cantidad es cero no se carga nada pero no habria error.
          if(perfilPago.lastCharge.cantidad===0)
          {
            return;
          }
          for (let index = 0;; index++) {
            
            try {
              
                  
                  //bloqueamos el perfil.
                  setBlockedUpd(perfilPago._id, true);
                  
                  
                  // se genera la key de transaccion
                  // cargamos la cantidad (precio a cobrar / numerio de unidades)
                  idempotency_key  = perfilPago.lastCharge.idempotency_key || uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
                    let charge : Charge = {
                      quantity : FactoryCommon.roundXDecs(perfilPago.lastCharge.cantidad,2) /precioUnidadIn // cargamos la cantidad de unidades a cobrar
                    }
           
            console.log(`idSusRecord=${perfilPago.idSusRecord}, Charge=${JSON.stringify(charge)}, idempotency_key=${idempotency_key}` )
            await chargeAmountToCustomer(perfilPago.idSusRecord, charge, idempotency_key)
            console.log("PAGADO CON EXITo")
            perfilPago.facturaPago.push({
              cantidad : perfilPago.lastCharge.cantidad,
              fecha : new Date(),
              idProducto : idProducto,
              ips:  ips,
              userId : userId
            })
            
            perfilPago.lastCharge.cantidad = 0; 



            idempotency_key = undefined;  
            pagado = true;

            console.log(`Perfil pago: ${JSON.stringify(perfilPago.facturaPago)}, cantidad : ${perfilPago.lastCharge.cantidad}`)
            
        } catch (error) {
          error = new ExceptClass(COD_ERROR.CHARGE_NEW, error);
          console.log("ERROR " + error)
        }
        finally{
          // El bloque lo libera.
          let jsonIn;
          if(pagado)
          {
            // nada
            console.log("Finally: PAgado")
          }
          else if(index<2){
              console.log("Finally: No pagado, reintento")
              perfilPago.lastCharge.idempotency_key = idempotency_key;
              continue;
          }
          else if(index===2)
          {
            idempotency_key = undefined;
            console.log("Finally: No pagado, fin reintentos")
            //perfilPago.lastCharge.idempotency_key = undefined;
          
          }
          
          if(perfilPago.lastCharge.idempotency_key !== idempotency_key)
          {
            perfilPago.lastCharge.idempotency_key = idempotency_key;
          }
          console.log("finally: indempontecy_key =" + perfilPago.lastCharge.idempotency_key);
          jsonIn = {
            
            lastCharge : perfilPago.lastCharge
            
          }
          if(pagado)
          {
            jsonIn.facturaPago  =  perfilPago.facturaPago// si no hay pago anterior es que se ha conseguido pagar entonces añadimosel nuevo elemneto
            pagado=false;
          }


          console.log("finally: pagado =" +pagado + "jsonIn.facturaPago"+ JSON.stringify(jsonIn.facturaPago));
          setBlockedUpd(perfilPago._id, false, jsonIn)

          if(isUndefined(idempotency_key))
          {
             break;
          }
        }
    }

    }

    const hasMPago = (idUser : string) : boolean =>
    {
      const perfilPago : PerfilPagos = PerfilPagosColl.findOne({idCliente: idUser })

      return perfilPago &&  isDefined(perfilPago.idPayment_method) && perfilPago.idPayment_method!=="";
    }

    const generarEntornoDePago = async (payment_method, idPlan) =>
    {
        
            
      let  perfilPago : PerfilPagos = PerfilPagosColl.findOne({idCliente: Meteor.userId() })

      try {

        //Combprobamos que este correcto los perfiles.
        if(!payment_method || !idPlan)
        {
            throw  new ExceptClass(COD_ERROR.PARAM_IN);
        }

        console.log("metodo de pago:" + payment_method);
        let c :Customer;

        //si el perfil pago es undefined vamos a ver si existe en stripe con dicho correo.
        if(isUndefined(perfilPago) || isUndefined(perfilPago._id))
        {
          console.log("recuperando poor emaail")
          c= await PagosFn.getCustomerByEmail(Meteor.user().emails[0].address);
          
          console.log( "res: " + JSON.stringify(c))
          if(c && c.id)
          {
              // creamos el objeto.
              //dejamos el perfil pago como si fuera una actualizacion yq ue actualice los metodos de pago
              perfilPago  = {
                blocked : false,
                idSuscription : undefined,
                idSusRecord : undefined,
                idPLan : idPlan,
                customer : c,
                idCliente: Meteor.userId(),
                idPayment_method : undefined,
                lastCharge : {
                },
                facturaPago : [],
                facturaCobro : [],
                view : {
                  hasMthPago : false
                }
            
          }

          console.log("insert pergil de pagos :" + JSON.stringify(perfilPago));
          //insertamos el perfil.
          PerfilPagosColl.insert(perfilPago);
          perfilPago = PerfilPagosColl.findOne({idCliente: Meteor.userId() })
          }

        }


        //existe ya el customer?  si no existe se crea 
        if(!perfilPago)
        {
          // CREACION DE CUSTOMER Y METODO DE PAGO
          console.log("creacion de perfil de pago");
          c = {
            invoice_settings : {
              default_payment_method : payment_method
            },
            email : Meteor.user().emails[0].address
          }
  
          try {
            console.log("creacion de customer");
            c = await  PagosFn.crearCustomer(c, payment_method);
            
          } catch (error) {
            console.log("ERROR al crear customer "+ error)
            throw  new ExceptClass(COD_ERROR.CUSTOMER_CREATE, error);

          }
          
          console.log("---Ok");
          let sus;
          try {
            
            console.log("atach suscription to:" + JSON.stringify(c) +  ", " + idPlan + ", " + payment_method);
            sus = await attachSuscriptionToCustomer(c.id, idPlan, payment_method);
          } catch (error) {
            
            // si falla el suscription  borramos el customer
            console.log("Error atach"+ error)
            await removeCustomer(c.id);
            
            throw  new ExceptClass(COD_ERROR.SUS_CREATE, error);
          }

          console.log("---OK");
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
            facturaPago : [],
            facturaCobro : [],
            view : {
               hasMthPago : !!payment_method
            }
            
          }
          console.log("insert pergil de pagos");
          //insertamos el perfil.
          PerfilPagosColl.insert(perfilPago);
          perfilPago = PerfilPagosColl.findOne({idCliente: Meteor.userId() })
        }
        else{
          //ACTUALIZACION DE CUSTOMER Y METODO DE PAGO
          //bloqueamos el perfil.
          setBlockedUpd(perfilPago._id, true);
          console.log("update: perfilPago");
          if(perfilPago.idPayment_method!==payment_method)
          {
            console.log("payment_method difference");
            /// si tiene metodo de pago lo actualizamos.
            try {
              // añadimos el metodo de pago al customer Poir si falla
              console.log("add payment_method: " + payment_method)
              let res =await attachPayMethodToCustomer(payment_method, perfilPago.customer.id);
              console.log("res:" +JSON.stringify(res));
              
            } catch (error) {
              console.log("---ERROR add payment:" + error);
              throw  new ExceptClass(COD_ERROR.MP_ATTACH, error);
            }
            console.log("---OK");
            const idMPAnterior = perfilPago.idPayment_method;
            perfilPago.idPayment_method = payment_method;
  
            
            /// actualizamos el emtodo de pago por defecto.
            try {
              c = await getCustomer(c ? c.id : perfilPago.customer.id);
             // perfilPago.customer.invoice_settings.default_payment_method = payment_method;
             console.log("update source payment_method");
             let  cUpdate : Customer = {
                invoice_settings : {
                  default_payment_method : payment_method
                }
              }

              perfilPago.customer = await updateCustomer(c.id, cUpdate);
              
            } catch (error) {
              // borramos el metodo de pago nuevo que ha sido añadido
              console.log("---Error UpdateCustomer"+ error);
              await removeCardFromCustomer(perfilPago.idPayment_method)
              throw  new ExceptClass(COD_ERROR.CUSTOMER_UPDATE, error);        
            }
            console.log("---OK");
            //por ultimo si hay metodo de pago anterior, lo borramos.
            
            if(idMPAnterior)
            {
              // si existe metodo de pago, lo borramos y le añadimos el nuevo. 
              try {
                // borramos el meteodo de pago anterior.
                console.log("remove old payment method");
                await removeCardFromCustomer(idMPAnterior) // borramos el emtodo de pago.
              
              } catch (error) { 
                console.log("---error" + error);             
                MethodsClass.logError(modulo, (new ExceptClass(COD_ERROR.MP_CARD_REMOVE, error)).toString(),
                Meteor.userId());
              }

              console.log("---OK");
              
            }

          }
  
         
          if(!perfilPago.idSuscription)
          {

            let sus;
            try {
              sus = await attachSuscriptionToCustomer(perfilPago.customer.id,idPlan, payment_method);
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
       
          PerfilPagosColl.update({_id:perfilPago._id }, perfilPago);

        }
        
      } catch (error) {
        throw error;
      }
      finally{
        // El bloque lo libera.
        
        if(perfilPago && perfilPago._id)
        {
          setBlockedUpd(perfilPago._id, false, {})

        }
        
      }

    }

    const pago = async (payment_method, idPlan) =>
    {

    }


      const crearPMFromCardRandom = async () =>
      {
          
           
            const res = await stripe.paymentMethods.create(
              {
                type: 'card',
                card: {
                  number: test.cards[Math.floor(Math.random() * test.cards.length) % test.cards.length],
                  exp_month: 3,
                  exp_year: 2030,
                  cvc: '314',
                }
              })
          return res;  
      }
    export  const PagosFn = Meteor.isServer ? {crearPMFromCardRandom, crearCustomer,setupIntent, getAllCardsFromCustomer,
             removeCardFromCustomer, removeCustomer, getCustomer, getPlanesCobro,
             attachSuscriptionToCustomer, chargeAmountToCustomer, getSuscriptionItem, removeSus,
             getCustomerInvoices, getInvoice,   attachPayMethodToCustomer, detachPayMethodToCustomer,
             updateCustomer, generarEntornoDePago, borrarEntornoDePago, getUsage, cargarCantidadToCustomer, getPMethod, precioUnidad, hasMPago, getCustomerByEmail} : {};