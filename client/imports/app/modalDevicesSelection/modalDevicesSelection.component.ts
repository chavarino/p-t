import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import {NgbModal, ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { RtcService, DevicesMapInterface, DeviceInterface, DevicesSelected,  } from '../services/rtc.service';
import { isDefined } from '@angular/compiler/src/util';
@Component({
  //selector: 'deviceSelection',
  templateUrl: './modalDevicesSelection.html',
  styleUrls: ['modalDevicesSelection.scss']
  
})
export class ModalDevicesSelectionComponent  implements OnInit {
  devicesList: DevicesMapInterface = {
    audioInputs : [],
    audioOutputs : [],
    videoInputs : []
  };

  devicesSelected : DevicesSelected = {
    audioInputId : undefined,
    audioOutputId : undefined,
    videoInputId : undefined
  };
  constructor(private activeModal: NgbActiveModal)
  {
    
    
  }
  ngOnInit(): void {
    
    RtcService.getDevices()
    .then((res:DevicesMapInterface) => {
      
      this.devicesList = res
      this.devicesSelected = RtcService.getSelectedDevices();

      

    })
    .catch((err) => {
      console.log(JSON.stringify(err))
      alert("No hay dispositivos")
    });

    

  }
  
  aceptar()
  {
    this.activeModal.close(this.devicesSelected);
  }
  cancelar ()
  {
    this.activeModal.close(false);
  }
}
