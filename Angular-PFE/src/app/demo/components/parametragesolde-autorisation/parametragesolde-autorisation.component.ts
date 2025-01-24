import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { Table } from 'primeng/table';
import { SoldeAutorisation } from '../../api/solde-autorisation';
import { SoldeAutorisationService } from '../../service/solde-autorisation.service';
import { MessageService } from 'primeng/api';
import { RepasService } from '../../service/repas.service';

@Component({
  selector: 'app-parametragesolde-autorisation',
  templateUrl: './parametragesolde-autorisation.component.html',
  styleUrls: ['./parametragesolde-autorisation.component.scss']
})
export class ParametragesoldeAutorisationComponent implements OnInit {

  users:any[]=[];
  soldes:any;
  name:any;
  soldeDialog:boolean=false;
  mois:any;
  userSelected:any;
  solde: SoldeAutorisation = {};
  soldeDialogueAdd:boolean=false;
  repasSettingsDialog: boolean = false;
  heureDebut: any;
  heureFin: any;
  constructor(private userService:UserService, private soldeAutorisationService:SoldeAutorisationService,
              private messageService:MessageService, private repasService:RepasService
  ){}
  ngOnInit(): void {
    this.userService.getUsers().subscribe((data: any) => {
      this.users = data.users_avec_soldes_par_annee;
      console.log(this.users);
      if (data && data.users_avec_soldes_par_annee && this.userSelected) {
      const user = this.users.find((user: any) => user.user.id === this.userSelected.user.id);
      const today = new Date();
      const month = today.getMonth() + 1;
      const soldes =user.solde_autorisations_par_annee.find((user:any)=> user.annee=='2024' && user.mois==month);
      console.log(soldes);
      this.soldes=soldes;
      }
    });
  }
  formatDuree(dureeEnMinutes: number): string {
    const heures = Math.floor(dureeEnMinutes / 60);
    const minutes = dureeEnMinutes % 60;
    let formattedDuree = '';

    if (heures === 0 && minutes === 0) {
        formattedDuree = '0 heure 0 minute';
    } else {
        if (heures > 0) {
            formattedDuree += heures + ' heure';
            if (heures > 1) {
                formattedDuree += 's';
            }
        }
        if (minutes > 0) {
            if (heures > 0) {
                formattedDuree += ' ';
            }
            formattedDuree += minutes + ' minute';
            if (minutes > 1) {
                formattedDuree += 's';
            }
        }
    }

    return formattedDuree;
}

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  openNew()
  {

    if(this.soldes.length == 0){
      this.soldeDialogueAdd=true;
      this.solde.duree=7;

    }
    else{

      this.soldeDialogueAdd=false;
    }
  }

  onChildUser(event: any) {
    this.soldes=[];
    this.soldeDialog=true;
    console.log(event);
    this.userSelected=event;
    console.log(this.userSelected);

    this.name=event.user.name
    console.log(event.user.solde_autorisations);
    const today = new Date();
    const month = today.getMonth() + 1;
    const soldes=event.user.solde_autorisations.find((user:any)=> user.annee=='2025' && user.mois==month);
    const keys = ['id', 'id_user', 'annee', 'mois', 'solde', 'duree','','','autorisation_pris'];

    console.log(Object.keys(soldes).map(key => soldes[key]));

    this.mois = today.toLocaleString('fr-FR', { month: 'long' });
    console.log(this.mois)

    if(soldes){
      this.soldes = [Object.keys(soldes)
    .map(key => soldes[key])
    .reduce((acc: any, val: any, i: any) => (
      i % keys.length === 0 ? acc.push({}) : null,
      acc[acc.length - 1][keys[i % keys.length]] = val,
      acc
    ), [])
  [0]]
  

        console.log(this.soldes);


    }

}
hideDialog()
{
  this.soldeDialogueAdd=false;
}
addSolde() {
  if (this.solde.solde?.trim()) {
    this.solde.id_user = this.userSelected.user.id;
    this.solde.autorisation_pris = 0;
    const today = new Date();
    this.solde.mois=today.getMonth() + 1;
    this.soldeAutorisationService.addSoldeAutorisation(this.solde).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'solde créé', life: 3000 });
      this.soldeDialogueAdd = false;
      this.loadSolde();
      this.solde = {};
    }, (error: any) => {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.data, life: 3000 });
      console.log('Error creating solde:', error.data);
    });
  }
}
loadSolde()
{
  this.userService.getUsers().subscribe((data: any) => {
    this.users = data.users_avec_soldes_par_annee;
    console.log(this.users);
    const user = this.users?.find((user: any) => user.user.id === this.userSelected.user.id);
    const today = new Date();
    const month = today.getMonth() + 1;
    const soldes =user.user.solde_autorisations.find((user:any)=> user.annee=='2024' && user.mois==month);
    const keys = ['id', 'id_user', 'annee', 'mois', 'solde','autorisation_pris'];
    console.log(Object.keys(soldes).map(key => soldes[key]));
    this.soldes = [Object.keys(soldes)
    .map(key => soldes[key])
    .reduce((acc: any, val: any, i: any) => (
      i % keys.length === 0 ? acc.push({}) : null,
      acc[acc.length - 1][keys[i % keys.length]] = val,
      acc
    ), [])
  [0]];

    console.log(this.soldes);
  });
}
//repas
openRepasSettingsDialog() {
  this.repasService.getRepasById(1).subscribe(
    (data: any) => {
      this.heureDebut = data.data.heure_debut;
      this.heureFin = data.data.heure_fin;
      this.repasSettingsDialog = true;

    },
    (error: any) => {
      console.error('Erreur lors de la récupération des données du repas :', error);
    }
  );
}

closeRepasSettingsDialog() {
  this.repasSettingsDialog = false;
}

saveRepasSettings() {
  const repasSettings = {
    heure_debut: this.heureDebut,
    heure_fin: this.heureFin ,
  };
  this.repasService.modifierParametreRepas(repasSettings).subscribe(
    response => {
      console.log('Paramètre du repas mis à jour avec succès', response);
      this.messageService.add({severity:'success', summary:'Succès', detail:'Paramètre du repas mis à jour avec succès'});
    },
    error => {
      console.error('Erreur lors de la mise à jour des paramètres du repas', error);
    }
  );
  this.repasSettingsDialog = false;
}


}
