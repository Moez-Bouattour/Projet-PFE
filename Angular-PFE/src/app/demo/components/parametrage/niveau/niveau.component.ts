import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { NiveauService } from '../../../service/niveau.service';
import { Niveau } from '../../../api/niveau';
import { Approbateur } from 'src/app/demo/api/approbateur';
import { Typedocument } from 'src/app/demo/api/typedocument';
import { User } from 'src/app/demo/api/user';

@Component({
  selector: 'app-niveau',
  templateUrl: './niveau.component.html',
  providers: [MessageService]
})
export class NiveauComponent implements OnInit, OnChanges {
  @Input() typeDocumentSelected?: Typedocument

  @Output() niveauApprobateurSelected = new EventEmitter<Niveau>();

  @Output() niveauSelected = new EventEmitter<Niveau>();

  @Output() closeDialogEtat = new EventEmitter<void>();

  approbateurs?: Approbateur;

  approbateurDialog: boolean = false;

  etatDialog: boolean = false;

  niveauDialogueAdd: boolean = false;

  niveauDialogEdit: boolean = false;

  deleteNiveauDialog: boolean = false;

  niveau: Niveau = {};

  lastId: number = 0;

  niveaux?: Niveau[];

  rowsPerPageOptions = [5, 10, 20];

  id_type_document?: number = 0;

  submitted: boolean = false;

  selectedMulti: User[] = [];

  selectedNiveau: Niveau| null = null;

  constructor(private niveauService: NiveauService, private messageService: MessageService) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Changes:', changes);

    if (changes['typeDocumentSelected'] && changes['typeDocumentSelected'].currentValue) {
      console.log('New value for typeDocumentSelected:', changes['typeDocumentSelected'].currentValue);

      this.id_type_document = changes['typeDocumentSelected'].currentValue.id;
      console.log('ID of selected type document:', this.id_type_document);

      this.niveauService.getNiveauxByTypeDocument(this.id_type_document).subscribe((response: any) => {
        if (response.status === 'success') {
          this.niveaux = response.data;
        } else {
          console.log('Erreur lors de la récupération des niveaux:', response.message);
        }
      });
    }
  }
  openNew() {
    this.niveau={};
    this.niveauDialogueAdd = true;
  }
  editNiveau(niveau: Niveau) {
    this.niveau = { ...niveau };
    this.niveauDialogEdit = true;
  }
  deleteNiveau(niveau: Niveau) {
    this.deleteNiveauDialog = true;
    this.niveau = { ...niveau };
  }

  confirmDelete() {
    this.deleteNiveauDialog = false;
    this.closeDialogEtat.emit()
    if (this.niveau && this.niveau.id) {
      this.niveauService.deleteNiveau(this.niveau.id).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Niveau supprimé', life: 3000 });
        this.niveau = {};
        this.niveauService.getNiveauxByTypeDocument(this.id_type_document).subscribe((response: any) => {
          if (response.status === 'success') {
            this.niveaux = response.data;
          } else {
            console.log('Erreur lors de la récupération des niveaux:', response.message);
          }
        });
      }, error => {
        console.error('Error deleting niveau:', error);
      });
    } else {
      console.error('Invalid niveau ID:', this.niveau);
    }
  }
  hideDialog() {
    this.niveauDialogueAdd = false;
  }
  hideDialogEdit() {
    this.niveauDialogEdit = false;
  }
  addNiveau() {
    this.submitted=true;
    this.niveau.id_type_document = this.id_type_document;
    this.niveauService.addNiveau(this.niveau).subscribe((data: any) => {
      console.log(data);
      this.niveauService.getNiveauxByTypeDocument(this.id_type_document).subscribe((response: any) => {
        if (response.status === 'success') {
          this.niveaux = response.data;
        } else {
          console.log('Erreur lors de la récupération des niveaux:', response.message);
        }
      });
      this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Niveau créé', life: 3000 });
      this.niveauDialogueAdd = false;
      this.niveau = {};
    }, error => {
      console.error('Error creating niveau:', error);
    });
  }

  getNiveau(id: any) {
    this.niveauDialogEdit = true;
    this.niveauService.getNiveauById(id).subscribe(
      (data: any) => {
        console.log('niveau récupéré:', data);
        this.niveau = data.data;
      },
      (error: any) => {
        console.error('Erreur lors de la récupération du niveau:', error);
      }
    );
  }

  updateNiveau() {
    this.niveauDialogEdit = true;
    if (this.niveau.Nom_Niveau?.trim()) {
      this.niveauService.updateNiveau(this.niveau.id, this.niveau).subscribe(() => {
        this.niveauService.getNiveauxByTypeDocument(this.id_type_document).subscribe((response: any) => {
          if (response.status === 'success') {
            this.niveaux = response.data;
          } else {
            console.log('Erreur lors de la récupération des niveaux:', response.message);
          }
        });
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Niveau actualisé', life: 3000 });
        this.niveauDialogEdit = false;
        this.niveau = {};
      }, error => {
        console.error('Error updating niveau:', error);
      });
    }
  }
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  afficheApprobateurs(niveau: Niveau) {
    this.niveauApprobateurSelected.emit(niveau);
    this.approbateurDialog = true;

  }
  afficheEtats(niveau: Niveau) {
    this.niveauSelected.emit(niveau);
    this.etatDialog = true
    this.selectedNiveau = niveau;
  }
}
