import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ParametrageComponent } from './demo/components/parametrage/parametrage.component';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { CongeComponent } from './demo/components/congé/conge.component';
import { AutorisationComponent } from './demo/components/autorisation/autorisation.component';
import { OrdreDeMissionComponent } from './demo/components/ordre-de-mission/ordre-de-mission.component';
import { LoginComponent } from './demo/components/login/login.component';
import { UserComponent } from './demo/components/user/user.component';
import { AppLayoutComponentChef } from './layout chef/app.layoutChef.component';
import { AppLayoutComponentEmploye } from './layout Employé/app.layoutEmploye.component';
import { AppLayoutComponent } from './layout RH/app.layoutRH.component';
import { InfoEmpComponent } from './demo/components/info-emp/info-emp.component';
import { InfoChefComponent } from './demo/components/info-chef/info-chef.component';
import { ParametrageSoldeComponent } from './demo/components/parametrage-solde/parametrage-solde.component';
import { JourFerieComponent } from './demo/components/jour-ferie/jour-ferie.component';
import { TypeCongeComponent } from './demo/components/type-conge/type-conge.component';
import { ParametragesoldeAutorisationComponent } from './demo/components/parametragesolde-autorisation/parametragesolde-autorisation.component';
import { DashboardComponent } from './demo/components/dashboard/dashboard.component';
import { VoitureComponent } from './demo/components/voiture/voiture.component';
import { ResetPasswordComponent } from './demo/components/reset-password/reset-password.component';
import { ChangePasswordComponent } from './demo/components/change-password/change-password.component';
import { VilleComponent } from './demo/components/ville/ville.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'RH', component: AppLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'documents', component: ParametrageComponent },
      { path: 'conge', component: CongeComponent },
      { path: 'autorisation', component: AutorisationComponent },
      { path: 'Ordre_de_mission', component: OrdreDeMissionComponent },
      { path: 'user', component: UserComponent },
      {path:'parametrageSolde', component: ParametrageSoldeComponent},
      {path:'parametrageSoldeAutorisation', component: ParametragesoldeAutorisationComponent},
      {path:'jour_férié', component: JourFerieComponent},
      {path:'type_conge', component: TypeCongeComponent},
      {path:'voiture', component:VoitureComponent},
      {path:'ville', component:VilleComponent}
    ]
  },
  {
    path: 'Chef', component: AppLayoutComponentChef,
    children: [
      { path: '', component: InfoChefComponent },
      { path: 'conge', component: CongeComponent },
      { path: 'autorisation', component: AutorisationComponent },
      { path: 'Ordre_de_mission', component: OrdreDeMissionComponent },
    ]
  },
  {
    path: 'Employe', component: AppLayoutComponentEmploye,
    children: [
      { path: '', component: InfoEmpComponent },
      { path: 'conge', component: CongeComponent },
      { path: 'autorisation', component: AutorisationComponent },
      { path: 'Ordre_de_mission', component: OrdreDeMissionComponent },
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'resetPassword', component: ResetPasswordComponent },
  { path: 'changePassword', component: ChangePasswordComponent },
  { path: '**', component: NotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
