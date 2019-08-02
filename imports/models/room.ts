import { Kpm, Score } from './kpm';
import { RoomFile } from './fileI';
import { Message } from './message';



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
    precio ?: number,
    files : Array<RoomFile>,
    chat : Array<Message>,
    scores ?: {
        alumno : Score

        profesor : Score
    }
}

