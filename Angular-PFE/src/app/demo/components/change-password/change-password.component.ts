import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../service/user.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  public errorMessages: { [key: string]: string } = {};
  public form = {
    email: null,
    password: null,
    password_confirmation: null,
    resetToken: null
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService
  ) {
    this.route.queryParams.subscribe(params => {
      this.form.resetToken = params['token'];
    });
  }

  onSubmit() {
    this.userService.changePassword(this.form).subscribe(
      data => this.handleResponse(data),
      (error:any) =>{
        this.handleError(error);
        console.log(error);
       

      }
    );
  }

  handleResponse(data: any) {
    this.messageService.add({
      severity: 'success',
      summary: 'Réussi',
      detail: data.data,
      life: 3000
    });
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 4000);
  }

  handleError(error: any) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: error.error.message,
      life: 3000
    })
    if (error && error.error && error.error.errors) {
      const validationErrors = error.error.errors;
      for (const key in validationErrors) {
        if (validationErrors.hasOwnProperty(key)) {
          this.errorMessages[key] = validationErrors[key][0];
        }
      }
    }
  }
}
