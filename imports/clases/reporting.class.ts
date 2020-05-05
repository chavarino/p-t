import { Generic } from './generic.class';
import { RolesService } from 'client/imports/app/services/roles.service';
import { Room } from 'imports/models/room';
import { Observable, Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { isDefined } from '@angular/compiler/src/util';


export class ReportingGeneric  extends Generic{

     conversion :number = 60000.00;
    
    roomSuscript: Subscription;
    pipe = new DatePipe('es-ES'); // Use your own locale

    constructor(minWrite : number,  minRead : number,modulo : string, rol : RolesService )
    {
      super(minWrite,  minRead, modulo, rol );


      
    }

    formatDate( date : Date) : string
    {
        if(!date || isNaN(date.getTime()))
        {
            return ""
        }
        return this.pipe.transform(date, 'short');
    }
    calcPrecioTotal (clase : Room) : number
    {
       return clase.precio * this.calcMinutos(clase);
    }
    calcMinutos(clase : Room) : number
    {
        let fechaFin : Date = isDefined(clase.fechaFin) ? clase.fechaFin : new Date();
          return  (fechaFin.getTime() - clase.fechaIni.getTime()) / this.conversion;
    }

    calcTiempo(clase :Room) : string
    {
        let tMinT :number = this.calcMinutos(clase);

        let tMin : number =  Math.floor(tMinT);
        let seconds : number  =  Math.round(  (tMinT - tMin) * 60);
        return `${tMin}' ${seconds}''`

    }

    calcularPuntuacion(clase : Room) : number
    {
          if(!clase.scores)
          {
            return 0;
          }
          return clase.scores.profesor.kpms.reduce((bef, act)=>{

              
              return bef + act.answer * (act.ponderacion ?  act.ponderacion : 1/clase.scores.profesor.kpms.length);
          }, 0);
    }
    imI(id :string) : boolean
    {
        return id === Meteor.userId();
    }
}