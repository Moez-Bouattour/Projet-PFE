import { Component } from '@angular/core';
import { Ville } from '../../api/ville';
import { MessageService } from 'primeng/api';
import { VilleService } from '../../service/ville.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-ville',
  templateUrl: './ville.component.html',
  styleUrls: ['./ville.component.scss']
})
export class VilleComponent {
  deleteVilleDialog: boolean = false;

  villeDialogue: boolean = false;

  villeDialogEdit: boolean = false;

  ville: Ville = {};

  rowsPerPageOptions = [5, 10, 15];

  lastId: number = 0;

  villes?: Ville[];

 villeForm: FormGroup;

 villeFormEdit: FormGroup;

 submitted: boolean = false;
 data: any;

 options: any;
  constructor(private messageService: MessageService, private villeService : VilleService, private formBuilder: FormBuilder ) {
    this.villeForm = this.formBuilder.group({
      nom_ville: ['', Validators.required],
      codePostal: ['', Validators.required],

    });
    this.villeFormEdit = this.formBuilder.group({
      id: ['', Validators.required],
      nom_ville: ['', Validators.required],
      codePostal: ['', Validators.required],


    });
  }

  ngOnInit(): void {
    this.villeService.getVilles().subscribe((data: any) => {
      this.villes = data;
    });

  }


  openNew() {
    this.ville={};
    this.villeDialogue = true;
  }

  editVille(ville: Ville) {
    this.ville = { ...ville };
    this.villeDialogEdit = true;
  }

  deleteVille(ville: Ville) {
    this.deleteVilleDialog = true;
    this.ville = { ...ville };
  }


  confirmDelete() {
    this.deleteVilleDialog = false;
    if (this.ville && this.ville.id) {
      this.villeService.deleteVille(this.ville.id).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Ville supprimé', life: 3000 });
        this.ville = {};
        this.loadVille();
      }, error => {
        console.error('Error deleting ville:', error);
      });
    } else {
      console.error('Invalid ville ID:', this.ville);
    }
  }

  hideDialog() {
    this.submitted = false;
    this.villeDialogue = false;

  }
  hideDialogEdit() {
    this.villeDialogEdit = false;
  }

  addVille() {
    this.submitted = true;
    if (this.villeForm.valid) {
      const villeForm = this.villeForm.value;
      this.villeService.addVille(villeForm).subscribe(() => {
       this.villeForm.reset();
        this.loadVille();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Ville créé', life: 3000 });
        this.villeDialogue = false;
      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
      });
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'veillez remplir les champs obligatires', life: 3000 });

    }
  }

  getVille(id: any) {
    this.villeDialogEdit= true;
    this.villeService.getVilleById(id).subscribe(
      (data: any) => {
        console.log('Ville récupéré:', data);
        this.villeFormEdit.patchValue({
          id: data.data.id,
          nom_ville :data.data.nom_ville,
          codePostal:data.data.codePostal
        });
      },
      (error: any) => {
        console.error('Erreur lors de la récupération du ville !', error);
      }
    );
  }

  updateVille() {
    this.villeDialogEdit = true
    if (this.villeFormEdit.valid) {
      const villeFormEdit = this.villeFormEdit.value;
      this.villeService.updateVille(villeFormEdit.id, villeFormEdit).subscribe(() => {
        this.loadVille();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Ville actualisé', life: 3000 });
        this.villeDialogEdit = false;

      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
      });

    }
  }

  loadVille() {
    this.villeService.getVilles().subscribe((data: any) => {
      this.villes = data;
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
