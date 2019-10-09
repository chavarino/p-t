
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';


import  {RolesService} from "../services/roles.service";
import  {BanderasService} from "../services/flags.service";
import { Meteor } from 'meteor/meteor';

import "material-design-icons";
import { MethodsClass } from 'imports/functions/methodsClass';
import { RtcService } from '../services/rtc.service';
import { Permisos } from 'imports/models/rol';

import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'padre',
  templateUrl: 'padre.html',
  styleUrls: ['padre.scss']
})
export class PadreComponent implements OnInit, OnDestroy {
  rol:RolesService
  
  flags  : BanderasService;
  navigationSubscription;
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



  
    
    ngOnInit() {
      
     /* */


     this.navigationSubscription = this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      
        console.log(e)
      
      /*if (e instanceof NavigationEnd) {
        this.initialiseInvites();
      }*/
    });

      //this.setRoles(this.route.snapshot.data.perm);
      MethodsClass.call("getServers", (res) =>{

        RtcService.pushServers(res.data.v.iceServers) ;
       // console.log(JSON.stringify(res))
      });

  
      
      
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
    
    if (this.navigationSubscription) {  
        this.navigationSubscription.unsubscribe();
    }
    
  }
  
}
