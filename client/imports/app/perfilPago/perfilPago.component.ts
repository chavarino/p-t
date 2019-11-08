import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Generic } from 'imports/clases/generic.class';
import { PerfilPagos, PublicPerfilPagos } from 'imports/models/perfilPagos.model';
import { RolesService } from '../services/roles.service';
import { MeteorObservable } from 'meteor-rxjs';
import { PerfilPagosColl } from 'imports/collections/perfilPagos.collection';
import { MethodsClass } from 'imports/functions/methodsClass';

//import {Stripe} from 'stripe';
declare var Stripe: any;
//const stripe = Stripe('sk_test_...');
let keyApi = Meteor.isProduction ? 'pk_test_wQBeplTTV1GWBaM10Kpk7QDm00np8ez6PE' : 'pk_test_wQBeplTTV1GWBaM10Kpk7QDm00np8ez6PE'; 
const stripe = Stripe(keyApi);
const elements = stripe.elements();
const cardElement = elements.create('card');


@Component({
  selector: 'perfilPago',
  templateUrl: 'perfilPago.html',
  styleUrls: ['perfilPago.scss']
})

export class PerfilPagoComponent extends Generic implements OnInit, OnDestroy{
    
    perfilPAgos : PerfilPagos
    perfilPagosSuscripcion :Subscription;
    pbPP : PublicPerfilPagos;
    cargando: boolean;
    

    constructor(rol : RolesService)
    {
        super(1, 1, "comun", rol);
        this.perfilPAgos = {

        } as PerfilPagos
        this.cargando =false;
        this.pbPP = {
            hasMthPago : false,
            
        }
    }
    ngOnInit(): void {
        this.perfilPagosSuscripcion =  MeteorObservable.subscribe('getPerfilPago').subscribe((valueSus) => {

            PerfilPagosColl.find().subscribe((data :PerfilPagos[])=>{

                this.getPMethodInfo();
               
                if(data[0])
                {
                        
                        this.perfilPAgos = data[0];

                    }
                    else{
                    //this.rol.setRoles(data[0].rol);
            
                    }
                })
            // this.rol.setRoles(Roles.findOne().rol);

            });
    }   
    
    
    ngOnDestroy(): void {
        if (this.perfilPagosSuscripcion) {
            this.perfilPagosSuscripcion.unsubscribe();
          }
    }

    createCardElement()
    {

        cardElement.mount('#card-element');
    }

    async saveCardMethod()
    {

        let vm=this;
        let  client_secret = "";

        let cardName = Meteor.userId()+"-"+ (new Date()).getTime();

      //  setupIntent
      try {
        this.setCargando()
          client_secret = await  new Promise((r, rej) =>{
              MethodsClass.call("setupPayMethod", (res: string) => {
                r(res)
            }, (error)=>{
                rej(error)
            });
    
          });
          let result = await stripe.handleCardSetup(
              client_secret, cardElement, {
              payment_method_data: {
                  billing_details: {name: cardName}
              }
              }
          )
    
          let { setupIntent, error} = result;
          if (error) {
              // Display error.message in your UI.
              alert("error " + JSON.stringify(error ))
              console.log("error "+ error);
          
          } else {
             // alert("Se ha insertado la tarjeta de forma correcta")
    
              let idPMethod = setupIntent.payment_method;
              
              // The setup has succeeded. Display a success message.

              // guardamos el metodo de pago y customer.

             let res = await  new Promise((r, rej) =>{
                MethodsClass.call("saveMetodoPago", idPMethod, (res: string) => {
                  r(res)
              }, (error)=>{
                  rej(error)
              });
      
            });
            alert("Tarjeta guardada con exito.")
            
            this.getPMethodInfo()
          }
      } catch (error) {
        alert("error " + JSON.stringify(error ))
        console.log("error "+ error);
      }
      finally{
        this.setCargando()
      }

    }

    setCargando()
    {
        this.cargando = !this.cargando;
    }
    borrarMtPago()
    {
        try {
            this.setCargando()
            MethodsClass.call("borrarMetodoPago", (res: string) => {
                this.setCargando()
                alert("Tarjeta borrada con exito.")
                this.getPMethodInfo()
            });

        } catch (error) {
             alert("error " + JSON.stringify(error ))
            console.log("error "+ error);
        }
        finally{
            this.setCargando()
        }
    }
    getPMethodInfo() {
        let vm=this;
        this.setCargando()
        MethodsClass.call("getPayMethodInfo", (res: PublicPerfilPagos) => {
            this.setCargando()
            if(res)
            {
                this.pbPP = res;
                if (!this.pbPP.hasMthPago) {
    
                    this.createCardElement();
                    /*Meteor.setTimeout(()=>{
    
                    }, 500);*/
                }

            }
        }, ()=> {
            vm.setCargando()
        });
    }


}