import { Meteor } from 'meteor/meteor';
import { isFunction, isUndefined } from 'util';
export class MethodsClass {

    static msg = {
        rtc :{
          error:{
  
            sourceVideo : "Error al establecer medio, asegurese de dar permisos para compartir camara o escritorio."
          }
        }
      }


    static call(method : string , ...args: any[])
    {

        let fn = undefined;
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
        
        for (let i = 0; i < 2; i++) {
            const element = args[i];
            if(isFunction(element))
            {
                
                fn = element;
                
            }
            else if(!isUndefined(element)){
                input = element
            }
            
        }
        
        let args2 : any[] = [(error,result) => {
            MethodsClass.frontHandle(error, fn, result)
        }]
        if(!isUndefined(input))
        {
            args2.unshift(input);
        }
        
        
        if(args2.length===0 || args2.length===1)
        {
            Meteor.call(method, args[0] );

        }
        else if(args2.length===2)
        {
            Meteor.call(method, args[0], args[1] );

        }
    }
    static frontHandle(error, fn, result)
    {
        
        
            if(error)
            {
                alert(error);
                console.error(error);
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
        
        throw new Meteor.Error('Error', 'No logueado');
    }
    static noLogueado() 
    {
        
        throw new Meteor.Error('Error', 'No logueado');
    }
    
    static duplic() 
    {
        
        throw new Meteor.Error('Error', 'No se puede crear más de una clase a la vez');
    }

    static noPermisos() 
    {
        
        throw new Meteor.Error('Error', 'No tienes permisos para hacer dicha acción');
    }

    static creacionUserGeneral() 
    {
        
        throw new Meteor.Error('Error', 'No se pudo crear usuario, usuario/contraseña incorrectos.');
    }
    static errorSetDisponible() 
    {
        
        throw new Meteor.Error('Error', 'Error al cambiar de estado');
    }

    static errorSala() 
    {
        
        throw new Meteor.Error('Error', 'Error Sala inexistente');
    }
    static errorProfesorNoDisponible() 
    {
        
        throw new Meteor.Error('Error', 'El profesor seleccionado no está disponible');
    }
    static creacionUserYaExiste() 
    {
        
        throw new Meteor.Error('Error', 'Usuario ya existente');
    }

    static errorAsignarSource()
    {
        let vm =this;
        console.log(vm.msg.rtc.error.sourceVideo)
        alert(vm.msg.rtc.error.sourceVideo)
    }
}