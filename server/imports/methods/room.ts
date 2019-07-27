import { Meteor } from 'meteor/meteor';

import { Rooms } from '../../../imports/collections/room';
import { Users } from '../../../imports/collections/users';
import { Room } from '../../../imports/models/room';
import { MethodsClass } from '../../../imports/functions/methodsClass'

import { User } from 'imports/models/User';
import { Perfil } from 'imports/models/perfil';
import { Kpm, Score } from 'imports/models/kpm';
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
    titulo : ""
  };
    try
    {
      
          if(!Meteor.user())
          {  
              MethodsClass.noLogueado();
            }
          let claseAnt : Room = Rooms.findOne({ alumnoId : Meteor.userId(), activo : true});
            //evitamos que cree mas de una
          if(claseAnt !=null)
          {
               //Error.duplic();
              return;
          }
          //console.log("Entra");
          room.profId = profId;
          room.alumnoId = Meteor.userId();
          room.activo =true;
          room.comenzado = false;
          room.fechaIni  = new Date();
          room.fechaCom = null;
          room.fechaFin = null;
          room.estadoText = getTexto(room);
          //VALIDACIONES
         // console.log("insertando " + room);
         //Rooms.collection.insert
         let _idRoom : string=  Rooms.collection.insert(room);
         let p: Perfil = Meteor.user().profile

         p.claseId = _idRoom;
         //esta bien , es guardar el mio.
         Meteor.call('savePerfil', p);

         p = Users.findOne(profId).profile;

          
         p.claseId = _idRoom;
         Meteor.call('savePerfilById',profId, p);

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

    console.log(JSON.stringify(perfil))

    if(!perfil.claseId || perfil.claseId=== "")
    {
       return;
    }

    let claseId : string  = perfil.claseId;
    perfil.claseId = "";
    if(profesor)
    {

      perfil.disponible =true;
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
  }
  
})
