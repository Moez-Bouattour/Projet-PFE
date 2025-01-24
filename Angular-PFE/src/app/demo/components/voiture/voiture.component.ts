import { Component } from '@angular/core';
import { Voiture } from '../../api/voiture';
import { MessageService } from 'primeng/api';
import { VoitureService } from '../../service/voiture.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-voiture',
  templateUrl: './voiture.component.html',
  styleUrls: ['./voiture.component.scss']
})
export class VoitureComponent {
  deleteVoitureDialog: boolean = false;

  voitureDialogue: boolean = false;

  voitureDialogEdit: boolean = false;


  voiture: Voiture = {};

  rowsPerPageOptions = [5, 10, 15];

  lastId: number = 0;

  voitures?: Voiture[];

 voitureForm: FormGroup;

 voitureFormEdit: FormGroup;

 submitted: boolean = false;
 data: any;

 options: any;
  constructor(private messageService: MessageService, private voitureService : VoitureService, private formBuilder: FormBuilder ) {
    this.voitureForm = this.formBuilder.group({
      nom_voiture: ['', Validators.required],
      compteur_initiale: ['', Validators.required],
      compteur_finale: ['', Validators.required],
      immatricule: ['', Validators.required],

    });
    this.voitureFormEdit = this.formBuilder.group({
      id: ['', Validators.required],
      nom_voiture: ['', Validators.required],
      compteur_initiale: ['', Validators.required],
      compteur_finale: ['', Validators.required],
      immatricule: ['', Validators.required],

    });
  }

  ngOnInit(): void {
    this.voitureService.getVoitures().subscribe((data: any) => {
      this.voitures = data;
    });

  }


  openNew() {
    this.voiture={};
    this.voitureDialogue = true;
  }
  editVoiture(voiture: Voiture) {
    this.voiture = { ...voiture };
    this.voitureDialogEdit = true;
  }
  deleteVoiture(voiture: Voiture) {
    this.deleteVoitureDialog = true;
    this.voiture = { ...voiture };
  }


  confirmDelete() {
    this.deleteVoitureDialog = false;
    if (this.voiture && this.voiture.id) {
      this.voitureService.deleteVoiture(this.voiture.id).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Voiture supprimé', life: 3000 });
        this.voiture = {};
        this.loadVoiture();
      }, error => {
        console.error('Error deleting voiture:', error);
      });
    } else {
      console.error('Invalid voiture ID:', this.voiture);
    }
  }

  hideDialog() {
    this.submitted = false;
    this.voitureDialogue = false;

  }
  hideDialogEdit() {
    this.voitureDialogEdit = false;
  }

  addVoiture() {
    this.submitted = true;
    if (this.voitureForm.valid) {
      const voitureForm = this.voitureForm.value;
      this.voitureService.addVoiture(voitureForm).subscribe(() => {
       this.voitureForm.reset();
        this.loadVoiture();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Voiture créé', life: 3000 });
        this.voitureDialogue = false;
      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
      });
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'veillez remplir les champs obligatires', life: 3000 });

    }
  }

  getVoiture(id: any) {
    this.voitureDialogEdit= true;
    this.voitureService.getVoitureById(id).subscribe(
      (data: any) => {
        console.log('Voiture récupéré:', data);
        this.voitureFormEdit.patchValue({
          id: data.data.id,
          nom_voiture :data.data.nom_voiture,
          compteur_initiale :data.data.compteur_initiale,
          compteur_finale :data.data.compteur_finale,
          immatricule :data.data.immatricule,
        });
      },
      (error: any) => {
        console.error('Erreur lors de la récupération du voiture !', error);
      }
    );
  }

  updateVoiture() {
    this.voitureDialogEdit = true
    if (this.voitureFormEdit.valid) {
      const voitureFormEdit = this.voitureFormEdit.value;
      this.voitureService.updateVoiture(voitureFormEdit.id, voitureFormEdit).subscribe(() => {
        this.loadVoiture();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Voiture actualisé', life: 3000 });
        this.voitureDialogEdit = false;

      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
      });

    }
  }

  loadVoiture() {
    this.voitureService.getVoitures().subscribe((data: any) => {
      this.voitures = data;
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
