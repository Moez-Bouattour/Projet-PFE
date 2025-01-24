import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { UserService } from '../demo/service/user.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-menu-chef',
    templateUrl: './app.menuChef.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];
    loggedIn: boolean = false;

    constructor(public layoutService: LayoutService, private userService:UserService,private router:Router) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Accueil',
                items: [
                    { label: 'Accueil', icon: 'pi pi-fw pi-home', routerLink: ['/Chef'] }
                ]
            },
            {
                label: 'composants UI',
                items: [
                    { label: 'Congé', icon: 'pi pi-fw pi-id-card', routerLink: ['/Chef/conge'] },
                    { label: 'Autorisation', icon: 'pi pi-clock ', routerLink: ['/Chef/autorisation'] },
                    { label: 'Ordre de mission', icon: 'pi pi-truck', routerLink: ['/Chef/Ordre_de_mission'] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    { label: '', icon: '', routerLink: [''] },
                    {label: 'Logout', icon: 'pi pi-sign-out', routerLink: ['/login'],  command: this.logout.bind(this)}

                ]

            },
          ];
    }
    logout() {
      this.loggedIn = false;
      this.userService.changeAuthStatus(false);
      this.router.navigateByUrl('/login');
    }

}
