import { Component } from '@angular/core';
import { TypeConge } from '../../api/type-conge';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TypeCongeService } from '../../service/type-conge.service';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-type-conge',
  templateUrl: './type-conge.component.html',
  styleUrls: ['./type-conge.component.scss']
})
export class TypeCongeComponent {

  showTable: boolean = false;

  submitted: boolean = false;

  typeCongeDialogEdit: boolean = false;

  deleteTypeCongeDialog: boolean = false;

  typeCongeDialogAdd:boolean=false;

  typeConge: TypeConge = {};

  typeConges: TypeConge[] = [];

  typeCongeForm: FormGroup;

  typeCongeFormEdit: FormGroup;

  loggedIn: boolean = false;

  token: any;

  userData: any;

  id: any;

  constructor(private typeCongeService:TypeCongeService,private messageService: MessageService, private formBuilder: FormBuilder) {
    this.typeCongeForm = this.formBuilder.group({
      type_nom_conge: ['', Validators.required],
      duree: ['', Validators.required],

    });
    this.typeCongeFormEdit = this.formBuilder.group({
      id: ['', Validators.required],
      type_nom_conge: ['', Validators.required],
      duree: ['', Validators.required],

    });
  }

  ngOnInit(): void {
    this.typeCongeService.getTypeConges().subscribe((data: any) => {
      this.typeConges = data;
    });
  }



  openNew() {
    this.typeConge= {};
    this.typeCongeForm.reset();
    this.typeCongeDialogAdd= true;
    this.submitted = false;

  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  editTypeConge(typeConge: TypeConge) {
    this.typeConge = { ...typeConge };
    this.typeCongeDialogEdit= true;
  }
  deleteTypeConge(typeConge: TypeConge) {
    this.deleteTypeCongeDialog = true;
    this.typeConge = { ...typeConge };
  }

  confirmDelete() {
    this.deleteTypeCongeDialog = false;
    if (this.typeConge && this.typeConge.id) {
      this.typeCongeService.deleteTypeConge(this.typeConge.id).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Type congé supprimé', life: 3000 });
        this.typeConge = {};
        this.loadTypeConge();
      }, error => {
        console.error('Error deleting Type congé:', error);
      });
    } else {
      console.error('Invalid Type Congé ID:', this.typeConge);
    }
  }
  hideDialog() {
    this.submitted = false;
    this.typeCongeDialogAdd = false;

  }
  hideDialogEdit() {
    this.typeCongeDialogEdit = false;
  }

  addTypeConge() {
    this.submitted = true;
    if (this.typeCongeForm.valid) {
      const typeCongeForm = this.typeCongeForm.value;
      this.typeCongeService.addTypeConge(typeCongeForm).subscribe(() => {
        this.loadTypeConge();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Type congé créé', life: 3000 });
        this.typeCongeDialogAdd = false;
      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
      });
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'veillez remplir les champs obligatires', life: 3000 });

    }
  }
  getTypeConge(id: any) {
    this.typeCongeDialogEdit= true;
    this.typeCongeService.getTypeCongeById(id).subscribe(
      (data: any) => {
        console.log('Type congé récupéré:', data);
        this.typeCongeFormEdit.patchValue({
          id: data.data.id,
          type_nom_conge: data.data.type_nom_conge ,
          duree :data.data.duree,
        });
      },
      (error: any) => {
        console.error('Erreur lors de la récupération du type congé !', error);
      }
    );
  }

  updateTypeConge() {
    this.typeCongeDialogEdit = true
    if (this.typeCongeFormEdit.valid) {
      const typeCongeFormEdit = this.typeCongeFormEdit.value;
      this.typeCongeService.updateTypeConge(typeCongeFormEdit.id, typeCongeFormEdit).subscribe(() => {
        this.loadTypeConge();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Type congé actualisé', life: 3000 });
        this.typeCongeDialogEdit = false;

      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
      });

    }
  }
  loadTypeConge() {
    this.typeCongeService.getTypeConges().subscribe((data: any) => {
      this.typeConges = data;
    });
  }



}


