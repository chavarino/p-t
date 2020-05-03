
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Rooms } from 'imports/collections/room';

import { Room, TipoBusqueda } from 'imports/models/room';
import { RolesService } from '../services/roles.service';
import { ModulesEnum } from 'imports/models/enums';
import { ReportingGeneric } from 'imports/clases/reporting.class';
import { Observable } from 'rxjs';



@Component({
    selector: 'reports',
    templateUrl: 'reports.html',
    styleUrls: ['reports.scss']
  })
  export class ReportsComponent extends ReportingGeneric implements OnInit, OnDestroy {
    
    tBusqueda : TipoBusqueda; 
    clases : Observable<Room[]>;

    tags = [ 
        {
          tBusqueda :  TipoBusqueda.PROFES,
          texto : "Profesor",
          mostrar : ()=> this.canReadC('prof')

        },
        {
          tBusqueda :  TipoBusqueda.ALUMNO,
          texto : "Alumno",
          mostrar : ()=> this.canReadC('login')

        },
        {
          tBusqueda :  TipoBusqueda.ALL,
          texto : "Todos",
          mostrar : ()=> this.canReadC('prof')

        }

    ]
    constructor( rol : RolesService)
    {
      super(0,  0, "report", rol );

      rol.setModulo(ModulesEnum.HISTORIAL);
    }
    ngOnInit() {
      
      if(this.canReadC('prof'))
      {
        this.tBusqueda = TipoBusqueda.ALL//this.canReadC("prof")  ? TipoBusqueda.PROFES : TipoBusqueda.ALUMNO;
      }
      else{
        this.tBusqueda = TipoBusqueda.ALUMNO//this.canReadC("prof")  ? TipoBusqueda.PROFES : TipoBusqueda.ALUMNO;
      }
        
      this.roomSuscript =  MeteorObservable.subscribe('getRoomReport').subscribe(() => {
                
    
       
          this.getRoomReport();
  
      //getRoomReport
      });
    }

    setTBusqueda(t)
    {
        this.tBusqueda = t.tBusqueda;
        this.getRoomReport();
    }
    getRoomReport()
    {
      let input = {};
/*

{ $or : [  
    { profId : Meteor.userId()}, 
    { alumnoId : Meteor.userId()} ]
                  }*/
      if(this.tBusqueda === TipoBusqueda.PROFES)
      {
          input ={ profId : Meteor.userId()};
      }
      else if(this.tBusqueda === TipoBusqueda.ALUMNO)
      {
        input = { alumnoId : Meteor.userId()};
      }
      this.clases= Rooms.find(input);


     
    }
    
    ngOnDestroy(){
        if(this.roomSuscript)
        {
          this.roomSuscript.unsubscribe()
        }
    }

    
  }