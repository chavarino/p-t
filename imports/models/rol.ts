import {Map} from "./map"


export enum  Permisos{
    NONE = 0,
    LOG = 1,
    ALUMNO = 10,
    PROFES = 20,
    ADMIN = 30,
    S_ADMIN = 40
}

export interface Rol {
    read : number,
    write : number
}

//export interface Roles : Map<Rol>;