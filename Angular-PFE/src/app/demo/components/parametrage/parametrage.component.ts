import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ParametrageService } from '../../service/parametrage.service';
import { Typedocument } from '../../api/typedocument';
import { Niveau } from '../../api/niveau';
import { User } from '../../api/user';

@Component({
  selector: 'app-parametrage',
  templateUrl: './parametrage.component.html',
  styleUrls: ['./parametrage.component.scss']
})
export class ParametrageComponent implements OnInit {
  typedocuments?: Typedocument;

  typeDocumentSelected?: Typedocument;

  niveauSelected?: Niveau;

  niveauApprobateurSelected?: Niveau;

  niveaux?: Niveau;

  niveauDialog: boolean = false;

  etatDialog: boolean = false;

  approbateurDialog: boolean = false;
  selectedMulti: User[] = [];

  constructor(private parametrageService: ParametrageService) { }


  ngOnInit(): void {
    this.parametrageService.getTypeDocuments().subscribe((data: any) => {
      this.typedocuments = data;
      console.log(this.typedocuments);
    });
  }

  onChildTypeDocument(event: Typedocument) {
    this.typeDocumentSelected = event;
    this.niveauDialog = true;
    this.etatDialog = false;
  }
  onChildNiveau(event: Niveau) {
    this.niveauSelected = event;
    this.etatDialog = true;
  }

  onChildApprobateur(event: Niveau) {
    this.niveauApprobateurSelected = event;
    this.approbateurDialog = true;
  }
  closeApprobateurDialog() {
    this.approbateurDialog = false;
  }
  closeNiveauDialog() {
    this.niveauDialog = false;
    this.etatDialog = false;
    }
    closeEtatDialog() {
     this.etatDialog = false;
    }
}

