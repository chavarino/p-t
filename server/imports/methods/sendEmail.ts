import { sendEmail } from "../libAux/sendEmail";
import { User } from 'imports/models/User';
import { Perfil } from 'imports/models/perfil';
import { Room } from 'imports/models/room';
import { secretshared } from '../libAux/sharedPass';
import { Kpm } from 'imports/models/kpm';

const emailTo = /*"javier.chavarino.1991@gmail.com"*/'info@sapens.es';

const emailFrom ='desarrollo@sapens.es'

Accounts.emailTemplates.siteName = 'sapens.es';
Accounts.emailTemplates.from = `Sapens <${emailFrom}>`;

Accounts.emailTemplates.enrollAccount.subject = (user) => {
  return `Bienvenido a Sapens, ${(user.profile as Perfil).nombre}`;
};

Accounts.emailTemplates.enrollAccount.text = (user, url) => {
  return '¡Estamos encantados de que hayas elegido Sapens como plataforma de enseñanza, para resolver clases y dudas de forma online!'
    + ' Para activar tu cuenta, simplemente accede al enlace siguiente:\n\n'
    + url;
};

Accounts.emailTemplates.resetPassword.from = () => {
  // Overrides the value set in `Accounts.emailTemplates.from` when resetting
  // passwords.
  return `Sapens, Recupera tu contraseña <${emailFrom}>`;
};
Accounts.emailTemplates.verifyEmail = {
   subject() {
      return "¡Activa tu cuenta ahora!";
   },
   text(user, url) {
      return `¡Hola ${(user.profile as Perfil).nombre}! verifica tu correo en el siguiente enlace: ${url}`;
   }
};

Meteor.methods(
    {
      async sendSugerencia(cuerpo : string)
      {
        this.unblock();
     
        // Servidor: pro2.mail.ovh.net
        /*
          entrada [18:31, 28/4/2020]  Cifrado: SSL/TLS
            [18:31, 28/4/2020] Elias: Puerto: 993
          salida: Puerto: 587
        */
        
        
        let tipo = "Sugerencia/Incidencia"
     
        var [ email, name, id] = emailFormat(tipo);
        let mensaje  = `<h3><span style="font-family: Arial;"><b>${tipo}</b></span></h3><ul><li>nombre: <b>${name}</b></li><li>email:<b> ${email}</b></li><li>id:<b> ${id}</b></li></ul><p><b>Comentario:</b></p><p>${cuerpo.replace(/script/g, "")}</p>`;
        sendEmail(
            emailTo,
          `Sapens Robot Info <${emailFrom}>`,
          `SUG-${email}`,
           mensaje)
         
         
         
          return "OK, sugerencia enviada"
          
       


      },
      async sendValoracion(room : Room, secret :string)
      {
        this.unblock();
     
        // Servidor: pro2.mail.ovh.net
        /*
          entrada [18:31, 28/4/2020]  Cifrado: SSL/TLS
            [18:31, 28/4/2020] Elias: Puerto: 993
          salida: Puerto: 587
        */
      
       if(!room || !room.scores || !room.scores.profesor || secretshared !== secret)
       {
           console.log("No tiene datos para mandar un email")
           return;
       }
       try {
           
           //si no dio valoraciones
           let valoraciones = "";
           if(!room.scores.profesor.kpms || room.scores.profesor.kpms.length===0)
           {
                valoraciones ='<p><font color="#000000"><b>El usuario no ha realizado valoraciones</b></font></p>'
           }
           else{
                let array : Kpm[] = room.scores.profesor.kpms;
                valoraciones = `
                <table style="border-collapse: collapse;border: 1px solid #dddddd;">
                    <tr>
                        <th style="text-align:left;border: 1px solid #dddddd;padding:10px">Pregunta</th>
    
                        <th style="text-align:left;border: 1px solid #dddddd;padding:10px">Puntuación</th>
    
                    </tr>
                    ${
    
                        array.reduce((prev, curr)=> prev + `<tr>
                            <td  style="border: 1px solid #dddddd;padding:10px">${curr.question}</td>
                            <td  style="border: 1px solid #dddddd;padding:10px">${curr.answer}</td>
                                                </tr>`, "")
                    }
    
                    <tr>
                        <th  style="border: 1px solid #dddddd;padding:10px">Media</th>
                    
                        <td  style="border: 1px solid #dddddd;padding:10px">${(array.map((v :Kpm) => v.answer ).reduce((prev, curr)=> prev + curr, 0)/array.length).toFixed(2)}</td>
                    </tr>
                    
                    </table>
                    `
           }
    
           let tipo = "Nueva Valoracion"
         
          
           let mensaje  = 
            `<h3><font face="Arial"><b>${tipo}</b></font></h3><ul><li>Id clase: <b>${room._id}</b></li><li>profesor:<b> ${room.nomProfe} (${room.profId})</b></li><li>alumno:&nbsp;<span style="font-weight: 700;">${room.nomAlumn} (${room.alumnoId})</span></li><li>fecha comienzo:&nbsp;<span style="font-weight: 700;">${room.fechaCom}&nbsp;</span></li><li>fecha fin:&nbsp;<span style="font-weight: 700;">${room.fechaFin}</span></li><li>precio(€/tiempo):&nbsp;<span style="font-weight: 700;">${room.precio}</span></li></ul><p><b>Valoraciones Fecha valoración: ${room.scores.profesor.dateScore}</b></p><p><b>${valoraciones} </b></p><p><b>Comentario:</b></p><p>${room.scores.profesor.comentario.replace(/script/g, "")}</p>`;
           //`<h3><span style="font-family: Arial;"><b>${tipo}</b></span></h3><ul><li>nombre: <b>${name}</b></li><li>email:<b> ${email}</b></li><li>id:<b> ${id}</b></li></ul><p>mensaje:</p><p>${cuerpo.replace(/script/g, "")}</p>`;
    
           sendEmail(
               emailTo,
             `Sapens Robot Info <${emailFrom}>`,
             `VAL-${room._id}`,
              mensaje)
       } catch (error) {
           console.log("Error al enviar email valoracion: " + error)
       }
         
         
         
          return "OK, sugerencia enviada"
          
       


      }
    });

const emailFormat = ( tipo: string)  : Array<string> =>{

    let email, name, id;
        let user : User= Meteor.user();
    if (!user) {
        email = "NA";
        name = "Anónimo";
        id = "NA";
    }
    else {
        email = user.emails[0].address;
        let perfil: Perfil = (user.profile as Perfil);
        name = `${perfil.nombre} ${perfil.apellidos}`;
        id = user._id;
    }
    
    return [ email, name, id]  ;
} 
