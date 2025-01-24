import { Component, NgZone, OnInit } from '@angular/core';
import { User } from '../../api/user';
import { UserService } from '../../service/user.service';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  user: User = {};

  users?: User[];

  userForm: FormGroup;

  userFormEdit: FormGroup;

  submitted = false;

  posteOptions: any[]=[];

  userDialogAdd: boolean = false;

  userDialogEdit: boolean = false;

  deleteUserDialog: boolean = false;

  id: any;

  rowsPerPageOptions = [5, 10, 15];


  constructor(private messageService: MessageService, private router: Router, private formBuilder: FormBuilder,
    private userService:UserService, private ngZone: NgZone) {
      this.userForm = this.formBuilder.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
        ville: ['', Validators.required],
        cin: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
        poste: ['', Validators.required],
        departement: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        situation: ['', Validators.required],
        sexe: ['', Validators.required],

        date_embauche: ['', Validators.required]
      });

    this.userFormEdit = this.formBuilder.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['',Validators.required],
      ville: ['',Validators.required],
      cin: ['',Validators.required],
      poste: ['',Validators.required],
      departement: ['',Validators.required],
      situation: ['', Validators.required],
      sexe: ['', Validators.required],
      date_embauche: ['', Validators.required]
    });
  }
  ngOnInit() {
    this.posteOptions = [
      { label: 'RH', value: 'RH' },
      { label: 'Chef de projet', value: 'Chef de projet' },
      { label: 'Employé', value: 'Employé' }
    ];
    this.userService.getUsers().subscribe((data: any) => {
      this.users = data.users;
      console.log(this.users);
    });
  }
  openNew() {
    this.user = {};
    this.userDialogAdd = true;
    this.userForm.reset();
    this.submitted = false;
    this.userForm.patchValue({ id_user: this.id });
  }

  hideDialog() {
    this.userDialogAdd = false;
    this.userDialogEdit = false;
  }

addUser() {
  this.submitted = true;
  if (this.userForm.valid) {
    const userFormValue = this.userForm.value;
    const userData = { ...userFormValue, password: userFormValue.password };
    this.userService.addUser(userData).subscribe(() => {
      this.loadUsers();
      this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Utilisateur créé', life: 3000 });
      this.hideDialog();
    }, error => {
      console.error('Error creating user:', error);
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
    });
  } else {
    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez remplir les champs obligatoires', life: 3000 });
  }
}

  editUser(user:User) {
    this.user = { ...user };
    this.userDialogEdit = true;
  }
  updateUser() {
    this.submitted = true;
    const userData = this.userFormEdit.value;
    const userId = userData.id;
    userData.date_embauche = new Date(new Date(userData.date_embauche).getTime() + 86400000).toISOString().split('T')[0]
    console.log(userId);
    if (!userId) {
        console.error('Identifiant de l\'utilisateur non défini.');
        return;
    }

    if (this.userFormEdit.invalid) {
        console.log('Le formulaire est invalide.');
        return;
    }

    this.userService.updateUser(userId, userData).subscribe(
        () => {
            console.log('Mise à jour de l\'utilisateur réussie.');
            this.loadUsers();
            this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Utilisateur actualisé', life: 3000 });
            this.hideDialog();
        },
        error => {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
        }
    );
}

  deleteUser(user:User) {
    this.deleteUserDialog = true;
    this.user = { ...user };
  }

  confirmDelete() {
    this.deleteUserDialog = false;
    if (this.user && this.user.id) {
      this.userService.deleteUser(this.user.id).subscribe(() => {
        this.loadUsers();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'user supprimé', life: 3000 });
      });
    } else {
      console.error('Invalid user ID:', this.user);
    }
  }
  resetForm(): void {
    this.userForm.reset();
    this.submitted = false;
  }
  getUser(id: number) {
    this.userDialogEdit = true;
    this.userService.getUserById(id).subscribe(
      (response: any) => {
        console.log('Réponse de l\'API:', response);
        if (response.status === 'success') {
          const userData = response.data;
          console.log('Données utilisateur récupérées:', userData);
          const dateEmabaucheFormatted = formatDate(response.data.date_embauche, 'MM/dd/yyyy', 'en-US')
          this.userFormEdit.patchValue({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            cin: userData.cin,
            telephone: userData.telephone,
            ville: userData.ville,
            departement: userData.departement,
            poste: userData.poste,
            situation: userData.situation,
            sexe:userData.sexe,
            date_embauche:dateEmabaucheFormatted
          });
        } else {
          console.error('Erreur lors de la récupération de l\'utilisateur:', response.message);
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    );
}


  loadUsers(): void {
    this.userService.getUsers().subscribe((users:any) => {
      this.ngZone.run(() => {
        this.users = users.users;
      });
    }, error => {
      console.error('Failed to load users:', error);
    });
  }
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }


}
