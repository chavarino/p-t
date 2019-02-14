import { Meteor } from 'meteor/meteor';
export class Error {


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