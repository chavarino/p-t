//import assert = require ("assert");
import chai =  require ("chai");
import { Meteor } from 'meteor/meteor';
import {Random} from "meteor/random";
import "./main"
import { User } from 'imports/models/User';
import { Users } from 'imports/collections/users';
import { from } from 'rxjs';
import { ModulesEnum } from 'imports/models/enums';
import { Message, MsgTipo } from 'imports/models/message';
import { Msg } from 'imports/collections/msg';
import { Rooms } from 'imports/collections/room';
import { Room } from 'imports/models/room';
var faker = require('faker');

var userLogin  = {
    username : faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
    profile: {
        apellidos : faker.name.lastName(),
        nombre : faker.name.firstName()
    }
  };

  var userLogin2  = {
    username : faker.internet.email().toLowerCase(),
    password: faker.internet.password(),
    profile: {
        apellidos : faker.name.lastName(),
        nombre : faker.name.firstName()
    }
  };


  var ids = {
    idUser : "",
    idProfesor : "",
    idAlumno: ""
  }

  var getIds = ()=> {
      return ids;
  }
 if(Meteor.isTest && Meteor.isServer)
  {
    console.log("Sobrescribiendo")  
    Meteor.userId = ()=>{
       // console.log("call userId: " + getIds().idUser )
        return getIds().idUser;
    }
    
    Meteor.user = ()=>{
        return Meteor.users.findOne(getIds().idUser);
    }
}


    
    describe('app', function () {
        


    it("server", function(){


        describe('perfil.ts', function () {
            //beforeEach();
            var id = "";
            after(function() {
                Users.remove(id);
              });
            
                var user : User = {
        
                }
                it('registro con usuario nulo=> error', function () {
                        // This code will be executed by the test driver when the app is started
                        // in the correct mode
        
                        user = undefined;
                        try {
                            Meteor.call('unirse',user ,(error, result)=>{
                                
        
                                if(error)
                                {
                                    console.log("Error al insertar: " + JSON.stringify(error))
                                    chai.assert.ok(true)
            
                                }
                                else{
                                    chai.assert.ok(false)
                                }
                            });
        
                        }
                        catch(e)
                        {
                            console.log("Exception al insertar "  + JSON.stringify(e))
                            chai.assert.ok(true)
                        }
                    })
                
        
        
                let email = "";
                console.log(`insert user : ${JSON.stringify(user)}`)
                it('registro con usuario normal=> insercion correcta', function () {
                        // This code will be executed by the test driver when the app is started
                        // in the correct mode
                        
                        
                        try {
        
                            let user2  = {
                                username : faker.internet.email().toLowerCase(),
                                password: faker.internet.password(),
                                profile: {
                                    apellidos : faker.name.lastName(),
                                    nombre : faker.name.firstName()
                                }
                              };
                            Meteor.call('unirse',user2 ,(error, result)=>{
                                
                                
                                if(error)
                                {
                                    console.log("Error al insertar: " + JSON.stringify(error))
                                    chai.assert.ok(false)
            
                                }
                                else{
                                    email = user2.username;
                                    id = result;
                                    console.log(`Usuario insertado id =${result}`)
                                    chai.assert.ok(result && result!== "")
                                }
                            });
        
                        }
                        catch(e)
                        {
                            console.log("Exception al insertar "  + JSON.stringify(e))
                            chai.assert.ok(false)
                        }
                    });
        
                 
                
          });
        
        
        
        
          describe('methods/general.ts', function () {
            before(function (done) {
              
                try {
                    
                    getIds().idProfesor = Accounts.createUser({email :userLogin.username, username:userLogin.username, password:userLogin.password, profile:{nombre: userLogin.profile.nombre, 
                        apellidos: userLogin.profile.apellidos} });
    
                    console.log("idProfesor: " + getIds().idProfesor);
        
                    getIds().idAlumno = Accounts.createUser({email :userLogin2.username, username:userLogin2.username, password:userLogin2.password, profile:{nombre: userLogin2.profile.nombre, 
                            apellidos: userLogin2.profile.apellidos} });
                        console.log("idAlumno: " + getIds().idAlumno);
                    done();
                } catch (error) {
                     done(error);
                }
             })
             after(function (done) {
                try {
                    Users.remove(getIds().idProfesor);
                    getIds().idProfesor ="";
                    Users.remove(getIds().idAlumno);
                    getIds().idAlumno="";
                    getIds().idUser ="";
                    console.log("borrados elementos")
                    done();
                } catch (error) {
                        done(error);
                }
                    
        })
                 
                 it('getDiffTimeInSeconds, input=date, output=result >=0', function () {
                        // This code will be executed by the test driver when the app is started
                        // in the correct mode
                        
                        
                        try {
        
                            
                            Meteor.call('getDiffTimeInSeconds', new Date() ,(error, result)=>{
                                
                                
                                if(error)
                                {
                                    console.log("Error al insertar: " + JSON.stringify(error))
                                    chai.assert.ok(false);
            
                                }
                                else{
                                    console.log(`resultado =${result}`)
                                    chai.assert.ok(result >=0)
                                }
                            });
        
                        }
                        catch(e)
                        {
                            console.log("Exception al insertar "  + JSON.stringify(e))
                            chai.assert.ok(false)
                        }
                    });    
        
        
        
                it('numero de usuarios conectados', function () {
                    // This code will be executed by the test driver when the app is started
                    // in the correct mode
                    
                    Meteor.call('getNumAlumnosConectados', (error, result)=>{
                        
                        
                          if(error)
                          {
                              
                            chai.assert.ok(false)
        
                          }
                          else{
                              console.log(`resultado =${result}`)
                              chai.assert.ok(result>=0);
                          }
                    });
                });


                it('getServerCustom -> error no login', function () {
                                    // This code will be executed by the test driver when the app is started
                                    // in the correct mode
                                   try {


                                    getIds().idUser =undefined;
                                       Meteor.call('getServerCustom', (error, result)=>{
                                           
                                           if(error)
                                           {
                                               
                                               chai.assert.ok(true)
                           
                                           }
                                           else{
                                            console.log(`resultado =${JSON.stringify(result)}`)
                                            chai.assert.isEmpty(result)
                                           }
                                            
                                           
                                       });
                                       
                                   } catch (error) {
                                       chai.assert.ok(true)
                                   } 
                                });
                
            it('getServerCustom -> Ok login', function () {
                                        // This code will be executed by the test driver when the app is started
                                        // in the correct mode
                                    try {
                                        console.log("idProfesor: " + getIds().idProfesor)
                                        getIds().idUser = getIds().idProfesor;
                                        Meteor.call('getServerCustom', (error, result)=>{
                                            
                                            if(error)
                                           {
                                               
                                               chai.assert.ok(false)
                           
                                           }
                                           else{
                                                console.log(`resultado =${JSON.stringify(result)}`)
                                                chai.assert.isNotEmpty(result)
                                           }
                                           
                                        });
                                        
                                    } catch (error) {
                                        chai.assert.ok(false)
                                    } 
                                    });

                it('setAlive -> error no login', function () {
                                        // This code will be executed by the test driver when the app is started
                                        // in the correct mode
                                    try {
                                        
                                        getIds().idUser = undefined;

                                        Meteor.call('setAlive', ModulesEnum.CLASE_PRFSOR, (error, result)=>{
                                            
                                                if(error)
                                            {
                                                
                                                chai.assert.ok(true)
                            
                                            }
                                            else{
                                                   
                                                    chai.assert.ok(false)
                                            }
                                            
                                            });
                                            
                                        } catch (error) {
                                            chai.assert.ok(true)
                                        } 
                                    });   
  
                                     

                                    
          })


          describe('methods/msg.ts', function () {

                var idMsg = "";
           
                before(function (done) {
                
                    try {
                        
                        getIds().idProfesor = Accounts.createUser({email :userLogin.username, username:userLogin.username, password:userLogin.password, profile:{nombre: userLogin.profile.nombre, 
                            apellidos: userLogin.profile.apellidos} });
        
                        console.log("idProfesor: " + getIds().idProfesor);
            
                        getIds().idAlumno = Accounts.createUser({email :userLogin2.username, username:userLogin2.username, password:userLogin2.password, profile:{nombre: userLogin2.profile.nombre, 
                                apellidos: userLogin2.profile.apellidos} });
                            console.log("idAlumno: " + getIds().idAlumno);
                        done();
                    } catch (error) {
                        done(error);
                    }
                })
                after(function (done) {
                    try {
                        Users.remove(getIds().idProfesor);
                        getIds().idProfesor ="";
                        Users.remove(getIds().idAlumno);
                        getIds().idAlumno="";
                        getIds().idUser ="";
                        //console.log("borrados elementos")
                        done();
                    } catch (error) {
                            done(error);
                    }
                        
                 })

                 afterEach((done)=>
                {
                    Msg.remove(idMsg)
                    done()
                })


            it('sendMsg -> msg correct', function () {
                    // This code will be executed by the test driver when the app is started
                    // in the correct mode
                try {
                    
                    getIds().idUser = getIds().idProfesor;
                    let msg : Message = {
                        from : getIds().idProfesor,
                        to : getIds().idAlumno,
                        msgTipo : MsgTipo.CALL_INI,
                        
                    }
                    Meteor.call('sendMsg', msg, (error, result)=>{
                        
                        if(error)
                        {
                            
                            chai.assert.ok(false)
        
                        }
                        else{
                                idMsg = result;
                                chai.assert.ok(idMsg && idMsg!=="")
                        }
                        
                        });
                        
                    } catch (error) {
                        chai.assert.ok(false)
                    } 
                });

            it('borrarMsg -> ok', async function () {
                    // This code will be executed by the test driver when the app is started
                    // in the correct mode
                try {
                    
                    getIds().idUser = getIds().idProfesor;
                    let msg : Message = {
                        _id : Random.id(),
                        from : getIds().idProfesor,
                        to : getIds().idAlumno,
                        msgTipo : MsgTipo.CALL_INI,
                        
                    }
                    Msg.collection.insert(msg);
                                    
                        
                 

                    getIds().idUser = getIds().idAlumno;
                    
                    Meteor.call('borrarMsg', msg._id, async (error, result)=>{
                        
                        if(error)
                        {
                            
                            chai.assert.ok(false)
        
                        }
                        else{
                                await result
                                let aux = Msg.findOne(msg._id);
                                console.log("result: " +result + ", " + JSON.stringify(aux))
                                chai.assert.ok(!aux)
                        }
                        
                        });
                        
                    } catch (error) {
                        chai.assert.ok(false)
                    } 
                });
                


                it('borrarMsg -> error usuario sin permisos a borrar', async function () {
                    // This code will be executed by the test driver when the app is started
                    // in the correct mode
                try {
                    
                    getIds().idUser = getIds().idProfesor;
                    let msg : Message = {
                        _id : Random.id(),
                        from : getIds().idProfesor,
                        to : getIds().idAlumno,
                        msgTipo : MsgTipo.CALL_INI,
                        
                    }
                    await from(Msg.insert(msg)).toPromise();

                    ///getIds().idUser = getIds().idAlumno;
                    Meteor.call('borrarMsg', msg._id, (error, result)=>{
                        
                        if(error)
                        {
                            console.log(JSON.stringify(error))
                            chai.assert.ok(true)
        
                        }
                        else{
                                let aux = Msg.findOne(msg._id);
                                console.log("result: " +result + ", " + JSON.stringify(aux))
                                chai.assert.ok(!aux)
                        }
                        
                        });
                        
                    } catch (error) {
                        chai.assert.ok(true)
                    } 
                });





        })
        
        

        describe('methods/rooms.ts', function () {

            var idClase = "";
       
            before(async function (done) {
            
                try {
                    
                    getIds().idProfesor = await  new Promise((res, rej)=>
                    {
                        Meteor.call('unirse',userLogin ,(error, result)=>{
                                    
                                    
                            if(error)
                            {
                                rej(error)
        
                            }
                            else{
                                res(result);
                            }
                        });

                    })
                    //cambiamos el profesor a roll profesor
                    getIds().idUser = getIds().idProfesor;
                    await  new Promise((res, rej)=>
                    {
                        Meteor.call('changePerfilToProfesor' ,(error, result)=>{
                                    
                                    
                            if(error)
                            {
                                rej(error)
        
                            }
                            else{
                                res(result);
                            }
                        });

                    })
    
                    console.log("idProfesor: " + getIds().idProfesor);
        

                    getIds().idAlumno = await  new Promise((res, rej)=>
                    {
                        Meteor.call('unirse',userLogin2 ,(error, result)=>{
                                    
                                    
                            if(error)
                            {
                                rej(error)
        
                            }
                            else{
                                res(result);
                            }
                        });

                    })
                    console.log("idAlumno: " + getIds().idAlumno);
                    done();
                } catch (error) {
                    done(error);
                }
            })
            after(function (done) {
                try {
                    Users.remove(getIds().idProfesor);
                    getIds().idProfesor ="";
                    Users.remove(getIds().idAlumno);
                    getIds().idAlumno="";
                    getIds().idUser ="";
                    //console.log("borrados elementos")
                    done();
                } catch (error) {
                        done(error);
                }
                    
             })

             afterEach((done)=>
            {
                Rooms.remove(idClase)
                done()
            })


        it('crear clase -> correcto', function () {
                // This code will be executed by the test driver when the app is started
                // in the correct mode
            try {
                //crea la clase el alumno
                getIds().idUser = getIds().idAlumno;
                //input el profesor
                Meteor.call('crearClase', getIds().idProfesor, (error, result)=>{
                    
                    if(error)
                    {
                        
                        chai.assert.ok(false)
    
                    }
                    else{
                            idClase = result;
                            chai.assert.ok(idClase && idClase!=="")
                    }
                    
                    });
                    
                } catch (error) {
                    chai.assert.ok(false)
                } 
            });

        
            it('borrar clase -> correcto', async function () {
                // This code will be executed by the test driver when the app is started
                // in the correct mode
            try {
                //crea la clase el alumno
                getIds().idUser = getIds().idAlumno;
                
                await new Promise((res,rej)=>{

                    Meteor.call('crearClase', getIds().idProfesor, (error, result)=>{
                        
                        if(error)
                        {
                            
                            rej(error)
        
                        }
                        else{
                                idClase = result;
                                res(result);
                        }
                        
                        });

                })
                //input el profesor
                Meteor.call('terminarClase', false,(error, result)=>{
                    
                    if(error)
                    {
                        console.log(JSON.stringify(error))
                        chai.assert.ok(false)
    
                    }
                    else{
                            
                            chai.assert.ok(true)
                    }
                    
                    });
                    
                } catch (error) {
                    chai.assert.ok(false)
                } 
            });





    })
    })

    

    })