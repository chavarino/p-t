
export interface sdpMsg {
    sdp: string;
    type: string;
}


export interface candidateMsg {
    candidate?: string;
    sdpMLineIndex?: number | null;
    sdpMid?: string | null;
    usernameFragment?: string;
}
export interface MessageRtc {
    
    msgTipo : MsgTipo,
    sdp ?: sdpMsg,
    candidate ?: candidateMsg
}

export interface Message  {
    from : string, //id del emisor
    to : string, //id del receptor
    _id ?: string
    msgTipo : MsgTipo,
    cuerpo ?: any,
    readed ?: boolean,
    fecha ?: Date

}



export enum MsgTipo {

    CANDIDATE = 1,
    SDP = 2,
    RTC = 3,
    CALL_INI = 4,
    CALL_OK = 5,
    CALL_CANCEL = 6,
    CALL_COLGAR = 7,
    PING = 8,
    PONG = 9,
    RECONNECT = 10,
    CALL_NO_DISPONIBLE =11,
    GO_CLASS = 12,
    CALL_RECONNECT = 13,
    INSIDE_ROOM = 14
    
    

}