import { Component } from '@angular/core'
import { Generic } from 'imports/clases/generic.class'
import { RolesService } from '../services/roles.service';
import { FormBuilder } from '@angular/forms';

@Component({
    selector: 'initSection2',
    templateUrl: 'initSection2.html',
    styleUrls: ['initSection2.scss']
  })
  export class InitSection2Component extends Generic{

    constructor( rol : RolesService, private formBuilder: FormBuilder)
    {
        super(0, 1, "comun", rol);
    }
  }