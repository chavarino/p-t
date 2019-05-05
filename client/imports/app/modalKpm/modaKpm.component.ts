import {Component, OnInit, OnDestroy} from '@angular/core';
import { Kpm, tipoAnsw} from '../../../../imports/models/kpm'
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Kpms } from '../../../../imports/collections/kpm';
@Component({
  selector: 'modal-kpm',
  templateUrl: './modalKpm.html',
  styleUrls: ['modalKpm.scss']
})
export class ModalKpm implements OnInit, OnDestroy {


  kpmSubscription : Subscription;
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
  scores : number[]  =[ 1,2 ,3,4,5]
  closeResult: string;

  constructor(private modalService: NgbModal) {

      

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

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      alert("¡¡Muchas gracias por colaborar a un servicio mejor!!")
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  isChecked(kpm :Kpm, score: number): boolean
  {
 
    return kpm.answer >= score
  }
  setScore(kpm : Kpm, score:number)
  {
      kpm.answer = score;
      
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
