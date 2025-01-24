import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TypeDocumentComponent } from './demo/components/parametrage/type-document/type-document.component';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ApprobateurComponent } from './demo/components/parametrage/approbateur/approbateur.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { NiveauComponent } from './demo/components/parametrage/niveau/niveau.component';
import { ParametrageComponent } from './demo/components/parametrage/parametrage.component';
import { ParametrageService } from './demo/service/parametrage.service';
import { EtatComponent } from './demo/components/parametrage/etat/etat.component';
import { MultiSelectModule } from "primeng/multiselect";
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { CongeComponent } from './demo/components/congé/conge.component';
import { CalendarModule } from "primeng/calendar";
import { AutorisationComponent } from './demo/components/autorisation/autorisation.component';
import { OrdreDeMissionComponent } from './demo/components/ordre-de-mission/ordre-de-mission.component';
import { LoginComponent } from './demo/components/login/login.component';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { ChipModule } from 'primeng/chip';
import { UserComponent } from './demo/components/user/user.component';
import { AppLayoutModuleChef} from './layout chef/app.layoutChef.module';
import { AppLayoutModule } from './layout RH/app.layoutRH.module';
import { InfoEmpComponent } from './demo/components/info-emp/info-emp.component';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AvatarModule } from 'primeng/avatar';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { InfoChefComponent } from './demo/components/info-chef/info-chef.component';
import { ImageModule } from 'primeng/image';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ParametrageSoldeComponent } from './demo/components/parametrage-solde/parametrage-solde.component';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { JourFerieComponent } from './demo/components/jour-ferie/jour-ferie.component';
import { RippleModule } from 'primeng/ripple';
import { TypeCongeComponent } from './demo/components/type-conge/type-conge.component';
import { SplitButtonModule } from 'primeng/splitbutton';
import { AppLayoutModuleEmploye } from './layout Employé/app.layoutEmploye.module';
import { ParametragesoldeAutorisationComponent } from './demo/components/parametragesolde-autorisation/parametragesolde-autorisation.component';
import { registerLocaleData } from '@angular/common';
import * as fr from '@angular/common/locales/fr';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ChartModule } from 'primeng/chart';
import { DashboardComponent } from './demo/components/dashboard/dashboard.component';
import { VoitureComponent } from './demo/components/voiture/voiture.component';
import { VilleComponent } from './demo/components/ville/ville.component';
import { ResetPasswordComponent } from './demo/components/reset-password/reset-password.component';
import { ChangePasswordComponent } from './demo/components/change-password/change-password.component';
import { DatePipe } from '@angular/common';
@NgModule({
  declarations: [
    AppComponent,
    TypeDocumentComponent,
    ApprobateurComponent,
    NiveauComponent,
    ParametrageComponent,
    EtatComponent,
    NotfoundComponent,
    CongeComponent,
    AutorisationComponent,
    OrdreDeMissionComponent,
    LoginComponent,
    UserComponent,
    InfoEmpComponent,
    InfoChefComponent,
    ParametrageSoldeComponent,
    JourFerieComponent,
    TypeCongeComponent,
    ParametragesoldeAutorisationComponent,
    DashboardComponent,
    VoitureComponent,
    VilleComponent,
    ResetPasswordComponent,
    ChangePasswordComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ToastModule,
    ToolbarModule,
    FileUploadModule,
    TableModule,
    BrowserAnimationsModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    AppLayoutModuleChef,
    AppLayoutModuleEmploye,
    ReactiveFormsModule,
    InputTextModule,
    AppLayoutModule,
    InputNumberModule,
    MultiSelectModule,
    CalendarModule,
    CheckboxModule,
    PasswordModule,
    ChipModule,
    ButtonModule,
    AvatarGroupModule,
    AvatarModule,
    ScrollTopModule,
    ScrollPanelModule,
    ImageModule,
    FullCalendarModule,
    ToggleButtonModule,
    RippleModule,
    SplitButtonModule,
    ColorPickerModule,
    ChartModule,
    DropdownModule,

  ],
  providers: [MessageService,ParametrageService,  { provide: LOCALE_ID, useValue: 'fr-FR'},DatePipe],

  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    registerLocaleData(fr.default);
  }
}

