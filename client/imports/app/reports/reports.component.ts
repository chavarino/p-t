
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Rooms } from 'imports/collections/room';
import { Observable, Subscription } from 'rxjs';
import { Room, TipoBusqueda } from 'imports/models/room';
import { Generic } from 'imports/clases/generic.class';
import { RolesService } from '../services/roles.service';



@Component({
    selector: 'reports',
    templateUrl: 'reports.html',
    styleUrls: ['reports.scss']
  })
  export class ReportsComponent extends Generic implements OnInit, OnDestroy {
    clases : Observable<Room[]>;
    roomAlumnoSuscript: Subscription;
    tBusqueda : TipoBusqueda; 
    private conversion :number = 60000.00;

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
    }
    ngOnInit() {
      
      if(this.canReadC('prof'))
      {
        this.tBusqueda = TipoBusqueda.ALL//this.canReadC("prof")  ? TipoBusqueda.PROFES : TipoBusqueda.ALUMNO;
      }
      else{
        this.tBusqueda = TipoBusqueda.ALUMNO//this.canReadC("prof")  ? TipoBusqueda.PROFES : TipoBusqueda.ALUMNO;
      }
        
      this.roomAlumnoSuscript =  MeteorObservable.subscribe('getRoomReport').subscribe(() => {
                
    
       
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
    calcPrecioTotal (clase : Room) : number
    {
       return clase.precio * this.calcMinutos(clase);
    }
    calcMinutos(clase : Room) : number
    {
          return  (clase.fechaFin.getTime() - clase.fechaIni.getTime()) / this.conversion;
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
    ngOnDestroy(){
        if(this.roomAlumnoSuscript)
        {
          this.roomAlumnoSuscript.unsubscribe()
        }
    }

    
  }