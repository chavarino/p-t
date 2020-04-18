import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import {NgbModal, ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { RtcService, DevicesMapInterface, DeviceInterface } from '../services/rtc.service';
@Component({
  //selector: 'deviceSelection',
  templateUrl: 'deviceSelection.html',
  styleUrls: ['deviceSelection.scss']
  
})
export class DeviceSelectionComponent  implements OnInit {
  devicesList: DevicesMapInterface = {
    audioInputs : [],
    audioOutputs : [],
    videoInputs : []
  };

  devicesSelected : {
    audioInput: DeviceInterface, audioOutput: DeviceInterface, videoInput : DeviceInterface
  }
  constructor(private activeModal: NgbActiveModal)
  {
    
    
  }
  ngOnInit(): void {
    
    RtcService.getDevices()
    .then((res:DevicesMapInterface) => this.devicesList = res)
    .catch((err) => {
      console.log(JSON.stringify(err))
      alert()
    });

  }
  
  aceptar()
  {
    
  }
}
