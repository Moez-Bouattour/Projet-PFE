import { Component, OnInit } from '@angular/core';
import { JourFerie } from '../../api/jour-ferie';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JourFerieService } from '../../service/jour-ferie.service';
import { formatDate } from '@angular/common';
import { WeekendService } from '../../service/weekend.service';


@Component({
  selector: 'app-jour-ferie',
  templateUrl: './jour-ferie.component.html',
  styleUrls: ['./jour-ferie.component.scss']
})
export class JourFerieComponent implements OnInit {

  jourferieDialogAdd: boolean = false;

  showTable: boolean = false;

  submitted: boolean = false;

  jourferieDialogEdit: boolean = false;

  deletejourferieDialog: boolean = false;

  jourferie: JourFerie = {};

  jourferies: JourFerie[] = [];

  jourferieForm: FormGroup;

  jourferieFormEdit: FormGroup;

  loggedIn: boolean = false;

  token: any;

  userData: any;

  id: any;

  weekendSettingsDialog: boolean = false;

  includeLundi :boolean=false;

  includeMardi: boolean = false;
  includeMercredi: boolean = false;
  includeJeudi: boolean = false;
  includeVendredi: boolean = false;
  includeSamedi: boolean = false;
  includeDimanche: boolean = false;

  constructor(private jourFerieService:JourFerieService,private messageService: MessageService,
     private formBuilder: FormBuilder , private weekendService:WeekendService) {
    this.jourferieForm = this.formBuilder.group({
      id_user: [''],
      date: ['', Validators.required],
      evenement: ['', Validators.required],

    });
    this.jourferieFormEdit = this.formBuilder.group({
      id: ['', Validators.required],
      id_user: [''],
      date: ['', Validators.required],
      evenement: ['', Validators.required],

    });
  }

  ngOnInit(): void {
    this.jourFerieService.getJoursFeries().subscribe((data: any) => {
      this.jourferies = data;
    });
  }

  openNew() {
    this.jourferie= {};
    this.jourferieForm.reset();
    this.jourferieDialogAdd= true;
    this.submitted = false;

  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  editJourferie(jourferie: JourFerie) {
    this.jourferie = { ...jourferie };
    this.jourferieDialogEdit= true;
  }
  deleteJourferie(jourferie: JourFerie) {
    this.deletejourferieDialog = true;
    this.jourferie = { ...jourferie };
  }

  confirmDelete() {
    this.deletejourferieDialog = false;
    if (this.jourferie && this.jourferie.id) {
      this.jourFerieService.deleteJourFerie(this.jourferie.id).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Jour férié supprimé', life: 3000 });
        this.jourferie = {};
        this.loadJourferie();
      }, error => {
        console.error('Error deleting Jour férié:', error);
      });
    } else {
      console.error('Invalid Jour férié ID:', this.jourferie);
    }
  }
  hideDialog() {
    this.submitted = false;
    this.jourferieDialogAdd = false;

  }
  hideDialogEdit() {
    this.jourferieDialogEdit = false;
  }

  addJourferie() {
    this.submitted = true;
    if (this.jourferieForm.valid) {
      const jourferieForm = this.jourferieForm.value;
      this.jourFerieService.addJourFerie(jourferieForm).subscribe(() => {
        this.loadJourferie();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Jour férié créé', life: 3000 });
        this.jourferieDialogAdd = false;
      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
      });
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'veillez remplir les champs obligatires', life: 3000 });

    }
  }

  getJourferie(id: any) {
    this.jourferieDialogEdit= true;
    this.jourFerieService.getJourFerieById(id).subscribe(
      (data: any) => {
        console.log('Jour férié récupéré:', data);
        const dateFormatted = formatDate(data.data.date, 'MM/dd/yyyy', 'en-US')
        this.jourferieFormEdit.patchValue({
          id: data.data.id,
          date: dateFormatted ,
          evenement :data.data.evenement,
        });
      },
      (error: any) => {
        console.error('Erreur lors de la récupération du jour férié !', error);
      }
    );
  }

  updateJourferie() {
    this.jourferieDialogEdit = true
    if (this.jourferieFormEdit.valid) {
      const jourferieFormEdit = this.jourferieFormEdit.value;
      jourferieFormEdit.date = new Date(new Date(jourferieFormEdit.date).getTime() + 86400000).toISOString().split('T')[0];
      this.jourFerieService.updateJourFerie(jourferieFormEdit.id, jourferieFormEdit).subscribe(() => {
        this.loadJourferie();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Jour férié actualisé', life: 3000 });
        this.jourferieDialogEdit = false;

      }, error => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
      });

    }
  }

  loadJourferie() {
    this.jourFerieService.getJoursFeries().subscribe((data: any) => {
      this.jourferies = data;
    });
  }

  isCurrentMonth(date: string): boolean {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const parsedDate = new Date(date);
    const monthOfDate = parsedDate.getMonth();
    return currentMonth === monthOfDate;
  }

  getFormattedDates(jourferies: JourFerie[]): Date[] {
    return jourferies.filter(jourFerie => this.isCurrentMonth(jourFerie.date))
                     .map(jourFerie => new Date(jourFerie.date));
  }

//weekend
openWeekendSettingsDialog() {
  this.weekendService.getWeekendById(1).subscribe(
    (data: any) => {

      this.includeLundi = data.data.include_lundi === 1,
      this.includeMardi= data.data.include_mardi === 1,
      this.includeMercredi = data.data.include_mercredi === 1,
      this.includeJeudi =  data.data.include_jeudi === 1,
      this.includeVendredi = data.data.include_vendredi === 1,
      this.includeSamedi = data.data.include_samedi === 1,
      this.includeDimanche = data.data.include_dimanche === 1,

      this.weekendSettingsDialog = true;
    },
    (error: any) => {
      console.error('Erreur lors de la récupération des données du week-end :', error);
    }
  );
}

closeWeekendSettingsDialog() {
  this.weekendSettingsDialog = false;
}

saveWeekendSettings() {
  const weekendSettings = {
    includeLundi: this.includeLundi,
    includeMardi: this.includeMardi,
    includeMercredi: this.includeMercredi,
    includeJeudi: this.includeJeudi,
    includeVendredi: this.includeVendredi,
    includeSamedi: this.includeSamedi,
    includeDimanche:this.includeDimanche,
  };
  this.weekendService.modifierParametreWeekend(weekendSettings).subscribe(
    response => {
      console.log('Paramètre du week-end mis à jour avec succès', response);
      this.messageService.add({severity:'success', summary:'Succès', detail:'Paramètre du week-end mis à jour avec succès'});
    },
    error => {
      console.error('Erreur lors de la mise à jour des paramètres du week-end', error);
    }
  );
  this.weekendSettingsDialog = false;
}
}
