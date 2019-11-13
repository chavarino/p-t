

export interface PublicPerfilPagos {
  tarjetaView ?:string // ultimos 4 digitos de la tarjeta.
    hasMthPago : boolean;
    isExpired ?: boolean
}
export interface PerfilPagos {

    _id ?: string,
    idPLan : string,
    // campo con la url de pago : hosted_invoice_url obtener url de pago de una factura no pagada.
    //  de invocar la informacion de la factura.
    idCliente : string, //id user meteor
    
    idPayment_method :string, // metodo de pago customer,
    idSuscription : string,
    idSusRecord : string,
    view ?: PublicPerfilPagos
    blocked : boolean,
//ip guardarla en el metadata.
    lastCharge ?: {
        cantidad ?: number;
        idempotency_key ?: string // clave por si falla el pago no volver a recargarla sino reanudarla. sino hay null.
    },

    customer : Customer
}



export  interface Customer {
        
    id ?: string,
   
    address ?: string,
    //"balance": 0,
    created ?: number,
    currency ?: string,
   // "default_source": null,
    "delinquent" ?: boolean,
    //"description": null,
    //"discount": null,
    email ?: string,
   // "invoice_prefix": "39F4124E",
   invoice_settings ?: {
      //"custom_fields": null,
      default_payment_method:  string,
     // "footer": null
    },
    //"livemode": false,
    //"metadata": {},
    name ?: string,
    phone ?: string,
    //"preferred_locales": [],
    //"shipping": null,
    /*"sources": {
      "object": "list",
      "data": [],
      "has_more": false,
      "url": "/v1/customers/cus_G275KZImYxe69e/sources"
    },*/
    /*"subscriptions": {
      "object": "list",
      "data": [],
      "has_more": false,
      "url": "/v1/customers/cus_G275KZImYxe69e/subscriptions"
    },*/
    //"tax_exempt": "none",
    /*"tax_ids": {
      "object": "list",
      "data": [],
      "has_more": false,
      "url": "/v1/customers/cus_G275KZImYxe69e/tax_ids"
    },
    "tax_info": null,
    "tax_info_verification": null*/
  }