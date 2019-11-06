import { Customer, PerfilPagos } from 'imports/models/perfilPagos.model';
import { MethodsClass } from 'imports/functions/methodsClass';
import { PerfilPagosColl } from 'imports/collections/perfilPagos.collection';


Meteor.publish('getPerfilPago', function() {
    
    if(!Meteor.user())
    {  
        MethodsClass.noLogueado();
      }
  
     // {sort: {fecha: -1}}
  return PerfilPagosColl.find({ idCliente : Meteor.userId()}, {fields:  {
    '_id' : 1
  }});
});
