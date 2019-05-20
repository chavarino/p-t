export interface Perfil {
    foto : string,
    rol : number,
    email : string,
    nombre : string,
    apellidos : string,
    disponible : Boolean,
    claseId ?: string,
    categorias : Array<string>,
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

    "profile.categorias" : {
        $regex : string
    }
}

export class CategoriasPatronClass implements CategoriasPatron{
    "profile.categorias": { 
        $regex: string; 
    };
    constructor( str : string)
    {
        this["profile.categorias"] = {
            $regex :str
        }
    }

    equals(cat:string) :boolean
    {
        return cat === this["profile.categorias"].$regex
    }
}

