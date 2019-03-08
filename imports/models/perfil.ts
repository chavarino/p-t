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