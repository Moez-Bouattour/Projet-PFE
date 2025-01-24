import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';
import { MessageService } from 'primeng/api';
import { LayoutService } from 'src/app/layout RH/service/app.layout.service';
import { jwtDecode } from 'jwt-decode';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent {

    valCheck: string[] = ['remember'];

    password!: string;
    submitted = false;
    data: any;
    token: any;
    poste: any;
    url: any;
    public form = {
        email: '',
        password: '',
    }
    loggedIn: boolean | undefined;
    public error = [];


    constructor(public layoutService: LayoutService,
        private router: Router,
        private userService: UserService,
        private messageService: MessageService) {
        console.log("==" + this.loggedIn);
    }
    Login() {
        return this.userService.login(this.form).subscribe(
            // data=>console.log(data),
            data => this.handleResponse(data),
            error => this.handleError(error)
        );
    }
    handleResponse(data: any) {
        this.userService.changeAuthStatus(true);
    }

    handleError(error: any) {
        this.error = error.error.error;
    }
    submit() {

        this.userService.login(this.form).subscribe((res: any) => {

            this.data = res;
            console.log(this.data);
            if (this.data.status == 'success') {
              this.token =this.userService.storeToken(this.data.data);
                /*this.token = this.data.token;
                localStorage.setItem('token', this.token);*/
                this.handleResponse(this.token);
                this.poste=jwtDecode(this.data.data);
                const p=this.poste.poste
                console.log(this.poste);

                if(p=='RH'){
                  this.router.navigate(['/RH']);
                }
                else if(p=='Chef de projet')
                {
                  this.router.navigate(['/Chef']);
                }
                else{
                  this.router.navigate(['/Employe']);
                }
            }},
            error=>
            {
                console.log(error.error.message);
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });

            }

    )}

}
