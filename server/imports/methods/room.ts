import { Meteor } from 'meteor/meteor';

import { Rooms } from '../../../imports/collections/room';
import { Users } from '../../../imports/collections/users';
import { Room, RoomFile, MessageRoom, TypeMsgChat } from '../../../imports/models/room';
import { MethodsClass } from '../../../imports/functions/methodsClass'

import { User } from 'imports/models/User';
import { Perfil } from 'imports/models/perfil';
import { Kpm, Score } from 'imports/models/kpm';

import { FactoryCommon } from 'imports/functions/commonFunctions';
import { secretshared } from '../libAux/sharedPass';
import { fn } from '@angular/compiler/src/output/output_ast';

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


export async function updateDatePing(claseId :String, userId : String) {

  let room : Room = Rooms.findOne({ _id : claseId});

      //Nos aseguramos que tenga permisos para cerrar  la clase (Que sea el creador.)
    if(room ==null || !room.activo || room.alumnoId != userId && room.profId != userId  )
    {
        //Error.noPermisos();
        return;
    }
  
    
    room.lastPing  = new Date();

   Rooms.update({_id: room._id}, room,{ upsert: false });
}

export async function terminarClaseById(claseId :String, isAsincrona : boolean,  userId ?: String) {



  let room : Room = Rooms.findOne({ _id : claseId});

      //Nos aseguramos que tenga permisos para cerrar  la clase (Que sea el creador.)
    if(room ==null || !room.activo || !isAsincrona && room.alumnoId != userId && room.profId != userId  )
    {
        //Error.noPermisos();
        return;
    }
    room.activo =false;
    
    room.fechaFin  = new Date();
    room.estadoText = getTexto(room);
    
    //cobro.
    

    //PagosFn.getPlanesCobro TODO sacar la unidad de los planes d ecobro
    //maximo entre el calculo y 5 minutos. 5 mintps los va a pagar siempre.
    //obtenemos lo miutos de clase.
    // dinero por minuto. 
    /*let ip =""
    try {
      ip = this.connection.clientAddress;
    } catch (error) {
      ip = "NOT_IP"
      console.log("Ip error : " + error);
    }
*/

    try {
      let tiempoClaseMinuts = Math.max( (room.fechaFin.getTime() - room.fechaIni.getTime()) /60000, 5);
      let precioTotal =tiempoClaseMinuts * (room.precio || 0);
      //room.ip = ip;
      console.log("Tiempo   consumido (min 5mins):" + tiempoClaseMinuts);
      console.log("Precio total de clase: " + precioTotal);

      

      Meteor.call("chargeQuantity", precioTotal, room.alumnoId, secretshared,  room._id, room.ips);
      room.cargadoCoste=true;
    } catch (error) {
      room.cargadoCoste =false;
    }
    
    //VALIDACIONES
   // console.log("insertando " + room);
   Rooms.update({_id: room._id}, room,{ upsert: false });
}


let getRoom = (claseId :string) : Room =>{

      if(!MethodsClass.isLogged())
        {  
          MethodsClass.noLogueado()
        }

        let room : Room = Rooms.findOne({ _id : claseId});



          //Nos aseguramos que tenga permisos para cerrar  la clase (Que sea el creador.)
        if(room ==null || room.alumnoId != Meteor.userId() && room.profId != Meteor.userId()  || !room.comenzado || !room.activo)
        {
            //Error.noPermisos();
            throw "La clase no existe o no tiene permisos"
           
        }

        return room;
}

const MAX_FILES = 10;
const modulo = "Methods-Room"
Meteor.methods({

  saveScoreFromAlumno(idClase: string, score : Score)
  {
    
    try {
      check(idClase, String);

      if(!score || !score.comentario && !score.dateScore
         && !score.kpms && score.kpms.length===0 && !score.updated)
      {
        MethodsClass.parametersError();
      }


      if(!MethodsClass.isLogged())
      {  
          MethodsClass.noLogueado()
        }
      //TODO, METER validacion y tiempo para poder guardar
      console.log("clase :" + JSON.stringify(idClase))
      let clase : Room = Rooms.findOne({ alumnoId : Meteor.userId()/*, activo : !true*/, _id : idClase});
      //evitamos que cree mas de una
      if(!clase)
      {
        MethodsClass.parametersError();  
      }

      if(clase.alumnoId !== Meteor.userId())
      {
        MethodsClass.except(500 , modulo, "saveScoreFromAlumno : no alumno de la clase." , "");
       // throw "no alumno de la clase."

         
      }

      if(clase.scores && clase.scores.profesor && clase.scores.profesor.dateScore)
      {
        
        MethodsClass.except(500 , modulo, "saveScoreFromAlumno : clase ya valorada." , "");
        
      
      }
      
     let flag : boolean = score.kpms.reduce((before: boolean, current :Kpm)=>{
          return before && current.activo && current.type && current.answer >=0 && current.answer <=5;
      }, true)
      if(!flag)
      {
        
        MethodsClass.except(500 , modulo, "saveScoreFromAlumno : Algun score incorrecto." , "");
        
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
      
      Meteor.call("sendValoracion", clase, secretshared);
      Meteor.call("calcularElo", clase.profId, clase.scores.profesor.kpms, secretshared);
    } catch (error) {
      //  console.log(error);
      MethodsClass.except(500,modulo, "saveScoreFromAlumno : " + error, "");
       
    }

  },
  //la clase la crea el alumno
 /* setClassConnectionTypeToRelay()
  {

  },*/
  crearClase(profId : string) {

  check(profId, String);
  let room: Room = {
    profId : "",
    alumnoId :"",
    titulo : "",
    chat : [],
    files : [],
    nomAlumn :"",
    nomProfe :"",
    lastPing: new Date(),
    ips: {
      comprador: "",
      vendedor : ""
    },
    isConnectionRelayType: false
  };
    try
    {

      if(!profId)
      {
        MethodsClass.parametersError();
      }
        //TODO MIRAR QUE SEA PROFESOR
        if(!MethodsClass.isLogged())
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
          let userProf : User = Users.findOne(profId);
          let userAlumn : User = Meteor.user();
          let p: Perfil = userProf.profile; //profesor se carga
          //console.log("Entra");
          room.profId = profId;
          //se guardan la ultima ip de conexion
          room.ips.vendedor = userProf.lastIp;
          
          room.alumnoId = Meteor.userId();
          room.activo =true;
          room.comenzado = false;
          room.fechaIni  = new Date();
          room.fechaCom = null;
          room.fechaFin = null;
          room.estadoText = getTexto(room);

          let perfilAlumn = userAlumn.profile 
          room.ips.comprador = userAlumn.lastIp;

          room.nomAlumn =   `${perfilAlumn.nombre} ${perfilAlumn.apellidos}`;
          room.nomProfe =  `${p.nombre} ${p.apellidos}`;
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
         p = perfilAlumn;

         p.claseId = _idRoom;
         //esta bien , es guardar el mio.
         Meteor.call('savePerfil',  p);


          return _idRoom;

    }
    catch(e) {

      console.log(e+"FALLA" );
      throw e;
    }



    
  },
  empezarClase() {
    
    //PUEDE EMPEZAR SOLO EL ALUMNO
    if(!MethodsClass.isLogged())
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
    room.lastPing = new Date();
   // perfil.claseId="";

    
    //VALIDACIONES
   // console.log("insertando " + room);
   Rooms.update({_id: room._id}, room,{ upsert: false });
  },
  terminarClase(profesor : boolean) {
    
    check(profesor, Boolean);
    this.unblock();
    let userId =Meteor.userId();
    //console.log("Entra");
    if(!MethodsClass.isLogged())
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


    terminarClaseById(claseId, false, userId);
    
  },
  newMsgChat(claseId: string, msg : MessageRoom )
  {
    check(claseId, String);
    let room = getRoom(claseId);

    if(!msg.msg || msg.msg.trim() === "")
    {
        return;
    }
    msg.msg = FactoryCommon.limpiar(msg.msg.trim());
    msg.owner = Meteor.userId();
    msg.fecha = new Date();
    msg.type = TypeMsgChat.MSG
    if(!room.chat)
    {
      room.chat = []
    }

    room.chat.push(msg)
    Rooms.update({_id: room._id}, room,{ upsert: false });

  },
  uploadFile(claseId :string ,filesIn: Array<RoomFile>)
  {
   // && profile.foto.includes("data:image/") && FactoryCommon.getSizeFileB64(profile.foto) <=  FactoryCommon.MAX_SIZE_FOTO)
    
    try {
      check(claseId, String);
      let room = getRoom(claseId);


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
            f.fecha = new Date();
            f.type = TypeMsgChat.FILE
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
        MethodsClass.except(500, modulo, "uploadFile : " + error, "");
    }

  }
  
})



