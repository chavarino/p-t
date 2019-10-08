
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';


import  {RolesService} from "../services/roles.service";
import  {BanderasService} from "../services/flags.service";
import { Meteor } from 'meteor/meteor';

import "material-design-icons";
import { MethodsClass } from 'imports/functions/methodsClass';
import { RtcService } from '../services/rtc.service';
import { Permisos } from 'imports/models/rol';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'padre',
  templateUrl: 'padre.html',
  styleUrls: ['padre.scss']
})
export class PadreComponent implements OnInit, OnDestroy {
  rol:RolesService
  
  flags  : BanderasService;
  
  constructor(rol:RolesService, flags : BanderasService, private cd :ChangeDetectorRef, private route: ActivatedRoute)
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
    
    ngOnInit() {
      
     /* */
      this.setRoles(this.route.snapshot.data.perm);
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
    

    
  }
  
}
