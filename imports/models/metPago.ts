export interface PerfilPagos {


    // campo con la url de pago : hosted_invoice_url obtener url de pago de una factura no pagada.
    //  de invocar la informacion de la factura.
    idCliente : string, //id user meteor
    idCustomer :string, //id de customer stripe
    idMPago :string, // metodo de pago customer,
    view : {
        tarjetaView :string // ultimos 4 digitos de la tarjeta.

    }
//ip guardarla en el metadata.
    lastCharge : {

        idempotency_key : string // clave por si falla el pago no volver a recargarla sino reanudarla. sino hay null.
    }
}