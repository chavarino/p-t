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
  crearClase(room: Room) {

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

    }
    catch(e) {

      console.log(e+"FALLA" );
      throw e;
    }



    
  },
  rechazarLlamada() { //profesor
    //console.log("Entra");
    if(!Meteor.user())
    {  
        Error.noLogueado();
      }

    let id : string = Meteor.user().profile.claseId;
    let room : Room = Rooms.findOne({ _id : id});

      //Nos aseguramos que tenga permisos para cerrar  la clase (Que sea el creador.)
    if(room ==null ||  room.profId != Meteor.userId()  || !room.activo)
    {
        Error.noPermisos();
        return;
    }
    
    
    
   room.profId = null;
    //VALIDACIONES
   // console.log("insertando " + room);
   room.rechazado = true;
   Rooms.update({_id: room._id}, room,{ upsert: false });
   let p: Perfil = Meteor.user().profile;
   p.disponible = true;
   p.claseId = null;
   Meteor.call('savePerfil', p);
  },
  terminar(id: string) {

    let room : Room = Rooms.findOne({ _id : id});

      //Nos aseguramos que tenga permisos para cerrar  la clase (Que sea el creador.)
    if(room ==null || room.alumnoId != Meteor.userId() || !room.activo)
    {
        Error.noPermisos();
        return;
    }
    //console.log("Entra");
      if(!Meteor.user())
      {  
          Error.noLogueado();
        }
     room.activo =false;
    
    room.fechaFin  = new Date();
    room.estadoText = getTexto(room);
    //VALIDACIONES
   // console.log("insertando " + room);
   Rooms.update({_id: room._id}, room,{ upsert: false });
  },
  contestar() {


    try
    {

      //console.log("Entra");
        if(!Meteor.user())
        {  
            Error.noLogueado();
          }
      let idRoom : string = Meteor.user().profile.claseId;
  
            //Nos aseguramos que tenga permisos para cerrar  la clase (Que sea el creador.)
      if(idRoom ==null)
      {
          Error.noPermisos();
          return;
      }
      let room : Room = Rooms.findOne({ _id : idRoom});
  
        //Nos aseguramos que tenga permisos para cerrar  la clase (Que sea el creador.)
      if(room ==null || room.profId != Meteor.userId() || !room.activo || room.comenzado)
      {
          Error.noPermisos();
          return;
      }
  
      room.comenzado =true;
      
      room.fechaCom  = new Date();
      room.estadoText = getTexto(room);
     
      //VALIDACIONES
     // console.log("insertando " + room);
     Rooms.update({_id: room._id}, room,{ upsert: false });
    }
    catch(e)
    {
      console.log(e+"FALLA" );
      throw e;
    }
  },
  llamarProfesor(id : string ) {

 
    //has seleccionado el profesor

    //vemos si está disponible 
        // no lo está entonces Profesor ocupado
        // si entonces le asignamos a la clase y ponemos su perfil a no disponible.


    //entonces creas la sala asignas profesor


 try {
    //let clase : Room =   Rooms.findOne({ $or: [ { activo :true, profId:null }, { profId: Meteor.userId(), activo :true } ] }, {sort : { "fechaIni" : 1 }}) //.sort({ "date_time" : 1 }).limit(1)
    //console.log("1")
    if(!Meteor.user())
    {  
      console.log("Error no logueado")
      Error.noLogueado();
    }
    
      let profesor : User = Users.findOne({_id : id})

      if(!profesor || profesor.profile)
      {
        console.log("Error Profesor nulo")
           Error.errorProfesorNoDisponible();
      }

      if(!profesor.profile.disponible)
      {
          console.log("Error Profesor No disponible")
           Error.errorProfesorNoDisponible();
      }




      //profesor disponible
      //pondemos profesor  a no disponible.
      
      //le asignamos nuestra sala.
      
      let room : Room  = Rooms.findOne({_id : Meteor.user().profile.claseId})
      if(!room)
      {
          console.log("Error errorSala")
           Error.errorSala();
      }
      
      profesor.profile.disponible=false;
      profesor.profile.claseId = room._id;
      Users.update({_id : profesor._id}, profesor,{ upsert: false })

      room.profId = profesor._id;
      Rooms.update({_id: room._id}, room,{ upsert: false });



      }
      catch(e) {

        console.log(e+"FALLA" );
        throw e;
      }
  
}
  
})
