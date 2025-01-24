import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { UserService } from '../demo/service/user.service';
import { Router } from '@angular/router';
import { TokenService } from '../demo/service/token.service';

@Component({
    selector: 'app-menu-rh',
    templateUrl: './app.menuRH.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];
    loggedIn: boolean = false;

    constructor(public layoutService: LayoutService, private userService:UserService,private router:Router, private tokenService:TokenService) { }

    ngOnInit() {
        this.model = [
              {
                label: 'Accueil',
                items: [
                    {  label: 'Tableau de bord', icon: 'pi pi-fw pi-home', routerLink: ['/RH'] },
                ]
            },
            {
                label: 'Paramétrage',
                items: [
                    { label: 'Paramétrage document', icon: 'pi pi-fw pi-file-edit', routerLink: ['/RH/documents'] },
                    { label: 'Liste des types congés', icon: 'pi pi-fw  pi-pencil', routerLink: ['/RH/type_conge'] },
                    { label: 'Liste des soldes de congés', icon: ' pi pi-fw pi-calculator', routerLink: ['/RH/parametrageSolde'] },
                    { label: 'Liste des soldes de sortie', icon: ' pi pi-fw pi-stopwatch', routerLink: ['/RH/parametrageSoldeAutorisation'] },
                    { label: 'Liste des jours fériés et week-end', icon: 'pi pi-fw pi-list', routerLink: ['/RH/jour_férié'] },
                    { label: 'Liste des voitures', icon: 'pi pi-fw pi-car', routerLink: ['/RH/voiture'] },
                    { label: 'Liste des villes', icon: 'pi pi-fw pi-building', routerLink: ['/RH/ville'] },
                    { label: 'Liste des employés', icon: 'pi pi-fw pi-users', routerLink: ['/RH/user'] },
                ]
            },
            {
                label: 'Les demandes',
                items: [
                    { label: 'Congé', icon: 'pi pi-fw pi-id-card', routerLink: ['/RH/conge'] },
                    { label: 'Autorisation', icon: 'pi pi-fw pi-clock ', routerLink: ['/RH/autorisation'] },
                    { label: 'Ordre de mission', icon: 'pi pi-fw pi-truck', routerLink: ['/RH/Ordre_de_mission'] },
                    {label: 'Logout', icon: 'pi pi-fw pi-sign-out', routerLink: ['/login'],  command: this.logout.bind(this)}
                ]

            },
          ];
    }
    logout() {

      this.tokenService.remove();
      this.router.navigateByUrl('/login');
    }

}
