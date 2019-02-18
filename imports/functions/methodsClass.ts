import { Meteor } from 'meteor/meteor';
import { isFunction, isUndefined } from 'util';
export class MethodsClass {




    static call(method : string , ...args: any[])
    {

        let fn = undefined;
        let input = undefined;
        let args2 : any[] = [(error) => {
            MethodsClass.frontHandle(error, fn)
        }]
        
        if(args.length==1)
        {

            if(isFunction(args[0]))
            {

                fn = args[0];

            }
            else if(!isUndefined(args[0])){
                input = args[0]
            }

        }
        else if(args.length==2)
        {
            if(isFunction(args[0]) && !isUndefined(args[0]))
            {

                fn = args[0];

            }

            if( !isUndefined(args[1]))
            {

                input = args[1];

            }


        }

            if(!isUndefined(input))
            {
                args2.unshift(input);
            }
        
            

        Meteor.call(method, args2 );
    }
    static frontHandle(error, fn)
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
                    fn();
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
}