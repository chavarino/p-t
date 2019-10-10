import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Generic } from 'imports/clases/generic.class';


@Component({
    selector: 'perfilEmpresa',
    templateUrl: 'perfilEmpresa.html',
    styleUrls: ['perfilEmpresa.scss']
  })
  export class PerfilEmpresaComponent extends Generic implements OnInit, OnDestroy{

    perfil : Perfil


    
  }