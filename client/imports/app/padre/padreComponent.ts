
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';


import  {RolesService} from "../services/roles.service";
import  {BanderasService} from "../services/flags.service";
import { Meteor } from 'meteor/meteor';

import "material-design-icons";
import { MethodsClass } from 'imports/functions/methodsClass';
import { RtcService } from '../services/rtc.service';
import { Permisos } from 'imports/models/rol';

import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'padre',
  templateUrl: 'padre.html',
  styleUrls: ['padre.scss']
})
export class PadreComponent implements OnInit, OnDestroy {
  rol:RolesService
  
  flags  : BanderasService;
  navigationSubscription;
  
  rolSubs : Subscription;
  interval: NodeJS.Timer;
  
  constructor(rol:RolesService, flags : BanderasService, private cd :ChangeDetectorRef, 
    private router: Router, private route: ActivatedRoute)
  {
    this.rol = rol;
    this.flags = flags;
    this.flags.setModalConfig({

        config : {
            title : "",
            msg : "",
            tipo : -1
        },
        fn : function()
        {
          console.log ("Main")
        }
    })
  }

  onRoles(e : Observable<Permisos>)
  {
    this.rolSubs =  e.subscribe((res) => {
      //this.setMessage();
  
        //this.onRoles.emit(res)
        this.setRoles(res)
        this.redirectUrl();
      
    });

    


  }
     setRoles(permisos :Permisos)
    { 
      let vm=this;
  
      if(!permisos)
      {
                this.rol.setIniRoles();
        }
        else{
          this.rol.setRoles(permisos);
          
        }
      }
  redirectUrl()
  { 
      // Get the redirect URL from our auth service
          // If no redirect has been set, use the default
          let redirect = this.rol.redirectUrl ?
           /*this.router.parseUrl(this.rol.redirectUrl)*/ this.rol.redirectUrl : '/inicio';
  
          // Set our navigation extras ñobject
          // that passes on our global query params and fragment
          let navigationExtras: NavigationExtras = {
            queryParamsHandling: 'preserve',
            preserveFragment: true
          };
  
         

          this.router.navigate([redirect], navigationExtras);
  }

  
  
    
    ngOnInit() {
      
     /* */
       this.interval = setInterval(()=>{
        this.cd.reattach()
      }, 200)

     this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      
        console.log(e)
      
      /*if (e instanceof NavigationEnd) {
        this.initialiseInvites();
      }*/
    });
//this.setRoles(this.route.snapshot.data.perm);
      MethodsClass.call("getServerCustom", (res) =>{

        console.log("SERVIDOR CUSTOM " + JSON.stringify(res))
        RtcService.pushServers([res]) ;
        //RtcService.pushServers(res.data.v.iceServers) ;
       // console.log(JSON.stringify(res))
      });
      //this.setRoles(this.route.snapshot.data.perm);
      /*MethodsClass.call("getServers", (res) =>{

        RtcService.pushServers(res.data.v.iceServers) ;
       // console.log(JSON.stringify(res))
      });*/

  
      
      
  }
  retornar ($event)
  {
     this.flags.getModalConfig().fn($event);
  }
  loggedIn() {
    return !!Meteor.user() ;
  }

logginIn()
{
    return Meteor.loggingIn();
}

  ngOnDestroy() {
    if (this.rolSubs) {
      this.rolSubs.unsubscribe();
    }

    if(this.interval)
    {
        clearInterval(this.interval);
    }
    if (this.navigationSubscription) {  
        this.navigationSubscription.unsubscribe();
    }
    
  }
  
}
