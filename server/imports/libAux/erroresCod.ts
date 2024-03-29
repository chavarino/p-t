export enum COD_ERROR 
{
    GENERIC = 600,
    PARAM_IN =601,
    SUS_REMOVE = 602,
    USAGE_GET = 603,
    USAGE_GET_POSITIVO = 604,
    BLOCKED = 605,
    MP_CARD_REMOVE = 606,
    CUSTOMER_CREATE = 607,
    SUS_CREATE = 608,
    MP_ATTACH = 609,
    CUSTOMER_UPDATE = 610,
    CHARGE_NEW = 611,
}

export class ExceptClass{
    codigo : number;
    error : any;

    constructor(codigo : number,  error ?: any)
    {
        this.codigo = codigo;
        this.error = error || "";
    }



    toString()
    {

       return  `${this.codigo} : [${this.error}]`
    }
}