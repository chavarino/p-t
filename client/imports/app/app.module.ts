import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';


import { LoginComponent } from './login/login.component';

import { TimeCounter } from './timeCounter/timeCounter.component';
import { InicioComponent } from './inicio/inicio.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AccountsModule } from 'angular2-meteor-accounts-ui';

import { RolesService } from './services/roles.service';
import { BanderasService } from './services/flags.service';
//import { MaterialModule } from './material.module';
//import { MatInputModule } from '@angular/material'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
//import { MdCheckboxModule } from '@angular2-material/checkbox';
import { ModalComponent } from './modal/modal.component';
import { BarraNavComponent } from './barraNav/barraNav.component';
import { PerfilComponent } from './perfil/perfil.component';
import { RoomAlumnoComponent } from './roomAlumno/roomAlumno.component';
import { RoomProfComponent } from './roomProf/roomProf.component';
import { AppComponent } from './app.component';
//import { MdButtonModule} from "@angular/material/button";

export const ROUTES_PROVIDERS = [{
  provide: 'canActivateForLoggedIn',
  useValue: () => !! Meteor.userId()
}];
@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    
    BrowserAnimationsModule,
    //MatButtonModule,
   // MatCheckboxModule,
    RouterModule.forRoot([
      {
        path: 'inicio',
        component: InicioComponent
      },
      {
          path: 'opciones/perfil',
           component: PerfilComponent, canActivate: ['canActivateForLoggedIn']
       },
       {
        path: 'room/alumno',
         component: RoomAlumnoComponent, canActivate: ['canActivateForLoggedIn']
        },
      {
        path: 'room/prof',
         component: RoomProfComponent, canActivate: ['canActivateForLoggedIn']
        },
      // Home Page
      {
        path: '',
        redirectTo: '/inicio',
        pathMatch: 'full'
      },
      // 404 Page
      {
        path: '**',
        component: PageNotFoundComponent
      }
    ]),
    AccountsModule,
   // MatButtonModule
  ],
  exports : [
    
  ],
  declarations: [
    AppComponent,
    InicioComponent,
    PageNotFoundComponent,
    LoginComponent,
    TimeCounter,
    BarraNavComponent,
    ModalComponent,
    PerfilComponent,
    RoomAlumnoComponent,
    RoomProfComponent
  ],
  bootstrap: [
    AppComponent
  ],
  providers: [
    RolesService,
    BanderasService,
    ROUTES_PROVIDERS
  ]
})
export class AppModule {

 }
