import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { Typedocument } from 'src/app/demo/api/typedocument';
import { FormBuilder} from '@angular/forms';
import { TypedocumentService } from 'src/app/demo/service/typedocument.service';

@Component({
  selector: 'app-type-document',
  templateUrl: './type-document.component.html',
  styleUrls: ['./type-document.component.scss'],
})
export class TypeDocumentComponent implements OnInit {

  @Input() typedocuments?: Typedocument;

  @Input() etatDialog?: boolean;

  @Output() typedocumentSelected = new EventEmitter<Typedocument>();

  @Output() closeDialogNiveau = new EventEmitter<void>();

  niveauDialog: boolean = false;

  typedocumentDialogAdd: boolean = false;

  typedocumentDialogEdit: boolean = false;

  deleteTypedocumentDialog: boolean = false;

  typedocument: Typedocument = {};

  lastId: number = 0;

  rowsPerPageOptions = [5, 10, 15];

  selectedTypedocument: Typedocument | null = null;

  names:any[]=[];

  constructor(private messageService: MessageService, private router: Router, private formBuilder: FormBuilder,
    private typeDocumentService: TypedocumentService, private ngZone: NgZone) { }

  ngOnInit() {
    this.names = [
      { label: 'congé', value: 'congé' },
      { label: 'autorisation', value: 'autorisation' },
      { label: 'déplacement', value: 'déplacement' }
    ];
  }
  sendEvent(typedocuments: Typedocument) {
    this.typedocumentSelected.emit(typedocuments);
    this.selectedTypedocument = typedocuments;
    this.niveauDialog = true;
    console.log(this.niveauDialog);

  }
  openNew() {
    this.typedocument={};
    this.typedocumentDialogAdd = true;
  }
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  editTypedocument(typedocument: Typedocument) {
    this.typedocument = { ...typedocument };
    this.typedocumentDialogEdit = true;
  }
  deleteTypedocument(typedocument: Typedocument) {
    this.deleteTypedocumentDialog = true;
    this.typedocument = { ...typedocument };
  }

  confirmDelete() {
    this.closeDialogNiveau.emit();
    this.deleteTypedocumentDialog = false;
    if (this.typedocument && this.typedocument.id) {
      this.typeDocumentService.deleteTypeDocuments(this.typedocument.id).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Typedocument supprimé', life: 3000 });
        this.typedocument = {};
        this.typeDocumentService.gettypeDocuments().subscribe(
          (data: any) => {
            this.typedocuments = data;
          }
        );
      }, error => {
        console.error('Error deleting typedocument:', error);
      });
    } else {
      console.error('Invalid typedocument ID:', this.typedocument);
    }
  }
  hideDialog() {
    this.typedocumentDialogAdd = false;
  }
  hideDialogEdit() {
    this.typedocumentDialogEdit = false;
  }
  addTypedocument() {
    if (this.typedocument.description?.trim()) {
      this.typeDocumentService.addTypeDocument(this.typedocument).subscribe(() => {
        this.loadTypeDocuments();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Typedocument créé', life: 3000 });
        this.typedocumentDialogAdd = false;
        this.typedocument = {};
      }, error => {
        console.error('Error creating typedocument:', error);
      });
    }
  }
  getTypeDocument(id: any) {
    this.typedocumentDialogEdit = true;
    this.typeDocumentService.getTypeDocumentById(id).subscribe(
      (data: any) => {
        console.log('Document de type récupéré:', data);
        this.typedocument = data.data;
      },
      (error: any) => {
        console.error('Erreur lors de la récupération du document de type:', error);
      }
    );
  }

  updateTypedocument() {
    this.typedocumentDialogEdit = true
    if (this.typedocument.description?.trim()) {
      this.typeDocumentService.updateTypeDocument(this.typedocument.id, this.typedocument).subscribe(() => {
        this.loadTypeDocuments();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Typedocument actualisé', life: 3000 });
        this.typedocumentDialogEdit = false;
        this.typedocument = {};
      }, error => {
        console.error('Error updating typedocument:', error);
      });
    }
  }
  loadTypeDocuments() {
    this.typeDocumentService.gettypeDocuments().subscribe(
      (data: any) => {
        this.typedocuments = data;
      },
      error => {
        console.error('Error loading typeDocuments:', error);
      }
    );
  }
}

