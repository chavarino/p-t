import { Kpm, Score } from './kpm';



export interface Room {
    _id ?: string,
    titulo : string,
    //categoria ?: number,
    profId : string,
    alumnoId: string,
    peticion? : string,
    fechaIni ?: Date,
    fechaCom ?: Date,
    fechaFin ?: Date,
    activo ?: boolean,
    rechazado ?: boolean,
    comenzado ?: boolean,
    estadoText ?: string,
    urlVideo ?: string,
    elo ?: number,
    
    scores ?: {
        alumno : Score

        profesor : Score
    }
}

