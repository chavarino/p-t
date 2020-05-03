
import { HTTP } from 'meteor/http'
import { MethodsClass } from 'imports/functions/methodsClass';
import { Users } from 'imports/collections/users';
import  {secretshared} from '../libAux/sharedPass'
import { ModulesEnum } from 'imports/models/enums';
import { Perfil } from 'imports/models/perfil';
import { updateDatePing } from './room';
import { User } from 'imports/models/User';
var crypto = require('crypto');

  
  // Node Get ICE STUN and TURN list
  let o = {
      format: "urls"
    };
    
    let bodyString = JSON.stringify(o);
    let https = require("https");
    let options = {
    //  host: "global.xirsys.net",
     // path: "/_turn/MyFirstApp",
      //method: "PUT",
      headers: {
          "Authorization": "Basic " + Buffer.from("fasmos:73cf7268-786a-11e9-915f-0242ac110003").toString("base64"),
          "Content-Type": "application/json",
          "Content-Length": bodyString.length
      }
    };
    
  let servers;
   let getServers = () =>{
  
          try {
              console.log("INCIA Get SErvers");
              let httpreq = https.request(options, function(httpres) {
  
                  console.log("preparado");
                  let str = "";
                  httpres.on("data", function(data){ 
                      
                      console.log("Datos " + data)
                      str += data; });
                  httpres.on("error", function(e){ console.log("error: ",e); });
                  httpres.on("end", function(){ 
                      console.log("ICE List: ", str);
                  });
              });
              httpreq.on("error", function(e){ console.log("request error: ",e); });
              httpreq.end();
              
          } catch (error) {
                  console.log("ERROR AL TRAER SERVIDORES")
          }
    }
    
    Meteor.methods(
      {
        getNumAlumnosConectados()
        {
            return Users.find({"lastModulo" :  ModulesEnum.CLASE_ALUMNO}).cursor.map((doc :User) => {
                return  (new Date().getTime() - doc.lastUpdate.getTime()) <= 40000 ? 1 : 0
               
            }).reduce( (p : number, c : number)=> {
              return p + c;
            }, 0  )
        },
  
        
          getDiffTimeInSeconds(date1 : Date) {
      
               //TODO GENERAR TIEMPO EN SERVIDOR.
                
               check(date1, Date);
               let current = new Date();
               return Math.floor(((current.getTime() - date1.getTime()) /1000));
      
      
          },
          getServerCustom()
          {
              if(Meteor.userId())
              {
                //"turn:eu-turn1.xirsys.com:80?transport=udp"
                this.unblock();
                  
                        var unixTimeStamp = Math.floor(Date.now()/1000)  + 24*3600,
                        username = [unixTimeStamp, Meteor.userId()].join(':'),
                        credential,
                    hmac = crypto.createHmac('sha1', secretshared);
                    hmac.setEncoding('base64');
                    hmac.write(username);
                    hmac.end();
                    credential = hmac.read();
                    return {
                      url : "turn:sapens.es:3478?transport=udp",
                       username,
                       credential
                    };
                                      
              }

              return {};

          },
          getServers(){
  
              this.unblock();
  
              try {
                if(!Meteor.user())
                {  
                    MethodsClass.noLogueado();
                }
                  let result = HTTP.put("https://global.xirsys.net/_turn/MyFirstApp", options )
  
  
                  /*const result = HTTP.call('GET', 'http://api.twitter.com/xyz', {
                    params: { user: userId }
                  });*/
                  console.log("getServers ok Erulstado " + result)
                  return result;
                } catch (e) {
                    console.log("getServers error")
                  // Got a network error, timeout, or HTTP error in the 400 or 500 range.
                  return false;
                }
  
                  
          },
          setAlive(module : ModulesEnum)
          {
  
            if(!Meteor.user())
            {  
                MethodsClass.noLogueado();
            }
  
            let ip =""
            try {
              ip = this.connection.clientAddress;
            } catch (error) {
              ip = "NOT_IP"
              console.log("Ip error : " + error);
            }
            if(ModulesEnum.CLASE_PRFSOR === module || module=== ModulesEnum.CLASE_ALUMNO ) 
            {
              let perfil : Perfil = Meteor.user().profile;
              if(perfil.claseId)
              {
                  updateDatePing(perfil.claseId, Meteor.userId())
  
              }

            }
  
                Users.update({_id : Meteor.userId()}, {$set : { lastUpdate : new Date(), lastIp: ip, lastModulo: module}});
          }
      }
      )

