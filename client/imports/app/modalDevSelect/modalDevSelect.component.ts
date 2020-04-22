import { Component, OnInit } from '@angular/core';
import { NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { RtcService, DevicesMapInterface, DeviceInterface, DevicesSelected,  } from '../services/rtc.service';
@Component({
  //selector: 'deviceSelection',
  templateUrl: './modalDevSelect.html',
  styleUrls: ['modalDevSelect.scss']
  
})
export class ModalDevSelectComponent  implements OnInit {
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
