import { Meteor } from 'meteor/meteor';

import { Rooms } from '../../../imports/collections/room';
import { Users } from '../../../imports/collections/users';
import { Room } from '../../../imports/models/room';
import { MethodsClass } from '../../../imports/functions/methodsClass'

import { User } from 'imports/models/User';
import { Perfil } from 'imports/models/perfil';
import { Kpm, Score } from 'imports/models/kpm';
import { RoomFile } from 'imports/models/fileI';
import { FactoryCommon } from 'imports/functions/commonFunctions';
function getTexto(room : Room)
{
  if(!room.comenzado && room.activo)
  {
      return "Esperando a profesor"
  }
  else if (room.comenzado && room.activo)
  {
     return "En clase!";
  }
  else if (room.comenzado && !room.activo)
  {
    return "Clase Terminada";
  }
  else{
    return "Estado desconocido";

  }
}

const MAX_FILES = 10;
const modulo = "Methods-Room"
Meteor.methods({

  saveScoreFromAlumno(idClase: string, score : Score)
  {
    
    try {
      //TODO, METER validacion y tiempo para poder guardar
      console.log("clase :" + JSON.stringify(idClase))
      let clase : Room = Rooms.findOne({ alumnoId : Meteor.userId()/*, activo : !true*/, _id : idClase});
      //evitamos que cree mas de una
      if(!clase)
      {
       
        throw "clase nula";
               //Error.duplic();
          
      }

      if(clase.alumnoId !== Meteor.userId())
      {
        throw "no alumno de la clase."

         
      }

      if(clase.scores && clase.scores.profesor && clase.scores.profesor.dateScore)
      {
        throw "clase ya valorada.";
        
      
      }
      
     let flag : boolean = score.kpms.reduce((before: boolean, current :Kpm)=>{
          return before && current.activo && current.type && current.answer >=0 && current.answer <=5;
      }, true)
      if(!flag)
      {
        throw "Algun score incorrecto.";
        
      }
      //puntuacion del alumno
      if(!clase.scores)
      {
        clase.scores = {
          alumno: {
            comentario : "",
            kpms : []

          },
          profesor : {
            comentario : "",
            kpms : []
          }
        }
      }
      clase.scores.profesor.dateScore = new Date();
      clase.scores.profesor.comentario = score.comentario || "";
      clase.scores.profesor.kpms = score.kpms || [];

      Rooms.update({_id: clase._id}, clase,{ upsert: false });

      Meteor.call("calcularElo", clase.profId,clase.scores.profesor.kpms);
    } catch (error) {
      //  console.log(error);
      MethodsClass.except(modulo, "saveScoreFromAlumno : " + error);
       
    }

  },
  //la clase la crea el alumno
  crearClase(profId : string) {
  let room: Room = {
    profId : "",
    alumnoId :"",
    titulo : "",
    chat : [],
    files : []
  };
    try
    {
        //TODO MIRAR QUE SEA PROFESOR
          if(!Meteor.user())
          {  
              MethodsClass.noLogueado();
            }
            let claseAnt : Room = Rooms.findOne({ alumnoId : Meteor.userId(), activo : true});
            if(claseAnt !=null)
            {
              //Error.duplic();
              return;
            }
          //evitamos que cree mas de una
          let p: Perfil = Users.findOne(profId).profile; //profesor se carga
          //console.log("Entra");
          room.profId = profId;
          room.alumnoId = Meteor.userId();
          room.activo =true;
          room.comenzado = false;
          room.fechaIni  = new Date();
          room.fechaCom = null;
          room.fechaFin = null;
          room.estadoText = getTexto(room);

          if(p.perfClase)
          {
              room.elo = p.perfClase.ultElo || 0;
              room.precio =p.perfClase.ultPrecio || 0;

          }
          //VALIDACIONES
         // console.log("insertando " + room);
         //Rooms.collection.insert
         let _idRoom : string=  Rooms.collection.insert(room);
         
         //guardamos el del profesor.
         p.claseId = _idRoom;
         Meteor.call('savePerfilById',profId, p);

        //guardamos el de el alumno
         p = Meteor.user().profile

         p.claseId = _idRoom;
         //esta bien , es guardar el mio.
         Meteor.call('savePerfil', p);


          

    }
    catch(e) {

      console.log(e+"FALLA" );
      throw e;
    }



    
  },
  empezarClase() {
    
    //PUEDE EMPEZAR SOLO EL ALUMNO
    if(!Meteor.user())
    {  
          MethodsClass.noLogueado();
    }
    let perfil : Perfil = Meteor.user().profile;
    if(!perfil || !perfil.claseId || perfil.claseId=== "")
    {
       return;
    }

    let claseId : string  = perfil.claseId;


    let room : Room = Rooms.findOne({ _id : claseId});

      //Nos aseguramos que tenga permisos para cerrar  la clase (Que sea el creador.)
    if(room ==null || room.alumnoId != Meteor.userId() && room.profId != Meteor.userId()  || room.comenzado || !room.activo)
    {
        //Error.noPermisos();
        return;
    }
    room.comenzado =true;
    
    room.fechaCom  = new Date();
    room.estadoText = getTexto(room);
    
   // perfil.claseId="";

    
    //VALIDACIONES
   // console.log("insertando " + room);
   Rooms.update({_id: room._id}, room,{ upsert: false });
  },
  terminarClase(profesor : boolean) {
    
    let userId =Meteor.userId();
    //console.log("Entra");
    if(!userId)
    {  
          MethodsClass.noLogueado();
    }
    
    let perfil : Perfil = Meteor.users.findOne({_id : userId}).profile;

    //console.log(JSON.stringify(perfil))

    if(!perfil.claseId || perfil.claseId=== "")
    {
       return;
    }

    let claseId : string  = perfil.claseId;
    perfil.claseId = "";
    if(profesor)
    {

      perfil.disponible =false;
    }
    else{
      perfil.disponible=false;
    }
    Meteor.call("savePerfil", perfil);


    let room : Room = Rooms.findOne({ _id : claseId});

      //Nos aseguramos que tenga permisos para cerrar  la clase (Que sea el creador.)
    if(room ==null || room.alumnoId != userId && room.profId != userId  || !room.activo)
    {
        //Error.noPermisos();
        return;
    }
    room.activo =false;
    
    room.fechaFin  = new Date();
    room.estadoText = getTexto(room);
    


    
    //VALIDACIONES
   // console.log("insertando " + room);
   Rooms.update({_id: room._id}, room,{ upsert: false });
  },

  uploadFile(claseId :string ,filesIn: Array<RoomFile>)
  {
   // && profile.foto.includes("data:image/") && FactoryCommon.getSizeFileB64(profile.foto) <=  FactoryCommon.MAX_SIZE_FOTO)
    
    try {

      //PUEDE EMPEZAR SOLO EL ALUMNO
        if(!Meteor.user())
        {  
             throw "No logueado";
        }

        let room : Room = Rooms.findOne({ _id : claseId});



          //Nos aseguramos que tenga permisos para cerrar  la clase (Que sea el creador.)
        if(room ==null || room.alumnoId != Meteor.userId() && room.profId != Meteor.userId()  || !room.comenzado || !room.activo)
        {
            //Error.noPermisos();
            throw "La clase no existe o no tiene permisos"
           
        }


        let files : Array<RoomFile> = room.files;


        let array: Array<RoomFile> = [];
        let flag_excedidos = false;
        let flag_formato_bad = false;
        
        let msg1: Array<string> = [],msg2 : Array<string>= [];
        let flag :boolean = false;
        for (let i = 0; i < filesIn.length; i++) {
          const f = filesIn[i];
            flag =false;
                if(files.length > MAX_FILES)
                {
                    flag_excedidos = true;
                    flag = true;
                    msg1.push(f.filename);
                }
        
                if(!FactoryCommon.isDocCorrect(f))
                {
        
                  flag=true;
                  flag_formato_bad = true;
                  msg2.push(f.filename);
                }
                if(!flag)
                {
                  f.owner = Meteor.userId();
                  array.push(f)

                }
         
          
        }
        
        if(array.length>0)
        {
          room.files.push(...array)
          Rooms.update({_id: room._id}, room,{ upsert: false });
        }

        
        if(flag_excedidos || flag_formato_bad)
        {
          throw "Algunos ficheros quedaron sin subir." + (flag_excedidos ?  `Numero de ficheros excedidos del limite: (${msg1.toString()})` : "") 
          + (flag_formato_bad ?  `Ficheros con formato o tamaño incorrecto: (${msg1.toString()}). Acepta: *.doc, *.docx, *.pdf, *.zip, *.rar, *.tar (Max 10MB) y *.png, *.jpg(Max 5MB)`   : "") 
        }
        
 
    } catch (error) {
        MethodsClass.except(modulo, "uploadFile : " + error);
    }

  }
  
})



