
export enum tipoAnsw{
    clase  = 1,
    servicio =2
}
export interface Kpm{
    _id ?: string,

    type : tipoAnsw,

    question : string,
    ponderacion ?: number,
    answer ?: number,
    activo ?: boolean
}

export  interface  Score
{
    kpms : Kpm[],
    comentario : string,
    dateScore ?: Date
}