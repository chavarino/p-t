import { EloIntefaceModel } from 'imports/functions/commonFunctions';

export interface PerfClase 
{
    nombre ?: string,
    clases : Array<string>,
    categorias : Array<string>,
    ultElo : number,
    eloModel :EloIntefaceModel,
    ultPrecio : number
    updated ?: boolean
}

export interface Perfil {
    foto : string,
    rol : number,
    email : string,
    nombre : string,
    apellidos : string,
    disponible : Boolean,
    claseId ?: string,
    perfClase ?: PerfClase,
    descripcion : string

}



export enum RolesEnum {

    ALUMNO = 1,
    PROFFESOR = 5
  }

export interface AutoCompleteModel {
    value: any;
    display: string;
 }
//{tags : {'$regex': "tag10"}}
export interface CategoriasPatron {

    "profile.perfClase.categorias" : {
        $regex : string
    }
}

export class CategoriasPatronClass implements CategoriasPatron{
    "profile.perfClase.categorias": { 
        $regex: string; 
    };
    constructor( str : string)
    {
        this["profile.perfClase.categorias"] = {
            $regex :str
        }
    }

    equals(cat:string) :boolean
    {
        return cat === this["profile.perfClase.categorias"].$regex
    }
}

