import { NgModule, LOCALE_ID } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RouterModule, ActivatedRouteSnapshot, RouterStateSnapshot, RoutesRecognized, Routes } from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';


import { LoginComponent } from './login/login.component';
import { Categorias } from './categorias/categorias.component';

import { InicioComponent } from './inicio/inicio.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AccountsModule, LoginButtons } from 'angular2-meteor-accounts-ui';

import { RolesService } from './services/roles.service';
import { canActivateNone, canActivateLogin,
   canActivateAlumno, canActivateProf, canActivateAdmin, canActivateSAdmin, HnResolver  } 
   from './services/canActivate/canActivatePages';
import { BanderasService } from './services/flags.service';
//import { MaterialModule } from './material.module';
//import { MatInputModule } from '@angular/material'
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
//import { MdCheckboxModule } from '@angular2-material/checkbox';
import { ModalComponent } from './modal/modal.component';
import { BarraNavComponent } from './barraNav/barraNav.component';
import { PerfilComponent } from './perfil/perfil.component';
import { PerfilPagoComponent } from './perfilPago/perfilPago.component'
import { RoomAlumnoComponent } from './roomAlumno/roomAlumno.component';
import { RoomProfComponent } from './roomProf/roomProf.component';
import { VideoCall } from './videoCall/videoCall';
import { AppComponent } from './app.component';
//import { MdButtonModule} from "@angular/material/button";
import { TagInputModule } from 'ngx-chips';
import { PadreComponent} from './padre/padreComponent';
import { ModalKpm} from './modalKpm/modaKpm.component';


import { FileInput } from './file.component/file.component';
import { TimeCounter } from './timeCounter/timeCounter.component';
import { KeyDectect } from './directivas/keyDetect.directive';
import { LoadRoles} from './loadRolesComponent/loadRoles.component'
import { ReportsComponent } from './reports/reports.component';

import { StarView } from '../app/starView/starView.component';
import { FragmentPolyfillModule } from "./FragmentPolyfillModule/fragment-polyfill.module";

import { CookiesConsentComponent } from './cookiesConsent/cookiesConsent.component';
import {PoliticaCookiesComponent} from './politicaCookies/politicaCookies.component'
import { ModalDevSelectComponent } from './modalDevSelect/modalDevSelect.component';
import { ReportsAdminComponent } from './reportAdmin/reportsAdmin.component';
import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

    registerLocaleData(es);

export const ROUTES_PROVIDERS = [];
const routes: Routes = [
    {
      path: '',
      component: PadreComponent,

      children: [
        {
          path: '',
          redirectTo: 'inicio',
          pathMatch : "full"
        },  
        {
          path: 'inicio',
          component: InicioComponent
        },
        {
            path: 'opciones/perfil',
            component: PerfilComponent, canActivate: [canActivateLogin]
        },
        {
          path: 'room/alumno',
          component: RoomAlumnoComponent, canActivate: [canActivateNone]
        },
        {
          path: 'room/alumno/:categorias',
            component: RoomAlumnoComponent, canActivate: [canActivateNone]
        },
        {
                  path: 'politica-de-cookies',
                    component: PoliticaCookiesComponent, canActivate: [canActivateNone]
                },
        
        {
          path: 'room/prof',
          component: RoomProfComponent, canActivate: [canActivateProf]
        },
        {
          path: 'room/report',
          component: ReportsComponent, canActivate: [canActivateLogin]
        },
        {
          path: 'admin/report',
          component: ReportsAdminComponent, canActivate: [canActivateAdmin]
        }
        
      ]
    },
    {
      path: '**',
      redirectTo: 'app',
    }
]

@NgModule({
  imports: [
    BrowserModule,
    TagInputModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    FragmentPolyfillModule.forRoot({
      smooth:true
    }),
    //MatButtonModule,
   // MatCheckboxModule,
    RouterModule.forRoot(routes,{
     // useHash:true,
      enableTracing: true,
      onSameUrlNavigation:"reload",
      //scrollPositionRestoration: "enabled",
      //anchorScrolling:'enabled',
    }),
    AccountsModule,
    NgbModule
  ],
  exports : [
    
  ],
  declarations: [
    AppComponent,
    PadreComponent,
    InicioComponent,
    PageNotFoundComponent,
    LoginComponent,
    TimeCounter,
    Categorias,
    VideoCall,
    BarraNavComponent,
    ModalComponent,
    PerfilComponent,
    PerfilPagoComponent,
    RoomAlumnoComponent,
    RoomProfComponent,
    ModalKpm,
    FileInput,
    KeyDectect,
    ReportsComponent,
    LoadRoles,
    StarView,
    CookiesConsentComponent,
    PoliticaCookiesComponent,
    ModalDevSelectComponent,
    ReportsAdminComponent
  ],
  bootstrap: [
    AppComponent
  ],
  providers: [
    RolesService,
    canActivateNone, canActivateLogin,
   canActivateAlumno, canActivateProf, 
   canActivateAdmin, canActivateSAdmin,
   HnResolver,
    BanderasService,
    { provide: LOCALE_ID, useValue: 'es-*' }
  ],
  entryComponents: [ModalDevSelectComponent, ModalKpm] //modales y componentes que no se les de declara de forma explicita con etiquetas
})
export class AppModule {

 }
