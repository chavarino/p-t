import { Meteor } from 'meteor/meteor';
import { MethodsClass } from '../../../imports/functions/methodsClass'
import { Users } from '../../../imports/collections/users';
import { Perfil,RolesEnum, AutoCompleteModel } from '../../../imports/models/perfil';
import { User } from 'imports/models/User';
import {Accounts} from 'meteor/accounts-base';



Meteor.methods({

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
        console.log(JSON.stringify(input));
            return Meteor.users.rawCollection().find(input, {fields:  {
              'profile.name' : 1,
              "profile.foto" : 1,
              'profile.nombre' : 1,
              'profile.apellidos' : 1,
              'profile.disponible' : 1,
              'profile.claseId' : 1,
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
      if(profile.rol === RolesEnum.ALUMNO)
      {

        console.log("entra:")
        profile.rol = RolesEnum.PROFFESOR;
      }
      try{
        console.log("rol actual: " + profile.rol)
        Meteor.call("savePerfil", profile);

      }
      catch(e)
      {
        MethodsClass.noPermisos();
      }


  },
  savePerfilById(id :string, profile: Perfil) {

    if(Meteor.isClient)
    {
      id = Meteor.userId();
    }
    if(!id)
    {
        MethodsClass.noLogueado();
    }
    let filter = {
      "_id": id
    };

    if(Meteor.isClient)
    {
      console.log("Cliente")
      profile.rol = Users.findOne(filter).profile.rol;
    }
    let input : any = {$set : { profile : profile}}
    //validar TODO
    
    console.log(filter + ", " + input)
    Users.update(filter, input);
  },
  savePerfil(profile: Perfil) {

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
    console.log(JSON.stringify(user));
    console.log("email val:" +  patt.test(user.username))
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
        
            { $unwind : "$profile.categorias" },
            { $group : { _id : "$profile.categorias" , number : { $sum : 1 } } },
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


