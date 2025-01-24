import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Etat } from 'src/app/demo/api/etat';
import { Table } from 'primeng/table';
import { Niveau } from 'src/app/demo/api/niveau';
import { EtatService } from 'src/app/demo/service/etat.service';
@Component({
  selector: 'app-etat',
  templateUrl: './etat.component.html',
  styleUrls: ['./etat.component.scss']
})
export class EtatComponent implements OnChanges {
  @Input() niveauSelected?: Niveau

  deleteEtatDialog: boolean = false;

  etatDialogue: boolean = false;

  etatDialogEdit: boolean = false;

  checked: boolean = false;

  etat: Etat = {};

  rowsPerPageOptions = [5, 10, 15];

  lastId: number = 0;

  etats?: Etat[];

  id_niveau: number = 0;

  validation: boolean = false;

  constructor(private messageService: MessageService, private etatService: EtatService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['niveauSelected'] && changes['niveauSelected'].currentValue) {
      console.log(changes['niveauSelected']);

      this.id_niveau = changes['niveauSelected'].currentValue.id;

      this.etatService.getEtatsByNiveau(this.id_niveau).subscribe((response: any) => {
        if (response.status === 'success') {
          this.etats = response.data;
        } else {
          console.log('Erreur lors de la récupération des états:', response.message);
        }
      });
    }
  }
  openNew() {
    this.etat={};
    this.etatDialogue = true;
  }
  editEtat(etat: Etat) {
    this.etat = { ...etat };
    this.etatDialogEdit = true;
  }
  deleteEtat(etat: Etat) {
    this.deleteEtatDialog = true;
    this.etat = { ...etat };
  }

  confirmDelete() {
    this.deleteEtatDialog = false;
    if (this.etat && this.etat.id) {
      this.etatService.deleteEtat(this.etat.id).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'État supprimé', life: 3000 });
        this.etat = {};
        this.etatService.getEtatsByNiveau(this.id_niveau).subscribe((response: any) => {
          if (response.status === 'success') {
            this.etats = response.data;
          } else {
            console.log('Erreur lors de la récupération des etats:', response.message);
          }
        });
      }, error => {
        console.error('Error deleting etat:', error);
      });
    } else {
      console.error('Invalid etat ID:', this.etat);
    }
  }
  hideDialog() {
    this.etatDialogue = false;
  }
  hideDialogEdit() {
    this.etatDialogEdit = false;
  }

  updateValidation(newValue: boolean) {
    this.validation = newValue;
    console.log(this.validation);
  }
  addEtat() {
    this.etat.id_niveau = this.id_niveau;
    this.etat.validation=this.validation;
   console.log(this.etat.validation);
    this.etatService.addEtat(this.etat).subscribe((data: any) => {
      console.log(data);
      this.etatService.getEtatsByNiveau(this.id_niveau).subscribe((response: any) => {
        if (response.status === 'success') {
          this.etats = response.data;
        } else {
          console.log('Erreur lors de la récupération des etats:', response.message);
        }
      });
      this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'État créé', life: 3000 });
      this.etatDialogue = false;
      this.etat = {};
    }, error => {
      console.error('Error creating etat:', error);
    });
  }

  getEtat(id: any) {
    this.etatDialogEdit = true;
    this.etatService.getEtatById(id).subscribe(
      (data: any) => {
        console.log('etat récupéré:', data);
        this.etat = data.data;
        this.validation = this.etat.validation === 1 ? true : false;
      },
      (error: any) => {
        console.error('Erreur lors de la récupération du etat:', error);
      }
    );
  }


  updateEtat() {
    this.etatDialogEdit = true;
    this.etat.validation=this.validation;
    this.etatService.updateEtat(this.etat.id, this.etat).subscribe(() => {
      this.etatService.getEtatsByNiveau(this.id_niveau).subscribe((response: any) => {
        if (response.status === 'success') {
          this.etats = response.data;
        } else {
          console.log('Erreur lors de la récupération des etats:', response.message);
        }
      });
      this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'État actualisé', life: 3000 });
      this.etatDialogEdit = false;
      this.etat = {};
    }, error => {
      console.error('Error updating etat:', error);
    });

  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
