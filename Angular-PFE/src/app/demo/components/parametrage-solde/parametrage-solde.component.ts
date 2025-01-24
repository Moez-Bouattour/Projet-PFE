import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { User } from '../../api/user';
import { Solde } from '../../api/solde';
import { soldeService } from '../../service/solde.service';
import { TypeConge } from '../../api/type-conge';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
  selector: 'app-parametrage-solde',
  templateUrl: './parametrage-solde.component.html',
  styleUrls: ['./parametrage-solde.component.scss']
})
export class ParametrageSoldeComponent implements OnInit {

  user: User = {};
  users?: User[];
  typesConges?: TypeConge[];
  userSelected: any;
  anneeDialog: boolean = false;
  anneePrecedenteDialog: boolean = false;
  soldeDialog: boolean = false;
  soldeDialogCloture:boolean= false;
  savoirDialog: boolean = false;
  anneeSelected: any;
  annee: any;
  selectedAnnee: any;
  anneeDialogueAdd: boolean = false;
  soldeDialogEdit: boolean = false;
  solde: Solde = {};
  soldeDialogAdd: boolean = false;
  soldeDialogueAdd: boolean = false;
  selected: any;
  isCloture: boolean = false;
  anneeDialogEdit: boolean = false;
  verif: boolean = false;
  name: any;
  cloture: any;
  selectAnnee: any;
  selectedTypeConge: any;
  soldes: any;
  annees: any;
  items: MenuItem[] = [];
  totalSolde: any;
  totalSoldeInitiale: any;
  totalSoldeRequis: any;
  lastYear:any;
  duree:any='';
  AnneesSelectionner:any;
  Cloturer:any;
  totalDuree:any;
  anneeCloturee: boolean = false;
  selectedTypeCongeEdit:any;
  dureeEdit:any;
  tempSolde:any;
  constructor(private userService: UserService, private soldeService: soldeService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.userService.getUsers().subscribe((data: any) => {
      this.users = data.users_avec_soldes_par_annee;
      this.typesConges = data.type_conges;
      console.log(this.users);
    });
    this.items = [
      {
        label: 'Afficher tous les années',
        icon: 'pi pi-plus',
        command: () => this.anneePrecedenteDialog = true
      },
      {
        label: 'Afficher solde précédente ',
        icon: 'pi pi-plus',
        command: () => {
          this.anneePrecedenteDialog = false;
          this.savoirDialog = true;
        }
      },
    ];


  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  openSavoirPlus() {
    this.savoirDialog = true;
  }

  changeAnnee(event: any) {
    console.log(this.userSelected);
    console.log(event);
    this.selectAnnee = event.value;
    this.anneeDialog = true;
    if (this.selected) {
      const selectedYearData = this.selected.soldes_par_annee.find((yearData: any) => yearData.annee == this.selectAnnee);
      if (selectedYearData) {
        console.log(selectedYearData);
        this.isCloture = selectedYearData.cloture;
        if(selectedYearData.cloture == 1)
          {
            this.Cloturer='oui';
          }
          else if(selectedYearData.cloture != 1){
            this.Cloturer='non';
          }
        this.verif = true;
        this.userSelected = selectedYearData.soldes;
      } else {
        this.userSelected = [];
      }
    }
  }
  onChildUser(event: any) {
    this.userSelected = event.soldes_par_annee;
    this.AnneesSelectionner=event.soldes_par_annee;
    this.selected = event;
    console.log(this.selected);
    const sortedYears = this.selected.annees.sort((a: any, b: any) => b.annee - a.annee);
    const allYears = this.selected.soldes_par_annee.map((item: any) => parseInt(item.annee));
    const lastYear = Math.max(...allYears);
    const previousYears = this.selected.soldes_par_annee.filter((year: any) => parseInt(year.annee) < lastYear);

    const sortedPreviousYears = previousYears.sort((a: any, b: any) => b.annee - a.annee);
    this.lastYear = sortedYears[0].annee;
    this.anneePrecedenteDialog = false;
    this.annees = sortedPreviousYears;
    this.name = this.selected.user.name;
    console.log(this.userSelected);
    this.anneeSelected = this.userSelected.filter((user: any) => user.annee == this.lastYear);
    this.anneeSelected = this.anneeSelected[0].soldes;
    console.log(this.anneeSelected);
    this.totalSolde = this.anneeSelected.reduce((acc: any, user: any) => acc + user.solde, 0);
    this.totalSoldeInitiale = this.anneeSelected.reduce((acc: any, user: any) => acc + user.solde_initiale, 0);
    this.totalSoldeRequis = this.anneeSelected.reduce((acc: any, user: any) => acc + user.conge_pris, 0);
    this.totalDuree= this.anneeSelected.reduce((acc: any, user: any) => acc + user.duree, 0);
    this.annee = this.anneeSelected[0].annee;
    this.anneeDialog = false;
    this.soldeDialog = true;
}

  onChildAnnee(event: any) {
    this.annee = event;
    console.log(this.annee);
    this.anneeSelected = event.soldes;
    this.soldeDialog = true;
  }

  getAnnee(data: any) {
    console.log(data);
    this.solde={...data};
    this.anneeDialogEdit = true;
    this.selectAnnee = data;

  }
  getSolde(data: any) {
    console.log(data);
    this.soldeDialogEdit = true;
    this.solde = data;
    console.log(data);

    this.tempSolde = { ...data };
    this.selectedTypeCongeEdit=data.id_type_conge;
    console.log(this.selectedTypeCongeEdit);
    this.dureeEdit=data.duree;
    //this.dureeEdit=this.typesConges?.find((type:any)=> type.id==this.selectedTypeCongeEdit)?.duree;
    console.log(this.dureeEdit);
  }
  calculerSolde(event: any) {
    const valeurInput = parseFloat(event.target.value);
    this.tempSolde.solde = valeurInput + this.tempSolde.solde_initiale;
  }

  updateSolde()
  {
    this.tempSolde.duree=this.dureeEdit;
    this.soldeService.updateSolde(this.tempSolde.id,this.tempSolde).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Année actualisé', life: 3000 });
     this.soldeDialogEdit=false;
      this.loadAnnee();
      this.solde = {};
    }, (error: any) => {
      console.error('Error updating année:', error);
    });
  }
  isRowSelected(annee: any): boolean {
    return this.selectedAnnee === annee;
  }

  onRowClick(annee: any) {
    this.selectedAnnee = annee;
  }

  closeAnneeDialog() {
    this.anneeDialog = false;
    this.soldeDialog = false;
  }
  closeSoldeDialog() {
    this.soldeDialog = false;
  }
  openNewAnnee() {
    this.solde = {};
    this.anneeDialogueAdd = true;
  }
  openNewSolde() {
    this.solde = {};
    this.soldeDialogueAdd = true;
    this.duree='';
    this.selectedTypeConge='';
  }
  hideDialog() {
    this.selectedTypeConge = '';
    this.duree='';
    this.savoirDialog = false;
    this.anneeDialogueAdd = false;
    this.soldeDialogueAdd = false;
    this.anneeDialogEdit = false;
    this.anneeDialog = false;
    this.verif = false;
  }

  hideDialogEdit() {
    this.soldeDialogEdit = false;
    this.soldeDialogCloture =false;
  }
  hideDialogEditNouvelleAnnee() {
    this.soldeDialogEdit = false;
    this.solde={};
  }

  addAnnee() {
    if (this.solde.annee?.trim()) {
      this.solde.id_user = this.selected.user.id;
      this.solde.cloture = this.isCloture;
      this.soldeService.addSolde(this.solde).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'année créé', life: 3000 });
        this.anneeDialogueAdd = false;
        this.loadAnnee();
        this.solde = {};
      }, (error: any) => {
        console.error('Error creating typedocument:', error);
      });
    }
  }
  changeType(event: any) {
    console.log(event);
    this.selectedTypeConge = event.value;
    this.selectedTypeCongeEdit = event.value;
    this.duree=this.typesConges?.find((type:any)=> type.id==this.selectedTypeConge)?.duree
    this.dureeEdit=this.typesConges?.find((type:any)=> type.id==this.selectedTypeCongeEdit)?.duree


  }
  addType() {
    console.log(this.selected);
    this.solde.id_user = this.selected.user.id;
    this.solde.annee = this.lastYear;
    this.solde.id_type_conge = this.selectedTypeConge;
    this.soldeService.addType(this.solde).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Type de congé créé', life: 3000 });
      this.soldeDialogueAdd = false;
      this.loadAnnee()
      this.solde = {};
    }, (error: any) => {
      console.log(error);
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
    });

  }


  updateAnnee() {
    this.solde.id_user = this.selected.user.id;
    this.solde.annee = this.selectAnnee.annee;
    this.solde.cloture = this.isCloture;
    this.soldeService.updateAnnee(this.solde).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Année actualisé', life: 3000 });
      this.savoirDialog = false;
      this.anneeDialog = false;
      this.anneeDialogEdit = false;
      this.verif = false;
      this.loadAnnee();
      this.solde = {};
    }, (error: any) => {
      console.error('Error updating année:', error);
    });
  }

  loadAnnee() {
    this.userService.getUsers().subscribe((data: any) => {
      this.users = data.users_avec_soldes_par_annee;
      console.log(this.users);
      this.userSelected = this.users?.find((user: any) => user.user.id === this.selected.user.id);
      this.selected = this.userSelected;
      console.log('this.userSelected:', this.userSelected);
      this.userSelected = this.userSelected.soldes_par_annee;
      this.AnneesSelectionner=this.userSelected;
      console.log(this.AnneesSelectionner);

        console.log('this.selected:', this.selected);
        const sortedYears = this.selected.annees.sort((a: any, b: any) => b.annee - a.annee);
        this.lastYear = sortedYears[0].annee;
        const allYears = this.selected.soldes_par_annee.map((item: any) => parseInt(item.annee));
        const lastYear = Math.max(...allYears);
        const previousYears = this.selected.soldes_par_annee.filter((year: any) => parseInt(year.annee) < lastYear);

        const sortedPreviousYears = previousYears.sort((a: any, b: any) => b.annee - a.annee);
        this.lastYear = sortedYears[0].annee;
        this.anneePrecedenteDialog = false;
        this.annees = sortedPreviousYears;
        this.anneeSelected = this.userSelected.filter((user: any) => user.annee == this.lastYear);
        this.anneeSelected = this.anneeSelected[0].soldes;
        console.log('this.anneeSelected:', this.anneeSelected);

          this.totalSolde = this.anneeSelected.reduce((acc: any, user: any) => acc + user.solde, 0);
          this.totalSoldeInitiale = this.anneeSelected.reduce((acc: any, user: any) => acc + user.solde_initiale, 0);
          this.totalSoldeRequis = this.anneeSelected.reduce((acc: any, user: any) => acc + user.conge_pris, 0);
          this.totalDuree=this.anneeSelected.reduce((acc: any, user: any) => acc + user.duree, 0);

          if (this.isCloture) {
            this.openSoldeDialog();
          }
        });


  }

  event(event: any) {
    this.isCloture = event.checked;
    console.log('Valeur de isCloture :', this.isCloture);
  }
  onAnneeCloturee() {
    this.anneeCloturee = true;
    this.openSoldeDialog();
  }

  openSoldeDialog() {
    this.soldeDialogCloture = true;
  }
}
