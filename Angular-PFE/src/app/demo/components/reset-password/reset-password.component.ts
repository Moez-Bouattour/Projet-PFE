import { Component, NgZone } from '@angular/core';
import { UserService } from '../../service/user.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  public form = {
    email: null
  };

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private ngzone: NgZone,
    private router: Router
  ) { }

  onSubmit() {
    this.userService.sendPasswordResetLink(this.form).subscribe(
      (data) => {
        this.handleResponse(data);
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.error, life: 3000 });
        console.log(error);
      }
    );
  }

  handleResponse(res: any) {
    const successMessage = res.data;
    this.messageService.add({ severity: 'success', summary: 'Réussi', detail: successMessage, life: 3000 });
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 4000);
  }


}
