import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Approbateur } from '../../../api/approbateur';
import { ApprobateurService } from '../../../service/approbateur.service';
import { UserService } from 'src/app/demo/service/user.service';
import { User } from 'src/app/demo/api/user';
import { Niveau } from 'src/app/demo/api/niveau';


@Component({
  selector: 'app-approbateur',
  templateUrl: './approbateur.component.html',
  styleUrls: ['./approbateur.component.scss']
})
export class ApprobateurComponent implements OnInit, OnChanges {
  @Input() niveauApprobateurSelected?: Niveau;
  @Input() approbateurDialog?: boolean;
  @Output() closeDialog = new EventEmitter<void>();

  approbateurDialogue: boolean = false;
  deleteApprobateurDialog: boolean = false;
  approbateurDialogEdit: boolean = false;
  approbateur: Approbateur = {};
  submitted: boolean = false;
  users: User[] = [];
  id_niveau: number = 0;
  approbateurs: Approbateur[] = [];
  selectedMulti: User[] = [];

  rowsPerPageOptions = [5, 10, 15];

  constructor(private approbateurService: ApprobateurService, private messageService: MessageService, private userService: UserService) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['niveauApprobateurSelected'] && changes['niveauApprobateurSelected'].currentValue) {
      this.id_niveau = changes['niveauApprobateurSelected'].currentValue.id;
      this.approbateurService.getApprobateursByNiveau(this.id_niveau).subscribe((response: any) => {
        if (response.status === 'success') {
          this.approbateurs = response.data;
          console.log(this.approbateurs);
          this.userService.getUsers().subscribe((response: any) => {
            if (Array.isArray(response.users)) {
                this.users = response.users;
                console.log(this.users);
                if (this.approbateurs && this.approbateurs.length > 0) {
                    this.selectedMulti = this.approbateurs.reduce((accumulator: User[], currentApprobateur: Approbateur) => {
                        const user = this.users.find(user => user.id === currentApprobateur.id_utilisateur);
                        if (user) {
                            accumulator.push(user);
                        }
                        return accumulator;
                    }, []);
                }
            } else {
                console.error('Unexpected response from userService.getUsers():', response);
            }
        });

        } else {
          console.log('Erreur lors de la récupération des approbateurs:', response.message);
        }
      });
    }
  }

  hideDialog() {
    this.closeDialog.emit();
    this.selectedMulti = [];
  }

  ModificationApprobateur() {
    if (this.selectedMulti.length > 0) {
      const newApprobateurs = this.selectedMulti.filter(user => !this.approbateurs.some(app => app.id_utilisateur === user.id));
      newApprobateurs.forEach(selectedUser => {
        const newApprobateur: Approbateur = {
          id_utilisateur: selectedUser.id,
          id_niveau: this.id_niveau
        };
        this.approbateurService.addApprobateur(newApprobateur).subscribe((data: any) => {
          console.log(data);
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Approbateur ajouté avec succès.' });
          this.refreshApprobateurs();
        }, error => {
          console.error('Erreur lors de l\'ajout de l\'approbateur:', error);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de l\'ajout de l\'approbateur.' });
        });
      });
      const removedApprobateurs = this.approbateurs.filter(app => !this.selectedMulti.some(user => user.id === app.id_utilisateur));
      removedApprobateurs.forEach(removedApp => {
        this.approbateurService.deleteApprobateur(removedApp.id).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Approbateur supprimé avec succès.' });
          this.refreshApprobateurs();
        }, error => {
          console.error('Erreur lors de la suppression de l\'approbateur:', error);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression de l\'approbateur.' });
        });
      });
    }
    else{
      const removedApprobateurs = this.approbateurs.filter(app => !this.selectedMulti.some(user => user.id === app.id_utilisateur));
      removedApprobateurs.forEach(removedApp => {
        this.approbateurService.deleteApprobateur(removedApp.id).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Approbateur supprimé avec succès.' });
          this.refreshApprobateurs();
        }, error => {
          console.error('Erreur lors de la suppression de l\'approbateur:', error);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression de l\'approbateur.' });
        });
      });
    }
    this.closeDialog.emit();
  }

  refreshApprobateurs() {
    this.approbateurService.getApprobateursByNiveau(this.id_niveau).subscribe((response: any) => {
      if (response.status === 'success') {
        this.approbateurs = response.data;
      } else {
        console.log('Erreur lors de la récupération des approbateurs:', response.message);
      }
    });
  }
}
