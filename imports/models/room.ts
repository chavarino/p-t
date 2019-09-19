import {  Score } from './kpm';

import { FilesI } from './fileI';


export enum TypeMsgChat {

    MSG = 1,
    FILE = 2

}

export interface MsgChat
{
     type : TypeMsgChat
    owner ?: string
    fecha ?: Date
}

export interface RoomFile extends FilesI,  MsgChat{
   
}
export interface MessageRoom extends MsgChat  {
    
    msg : string
}
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
    
    files: RoomFile[];
    chat : Array<MessageRoom>,
    scores ?: {
        alumno : Score

        profesor : Score
    }
}

