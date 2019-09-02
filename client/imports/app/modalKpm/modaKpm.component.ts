import {Component, OnInit, OnDestroy} from '@angular/core';
import { Kpm, tipoAnsw} from '../../../../imports/models/kpm'
import {NgbModal, ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Kpms } from '../../../../imports/collections/kpm';
import { from } from 'rxjs';
@Component({
  //selector: 'modal-kpm',
  templateUrl: './modalKpm.html',
  styleUrls: ['modalKpm.scss']
})
export class ModalKpm implements OnInit, OnDestroy {


  kpmSubscription : Subscription;
  comentario : string;
  kmps : Observable<Kpm[]>; /*= [
    {
      type : tipoAnsw.clase,
      question : "Puntuación clase",
      answer : 0,
      activo: true
    },
    {
      type : tipoAnsw.servicio,
      question : "Servicio",
      answer : 0,
      activo: true
    }

   
  ];*/

  updated : boolean= false;
  scores : number[]  =[ 1,2 ,3,4,5]
  closeResult: string;

  constructor(  public activeModal: NgbActiveModal) {

      

  }

  close()
  {
    let vm =this;
    this.kmps
    .subscribe(kpms => {

      vm.activeModal.close({
        kpms : kpms  as Kpm[],
        comentario : vm.comentario,
        updated : vm.updated
      })
        
    })
      
  }
  ngOnInit()
  {

     

      let vm =this;
      
      
 
      
      this.kpmSubscription =  MeteorObservable.subscribe('getKpms').subscribe(() => {
          
            vm.kmps =  Kpms.find({activo : true});


          
         // this.rol.setRoles(Roles.findOne().rol);
        
        });
  }
  ngOnDestroy()
    {
        if (this.kpmSubscription) {
            this.kpmSubscription.unsubscribe();
          }

        
    }

  
  isChecked(kpm :Kpm, score: number): boolean
  {
 
    return kpm.answer >= score
  }
  setScore(kpm : Kpm, score:number)
  {
      kpm.answer = score;
      
      this.updated = true
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
}
