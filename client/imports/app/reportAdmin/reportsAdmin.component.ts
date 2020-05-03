
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MeteorObservable } from 'meteor-rxjs';
import { Rooms } from 'imports/collections/room';

import { Room, TipoBusqueda } from 'imports/models/room';
import { RolesService } from '../services/roles.service';
import { ModulesEnum } from 'imports/models/enums';
import { ReportingGeneric } from 'imports/clases/reporting.class';
import { RolesEnum, Perfil } from 'imports/models/perfil';
import { Observable, of, Subscription, from } from 'rxjs';
import { Users } from 'imports/collections/users';
import { User } from 'imports/models/User';
import { isDefined } from '@angular/compiler/src/util';


interface BuscadorGenericInterface {


}
interface BuscadorClaseInterface extends BuscadorGenericInterface {
    id ?: string
    fechIni ?: string,
    fechFin ?: string,
    prfName ?: string,
        condprfElo ?: number,
    prfElo ?: number,
    aluName ?: string,
    duracion?: string,
        condprecioTime?: number,
    precioTime?: number,
        condprecioTotal?: number,
    precioTotal?: number,
        condpuntuacion ?: number,
    puntuacion?: number,
    duracionMins ?: number

}

interface BuscadorUsersInterface  extends BuscadorGenericInterface {
    email ?: string,
    emailVerificado ? :boolean,
    nombre ?: string,
     rol?: number,
     desRol ?: string,

    modulo ?: number,
    desModulo ?: string,
    fechCreate ?: string,
    lastUpdate?: string,
    ip ?: string,
    conectado?: boolean,
    claseId  ?: string
    disponible ?: Boolean

   

}
interface EstadisticaInterface {
    nombre: string,
    view : string |number,
    descMetodo : string
    metodo: ()=>Promise<number|string>

}

interface ComboInterface {

    codigo : number|string|boolean,
    valor: string
}
enum CondicionalEnum {

    MENOR = 1,
    MENOR_IGUAL = 2,
    IGUAL = 3,
    MAYOR_IGUAL = 4,
    MAYOR = 5

}

@Component({
    selector: 'reportsAdmin',
    templateUrl: 'reportsAdmin.html',
    styleUrls: ['reportsAdmin.scss']
  })
  export class ReportsAdminComponent extends ReportingGeneric implements OnInit, OnDestroy {
    
    tiempoMaximoSinPing = 30000;
    filtroBuscadorClase : BuscadorClaseInterface;
    filtroBuscadorUsuario : BuscadorUsersInterface;
    valorPorDefect : ComboInterface = {
        codigo : undefined,
        valor: "Todos"
    }
    combos : {
        condicionales : Array<ComboInterface>,
        roles : Array<ComboInterface>,
        modulos : Array<ComboInterface>,
        condicConectd : Array<ComboInterface>

    }
    usuariosOri : BuscadorUsersInterface[];
    clasesOri : BuscadorClaseInterface[];
    usuarios : Observable<BuscadorUsersInterface[]>;
    clases : Observable<BuscadorClaseInterface[]>;
    usersSuscript: Subscription;

    campos: {
        string : Array<string>
            boolean : Array<string>,
            combo : Array<string>,
            numberCondicional : Array<string>
        };
    acordeon ;

    
    estadisticas : {
        usuarios : Array<EstadisticaInterface>,
        clases : Array<EstadisticaInterface>

    } 
    defineCombos(){
        

   
        
        this.combos = {
            
            condicionales : [
            // this.valorPorDefect,
                {
                    codigo : CondicionalEnum.MENOR,
                    valor : "<"
                },
                {
                    codigo : CondicionalEnum.MENOR_IGUAL,
                    valor : "<="
                },
                {
                    codigo : CondicionalEnum.IGUAL,
                    valor : "="
                },
                {
                    codigo : CondicionalEnum.MAYOR_IGUAL,
                    valor : ">="
                },
                {
                    codigo : CondicionalEnum.MAYOR,
                    valor : ">"
                }
            ],

            roles: [
                this.valorPorDefect,
                {
                    codigo: RolesEnum.ALUMNO,
                    valor : "Alumno",
                    
                },
                {
                    codigo: RolesEnum.PROFFESOR,
                    valor : "Profesor",
                    
                },
                {
                    codigo: RolesEnum.ADMIN,
                    valor : "Administrador",
                    
                }

            ],
            
            modulos : [
            this.valorPorDefect,
            {
                codigo: ModulesEnum.INICIO,
                valor : "Inicio",
                
            },
            {
                codigo: ModulesEnum.CLASE_ALUMNO,
                valor : "Clase-alumno",
                
            },
            {
                    codigo: ModulesEnum.CLASE_PRFSOR,
                    valor : "Clase-profesor",
                    
                },
                {
                    codigo: ModulesEnum.PERFIL,
                    valor : "Perfil",
                    
                },
            
                {
                    codigo: ModulesEnum.HISTORIAL,
                    valor : "Historial",
                    
                },
            
                {
                    codigo: ModulesEnum.REPORTING_ADMIN,
                    valor : "Reporting admin",
                    
                }

        ],

        condicConectd : [
            this.valorPorDefect,
            {
                codigo: true,
                valor : "Conectado",
                
            },
            {
                codigo: false,
                valor : "No Conectado",
                
            }

        ]
    }
        //RolesEnum.

    }
    constructor( rol : RolesService,private cd :ChangeDetectorRef)
    {
      super(0,  0, "report", rol );


      this.estadisticas = 
      
      
      {
          usuarios: [

            {
                nombre: "Número (filtro/total)",
                view : "",
                descMetodo: "Número total de usuarios filtrados/Número total de usuarios",
                metodo : async ()=>{
                    let arrayAux  = (await this.usuarios.toPromise());
                    let u :number =arrayAux.length
                    return `${u}/${this.usuariosOri.length}`
                }
            },
            {
                nombre: "Alumnos % (filtro/total)",
                view : "",
                descMetodo: "Porcentaje de alumnos. Este método considera como tal a los perfiles Alumno y otros perfiles que estén en el modulo de clase de alumno. % alumnos con el filtro aplicado/ % de alumnos totales",
                metodo : async ()=>{

                    let arrayAux  = (await this.usuarios.toPromise());
                    let u1 :number =  arrayAux.filter((v)=>{return v.rol===RolesEnum.ALUMNO || v.modulo===ModulesEnum.CLASE_ALUMNO}).length *100 / arrayAux.length // this.usuariosOri.length
                    let uT : number =  this.usuariosOri.filter((v)=>{return v.rol===RolesEnum.ALUMNO|| v.modulo===ModulesEnum.CLASE_ALUMNO}).length *100/ this.usuariosOri.length;
                    return `${u1.toFixed(2)}/${uT.toFixed(2)}`
                }
            },
            {
                nombre: "Profesores % (filtro/total)",
                view : "",
                descMetodo: "Porcentaje de profesores. Este método considera como tal a los perfiles profesor que no estén en el modulo de clase de alumno y otros perfiles que estén en el módulo de clase de profesor. % profesores con el filtro aplicado/ % de profesores totales",
                metodo : async ()=>{

                    let arrayAux  = (await this.usuarios.toPromise());
                    let u1 :number =  arrayAux.filter((v)=>{return  v.rol===RolesEnum.PROFFESOR && v.modulo!==ModulesEnum.CLASE_ALUMNO || v.modulo===ModulesEnum.CLASE_PRFSOR}).length *100 / arrayAux.length // this.usuariosOri.length
                    let uT : number =  this.usuariosOri.filter((v)=>{ return v.rol===RolesEnum.PROFFESOR && v.modulo!==ModulesEnum.CLASE_ALUMNO || v.modulo===ModulesEnum.CLASE_PRFSOR}).length *100/ this.usuariosOri.length;
                    return `${u1.toFixed(2)}/${uT.toFixed(2)}`
                }
            },
            {
                nombre: "Otros perfiles % (filtro/total)",
                view : "",
                descMetodo: "Porcentaje de otros perfiles diferentes a alumno o profesor. Este método considera como tal a perfiles diferentes a los que no son ni alumno ni profesor (por ejemplo admin) o que no estén ejerciendo como tal. % otros perfiles con el filtro aplicado/ % de otros perfiles totales",
                metodo : async ()=>{

                    let arrayAux  = (await this.usuarios.toPromise());
                    let u1 :number =  arrayAux.filter((v)=>{return  v.rol!==RolesEnum.PROFFESOR && v.rol!==RolesEnum.ALUMNO  && v.modulo!==ModulesEnum.CLASE_ALUMNO &&  v.modulo!==ModulesEnum.CLASE_PRFSOR  }).length *100 / arrayAux.length // this.usuariosOri.length
                    let uT : number =  this.usuariosOri.filter((v)=>{ return v.rol!==RolesEnum.PROFFESOR && v.rol!==RolesEnum.ALUMNO  && v.modulo!==ModulesEnum.CLASE_ALUMNO &&  v.modulo!==ModulesEnum.CLASE_PRFSOR}).length *100/ this.usuariosOri.length;
                    return `${u1.toFixed(2)}/${uT.toFixed(2)}`
                }
            }

      ],
      clases : [
        {
            nombre: "Número (filtro/total)",
            view : "",
            descMetodo: "Número total de clases filtrados/Número total de clases",
            metodo : async ()=>{
                let arrayAux  = (await this.clases.toPromise());
                let u :number =arrayAux.length
                return `${u}/${this.clasesOri.length}`
            }
        },
        {
            nombre: "Duración (minutos) (Min/Media/Max/Sum)",
            view : "",
            descMetodo: "Cálculo del valor mínimo, medio, máximo y sumatorio de las duraciones en minutos sobre la lista filtrada",
            metodo : async ()=>{
                let arrayAux  = (await this.clases.toPromise()).map((v)=> v.duracionMins);
                
                return this.calcStatsTipico(arrayAux);
            }
        },
        {
            nombre: "Precio (€/minutos) (Min/Media/Max/Sum)",
            view : "",
            descMetodo: "Cálculo del valor mínimo, medio, máximo y sumatorio del precio/minuto sobre la lista filtrada",
            metodo : async ()=>{
                let arrayAux  = (await this.clases.toPromise()).map((v)=> v.precioTime);
                
                return this.calcStatsTipico(arrayAux);
            }
        },
        {
            nombre: "Precio total (Min/Media/Max/Sum)",
            view : "",
            descMetodo: "Cálculo del valor mínimo, medio, máximo y sumatorio del precio total sobre la lista filtrada",
            metodo : async ()=>{
                let arrayAux  = (await this.clases.toPromise()).map((v)=> v.precioTotal);
                return this.calcStatsTipico(arrayAux);
            }
        },
        {
            nombre: "Elo (Min/Media/Max/Sum)",
            view : "",
            descMetodo: "Cálculo del valor mínimo, medio, máximo y sumatorio del elo sobre la lista filtrada",
            metodo : async ()=>{
                let arrayAux  = (await this.clases.toPromise()).map((v)=> v.prfElo);
                return this.calcStatsTipico(arrayAux);
            }
        },
        {
            nombre: "Puntuación (Min/Media/Max/Sum)",
            view : "",
            descMetodo: "Cálculo del valor mínimo, medio, máximo y sumatorio de la puntuación sobre la lista filtrada",
            metodo : async ()=>{
                let arrayAux  = (await this.clases.toPromise()).map((v)=> v.puntuacion);
                return this.calcStatsTipico(arrayAux);
            }
        }
      ]
        }
      this.acordeon=
      {
          usuarios :false,
          clases : false
      }

      /*
        email ?: string,
    emailVerificado ? :boolean,
    nombre ?: string,
     rol?: number,
     desRol ?: string,

    modulo ?: number,
    desModulo ?: string,
    fechCreate ?: string,
    lastUpdate?: string,
    ip ?: string,
    conectado?: boolean,
    claseId  ?: string
    disponible ?: Boolean


      */
    this.campos = {
            string : ["id", "fechIni", "fechFin", "prfName", "aluName", "duracion", "email", "nombre", "fechCreate", "lastUpdate", "ip", "claseId"],
                boolean : ["emailVerificado", "conectado", "disponible"],
                combo : ["rol", "modulo"],
                numberCondicional : ["prfElo", "precioTime", "precioTotal", "puntuacion"]
            };
    this.filtroBuscadorClase = {
        condprfElo : CondicionalEnum.IGUAL,
                        condprecioTime: CondicionalEnum.IGUAL,
                        condprecioTotal : CondicionalEnum.IGUAL,
                        condpuntuacion: CondicionalEnum.IGUAL,
    };
    this.filtroBuscadorUsuario = {
        
    };


      rol.setModulo(ModulesEnum.REPORTING_ADMIN);
    }
    private calcStatsTipico(arrayAux: number[]) {
        let sum = arrayAux.reduce((p, c) => p + c, 0);
        return `${Math.min(...arrayAux).toFixed(2)}/${Math.max(...arrayAux).toFixed(2)}/${(sum / arrayAux.length).toFixed(2)}/${sum.toFixed(2)}`;
    }

    ngOnInit() {
     
    this.defineCombos();
      this.roomSuscript =  MeteorObservable.subscribe('allRooms').subscribe(() => {
        Tracker.autorun(()=>{
      
          this.recargarClases();
    
        });
       
         // this.getRoomReport();
  
      //getRoomReport
      });


    this.usersSuscript =  MeteorObservable.subscribe('allUsers').subscribe(() => {
                    
         Tracker.autorun(()=>{
           this.recargarUsuarios();
            });
            // this.getRoomReport();
    
        //getRoomReport
        });

      
    }

    filtrar(filtro : BuscadorGenericInterface, elemento : BuscadorGenericInterface) :boolean
    {
        let vm=this;

        let flag = true;
        

        Object.keys(filtro).forEach((e : string)=>{


            if(isDefined(filtro[e]))
            {
                if(this.campos.string.indexOf(e)!==-1)
                {
    
                        flag = flag && elemento[e].indexOf(filtro[e])!==-1;
    
                }
                else if (this.campos.boolean.indexOf(e)!==-1 || this.campos.combo.indexOf(e)!==-1)
                {
                        flag = flag &&  elemento[e] === filtro[e];
                }
                else if(this.campos.numberCondicional.indexOf(e)!==-1)
                {
    
                    switch(filtro[`cond${e}`])
                    {
                        case CondicionalEnum.MENOR:
                                flag = flag &&  elemento[e] < filtro[e];
                            break;
                        case CondicionalEnum.MENOR_IGUAL:
                            flag = flag &&  elemento[e] <= filtro[e];
                            break;
                        case CondicionalEnum.IGUAL:
                            flag = flag &&  elemento[e] === filtro[e];
                            break;
                        case CondicionalEnum.MAYOR_IGUAL:
                            flag = flag &&  elemento[e] >= filtro[e];
                            break;
                        case CondicionalEnum.MAYOR:
                            flag = flag &&  elemento[e] > filtro[e];
                            break;
                    }
                }

            }
        })


        return flag;
    }


    filtrarArrayUsuarios()
    {
        let vm=this;
        this.usuarios  = of(this.usuariosOri.filter((e)=>{

            return this.filtrar(this.filtroBuscadorUsuario, e);

        }))

        //this.cd.reattach();

        vm.calcularEstadisticaUsuarios()
    }

    filtrarArrayClases()
    {
        let vm=this;
        this.clases  = of(this.clasesOri.filter((e)=>{

            return this.filtrar(this.filtroBuscadorClase, e);

        }))
        vm.calcularEstadisticaClases();
        //this.cd.reattach();
    }

    private recargarUsuarios() {
        this.usuariosOri = Users.find().cursor.map((u: User) => {
            let p: Perfil = u.profile;
            let diffFechas = u && u.lastUpdate ? (new Date()).getTime() - u.lastUpdate.getTime() : (this.tiempoMaximoSinPing + 1);
            let bU: BuscadorUsersInterface = {
                claseId: p.claseId,
                conectado: diffFechas <= this.tiempoMaximoSinPing,
                desModulo: isDefined(u.lastModulo) ? this.combos.modulos.filter(v => v.codigo === u.lastModulo)[0].valor : "",
                desRol: isDefined( p.rol) ? this.combos.roles.filter(v => v.codigo === p.rol)[0].valor : "",
                email: u.emails ? u.emails[0].address : "",
                emailVerificado: u.emails[0].verified,
                fechCreate: this.formatDate(new Date(u.createdAt)),
                ip: u.lastIp,
                lastUpdate: this.formatDate(u.lastUpdate),
                modulo: u.lastModulo,
                nombre: `${p.nombre} ${p.apellidos}`,
                disponible: p.disponible,
                rol: p.rol
            };
            return bU;
        })

        this.filtrarArrayUsuarios()
    }

    private recargarClases() {
        this.clasesOri = Rooms.find().cursor.map((c: Room) => {
            let bU: BuscadorClaseInterface = {
                aluName: c.nomAlumn,
                condprfElo: undefined,
                condprecioTime: undefined,
                condprecioTotal: undefined,
                condpuntuacion: undefined,
                duracion: super.calcTiempo(c),
                duracionMins : super.calcMinutos(c),
                fechFin: this.formatDate(c.fechaFin),
                fechIni: this.formatDate(c.fechaIni),
                id: c._id,
                precioTime: c.precio,
                precioTotal: this.calcPrecioTotal(c),
                prfElo: c.elo,
                prfName: c.nomProfe,
                puntuacion: this.calcularPuntuacion(c)
            };
            return bU;
        });
        this.filtrarArrayClases()
    }

   /* getRoomReport()
    {
      let input = {};

      if(this.tBusqueda === TipoBusqueda.PROFES)
      {
          input ={ profId : Meteor.userId()};
      }
      else if(this.tBusqueda === TipoBusqueda.ALUMNO)
      {
        input = { alumnoId : Meteor.userId()};
      }
      this.clases= Rooms.find(input);


     
    }*/
    
    calcularEstadisticaUsuarios()
    {
        let vm=this;
        vm.estadisticas.usuarios.forEach(async (v)=>{
            let valor = await v.metodo();

            v.view = valor;

        });
    }

     calcularEstadisticaClases()
    {
        let vm =this;
        vm.estadisticas.clases.forEach(async (v)=>{
            let valor = await v.metodo();

            v.view = valor;

        });
    }
    ngOnDestroy(){
        if(this.roomSuscript)
        {
          this.roomSuscript.unsubscribe()
        }
        if(this.usersSuscript)
            {
            this.usersSuscript.unsubscribe()
            }
        
    }

    
  }