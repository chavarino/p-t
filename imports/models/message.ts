export interface MessageRtc {
    idClase : string,
    msgTipo : MsgTipo,
    sdp ?: RTCSessionDescription,
    candidate ?: RTCIceCandidate
}

export interface Message  {
    from : string, //id del emisor
    to : string, //id del receptor

    msgTipo : MsgTipo,
    cuerpo ?: any,
    readed ?: boolean

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
    CALL_NO_DISPONIBLE =11

}