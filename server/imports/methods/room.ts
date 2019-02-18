import { Meteor } from 'meteor/meteor';

import { Rooms } from '../../../imports/collections/room';
import { Users } from '../../../imports/collections/users';
import { Room } from '../../../imports/models/room';
import { Error } from '../../../imports/functions/errors'

import { User } from 'imports/models/User';
import { Perfil } from 'imports/models/perfil';
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

Meteor.methods({
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
              Error.noLogueado();
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
          room.activo =true;
          room.comenzado = false;
          room.fechaIni  = null;
          room.fechaCom = null;
          room.fechaFin = null;
          room.alumnoId = Meteor.userId();
          room.estadoText = getTexto(room);
          //VALIDACIONES
         // console.log("insertando " + room);
         //Rooms.collection.insert
         let _idRoom : string=  Rooms.collection.insert(room);
         let p: Perfil = Meteor.user().profile

         p.claseId = _idRoom;
         Meteor.call('savePerfil', p);

         p = Users.findOne(profId).profile;

         p.claseId = _idRoom;
         Meteor.call('savePerfil', p);

    }
    catch(e) {

      console.log(e+"FALLA" );
      throw e;
    }



    
  },
  empezar() {
    
    //PUEDE EMPEZAR SOLO EL ALUMNO
    if(!Meteor.user())
    {  
          Error.noLogueado();
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
  terminar() {
    
    //console.log("Entra");
    if(!Meteor.user())
    {  
          Error.noLogueado();
    }
    let perfil : Perfil = Meteor.user().profile;
    if(!perfil.claseId || perfil.claseId=== "")
    {
       return;
    }

    let claseId : string  = perfil.claseId;
    perfil.claseId = "";

    Meteor.call("savePerfil", perfil);


    let room : Room = Rooms.findOne({ _id : claseId});

      //Nos aseguramos que tenga permisos para cerrar  la clase (Que sea el creador.)
    if(room ==null || room.alumnoId != Meteor.userId() && room.profId != Meteor.userId()  || !room.activo)
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
