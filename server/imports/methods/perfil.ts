import { Meteor } from 'meteor/meteor';
import { MethodsClass } from '../../../imports/functions/methodsClass'
import { Users } from '../../../imports/collections/users';
import { Perfil,RolesEnum, AutoCompleteModel } from '../../../imports/models/perfil';
import { User } from 'imports/models/User';
import {Accounts} from 'meteor/accounts-base';
import { iniProfesorModel, Elo, FactoryCommon } from 'imports/functions/commonFunctions';
import { Kpm } from 'imports/models/kpm';


const modulo = "Methods-Perfil";
let savePerfil = (id :string, profile: Perfil, all ?: boolean) =>
{
 
  if(!id)
  {
      MethodsClass.noLogueado();
  }
  let filter = {
    "_id": id
  };
  
  if(!id)
  {
    id = Meteor.userId();
      return;
  }


  if( !all)
  {
    let perfilAux : Perfil;

    if(id === Meteor.userId())
    {
      perfilAux = Meteor.user().profile;

      if(profile.foto && profile.foto!==perfilAux.foto && FactoryCommon.isImageCorrectFromUrl(profile.foto ) )
      {
          perfilAux.foto = profile.foto;
      }
    }
    else{
      perfilAux = Users.findOne(id).profile;
    }
    console.log(" restriccion de guardado")
    profile.rol = perfilAux.rol;
    if(profile.rol >= RolesEnum.PROFFESOR)
    {
      profile.perfClase.ultElo = perfilAux.perfClase.ultElo;
      profile.perfClase.clases = perfilAux.perfClase.clases;
      console.log("Perfil clase de profesor")
    }
    else if (profile.perfClase){
      console.log("Perfil clase de alumno rellenado")
      profile.perfClase = undefined;
    }

    //profile.perfClase.updated = perfilAux.perfClase.updated;
    
  }
  else{
    console.log("Guardando perfil entero");
  }


  let input : any = {$set : { profile : profile}}
  //validar TODO
  
 // console.log(JSON.stringify(input));
  Users.update(filter, input);
}

Meteor.methods({
  findUser(id : String)
  {
    return Meteor.users.findOne({_id: id}, {fields:  {
      'profile.name' : 1,
      "profile.foto" : 1,
      'profile.nombre' : 1,
      'profile.apellidos' : 1,
      'profile.disponible' : 1,
      'profile.claseId' : 1,
      'profile.descripcion' : 1,
      'profile.perfClase.categorias' : 1
      
      
    }})
  },
  callAvalaibleTeacher(filters : Array<AutoCompleteModel>)
  {

    try{
      
          let input = {
            $and : [
                {"profile.disponible" : !false},
                {'profile.rol' : { $gte: RolesEnum.PROFFESOR}},
                {_id: { $ne: Meteor.userId() }},
                ...filters
      
            ]
        }
        //{"profile.disponible" : !false,'profile.rol' : { $gte: RolesEnum.PROFFESOR}  , _id : { $ne: Meteor.userId() }}
       // console.log(JSON.stringify(input));
            return Meteor.users.rawCollection().find(input, {fields:  {
              'profile.name' : 1,
              "profile.foto" : 1,
              'profile.nombre' : 1,
              'profile.apellidos' : 1,
              'profile.disponible' : 1,
              'profile.claseId' : 1,
              'profile.descripcion' : 1,
              'profile.perfClase.categorias' : 1,
              'profile.perfClase.ultPrecio' : 1,
              'profile.perfClase.ultElo' : 1
              
              
            }}).toArray();  

    }
    catch(e)
    {
      console.log(e);
    }
  },
  changePerfilToProfesor()
  {

      let profile : Perfil=  Meteor.user().profile;
      console.log("rol actual: " + profile.rol)
      if(profile.rol >= RolesEnum.ALUMNO && profile.rol< RolesEnum.PROFFESOR)
      {

        console.log("entra:")
        profile.rol = RolesEnum.PROFFESOR;
      }
      try{
        console.log("rol actual: " + profile.rol)
        
        iniProfesorModel(profile);
        savePerfil(Meteor.userId(), profile, true);

      }
      catch(e)
      {
        MethodsClass.noPermisos();
      }


  },
  savePerfilById(id :string, profile: Perfil) {
    savePerfil(id, profile);
    
  },
  savePerfil(profile: Perfil) {

    console.log("SavePerfil - user" + Meteor.userId())
    Meteor.call("savePerfilById", Meteor.userId(), profile)
  },
  setDisponible(disponible : Boolean)
  {
      let profile : Perfil = Meteor.user().profile;

      profile.disponible = disponible;
      console.log("Set disponible " + disponible)

      try
      {
        
        Meteor.call("savePerfil", profile);
        console.log("Set disponible fin");
      }
      catch(e)
      {
        MethodsClass.errorSetDisponible()
      }


  },

  unirse(user: User)
  {
    let regex =/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    let patt = new RegExp(regex)
    //TODO VALIDAR
    //Accounts.findUserByEmail(user.em)
   // console.log(JSON.stringify(user));
    //console.log("email val:" +  patt.test(user.username))
    if(!user ||!user.username || user.username === ""  || !patt.test(user.username) || user.password.length>20 || user.password.length<5 )
    {
        console.log("ERROR : CAMPOS MAL INTRODUCIDOS")
        MethodsClass.creacionUserGeneral();
    }
    try{
    
      
      
     let userId = Accounts.createUser({email :user.username, username:user.username, password:user.password});

      console.log("generado user correctamente: " +userId);

      console.log("enviando Email de verificacion");
      Accounts.sendVerificationEmail(userId);
    }
    catch(e)
    {
      console.log(e);
      //throw e;
      MethodsClass.creacionUserYaExiste();
    }
  },
  getAutoCompleteList(str :string)
  {

    try {
      console.log("Entra en autocomplete")
      return Meteor.users.rawCollection().aggregate([
        
            { $unwind : "$profile.perfClase.categorias" },
            { $group : { _id : "$profile.perfClase.categorias" , number : { $sum : 1 } } },
            {$match : { _id : {'$regex': str} }},
            { $sort : { number : -1 } },
            { $limit : 10},
            { $project:
              {
                  value : "$_id",
                  display : {  $concat: ["$_id", " (", {$substr:["$number", 0, -1 ]}  , ")"]},
                  
              }
          
           }
          ], { allowDiskUse: true }).toArray()
    }

   catch(e)
    {
      console.log(e);
      //throw e;
      return  [];
    }
  },

  calcularElo(idProf : string, newNotas : Array<Kpm>)
  {
      try {

        if(Meteor.isClient || !newNotas)
        {
          return;
        }
        this.unblock();

        let perfil :Perfil = Meteor.users.findOne(idProf).profile;
        let elo : Elo = new Elo(perfil.perfClase.eloModel);
        
        let newNotaMedia = newNotas.reduce((before : number, current : Kpm)=> before + current.answer *  (current.ponderacion || 1/newNotas.length), 0);

        elo.add(newNotaMedia);
        
        perfil.perfClase.ultElo =  elo.calcularElo();
        // el modelo del elo es la misma referencia qye estamos usando, => ya esta usandose
        perfil.perfClase.updated =true;
        savePerfil(idProf,perfil,true)

      } catch (error) {
         
          MethodsClass.except(modulo, "calcularElo : " + error);
      }  
  }
})





//get del perfil: perfil.categorias

//AUTOCOMPLETE https://stackoverflow.com/questions/3305561/how-to-query-mongodb-with-like
// https://docs.mongodb.com/manual/core/aggregation-pipeline-optimization/
/*db.getCollection('prueba').aggregate([
    
    { $unwind : "$tags" },
    { $group : { _id : "$tags" , number : { $sum : 1 } } },
    {$match : { _id : {'$regex': variable} }},
    { $sort : { number : -1 } },
    { $limit : 10}
  ])

  */


  /*OBTENER LOS USUARIOs por etiquetas
  
  //igual mirar que si es una etiqueta seleccionada del autocomplete que sea busqueda literal y no regex.
    db.getCollection('prueba').find({ $and : [ {tags : {'$regex': "tag10"}},{tags : {'$regex': "tag2"}},{tags : {'$regex': "tag3"}}] })
  
  */


