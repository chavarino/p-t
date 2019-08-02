export interface FilesI {

    filename :string,
    filetype : string,
    valueUrl : string,
    valueB64 : string,
    size : number

}


export interface RoomFile extends FilesI{

    owner ?: string
}