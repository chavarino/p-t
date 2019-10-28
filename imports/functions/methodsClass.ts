import { Meteor } from 'meteor/meteor';
import { isFunction, isUndefined } from 'util';
import  { modalObj} from "../../client/imports/app/services/flags.service"
import { Log } from './commonFunctions';
export class MethodsClass {

    static msg = {
        modal :{
            confirm : {
                title : "Confirmacion",
                bProfCall : "¿Quieres llamar  aeste profesor?",
                bSetProfesor : "¿Seguro que quieres ser profesor?"
            }
        },
        rtc :{
          error:{
  
            sourceVideo : "Error al establecer medio, asegurese de dar permisos para compartir camara o escritorio."
          }
        }
      }
    

    static call(method : string , ...args: any[])
    {

        let fn, fn2 = undefined;
        let input = undefined;
        
        
        /*if(args.length==1)
        {
            
            
            
        }
        else if(args.length==2)
        {
            if(isFunction(args[1]) && !isUndefined(args[1]))
            {
                
                fn = args[1];
                
            }
            
            if( !isUndefined(args[0]))
            {
                
                input = args[1];
                
            }
            
            
        } */
        let args2 : any[] = []
        
        for (let i = 0; i < args.length; i++) {
            const element = args[i];
            if(isFunction(element) && !fn)
            {
                
                fn = element;
                
                
            }
            else if(isFunction(element))
            {
                fn2 = element;
            }
            else if(!isUndefined(element)){
               // input = element
                args2.push(element);
            }
            
        }
        args2.push((error,result) => {
            MethodsClass.frontHandle(error, fn, result, fn2)
        })
        /*if(!isUndefined(input))
        {
            args2.unshift(input);
        }*/
        
      /*  
        if(args2.length===0 || args2.length===1)
        {
            Meteor.call(method, args2[0] );

        }
        else if(args2.length===2)
        {
            Meteor.call(method, args2[0], args2[1] );

        }*/

        Meteor.call(method, ...args2 );
    }
    static frontHandle(error, fn, result, fnError)
    {
        
        
            if(error)
            {
                alert(error);
                console.error(error);
                if(fnError)
                {
                    fnError(error)

                }
                throw new Meteor.Error(error);
            }
            else{
                if(fn)
                {
                    fn(result);
                }
            }
            
    }
    
    static camposInsuficientes() 
    {
        
        throw new Meteor.Error(500, 'No logueado');
    }
    static noLogueado() 
    {
        
        throw new Meteor.Error(500, 'No logueado');
    }
    
    static duplic() 
    {
        
        throw new Meteor.Error(500, 'No se puede crear más de una clase a la vez');
    }

    static noPermisos() 
    {
        
        throw new Meteor.Error(500, 'No tienes permisos para hacer dicha acción');
    }

    static creacionUserGeneral() 
    {
        
        throw new Meteor.Error(500, 'No se pudo crear usuario, usuario/contraseña incorrectos.');
    }
    /**
     * 
     * @param cod Codigo de error
     * @param modulo modulo donde se ha producido
     * @param src descripcion del error
     * @param logPrivate texto de error que solo se imprimirá en el log privado del servidor
     * @param user  usuarios
     */
    static except(cod:number ,modulo: string, src :string, logPrivate: string, user ?:string)
    {
        let logPrivateError = logPrivate && logPrivate !== "" ? ` [ ${logPrivate} ]` : "";
        Log.logStatic(modulo, (user|| "") + " - " + src + logPrivateError, true)
        throw new Meteor.Error(cod || 500, src);
    }
    static errorSetDisponible() 
    {
        
        throw new Meteor.Error(500, 'Error al cambiar de estado');
    }

    static errorSala() 
    {
        
        throw new Meteor.Error(500, 'Error Sala inexistente');
    }
    static errorProfesorNoDisponible() 
    {
        
        throw new Meteor.Error(500, 'El profesor seleccionado no está disponible');
    }
    static creacionUserYaExiste() 
    {
        
        throw new Meteor.Error(500, 'Usuario ya existente');
    }

    static getConfigConfirm(title: string, body :string, fn : (evento)=> void) : modalObj
    {
        return {config: {title: title, msg : body, tipo : 1}, fn : fn};
    }
    static errorAsignarSource()
    {
        let vm =this;
        console.log(vm.msg.rtc.error.sourceVideo)
        alert(vm.msg.rtc.error.sourceVideo)
    }
}