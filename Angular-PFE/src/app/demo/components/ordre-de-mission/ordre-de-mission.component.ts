import { Component, OnInit } from '@angular/core';
import { OrdreDeMission } from '../../api/ordre-de-mission';
import { OrdreDeMissionService } from '../../service/ordre-de-mission.service';
import { UserService } from '../../service/user.service';
import { MessageService, SelectItem } from 'primeng/api';
import { FormGroup, FormBuilder, Validators, FormControl  } from '@angular/forms';
import { Table } from 'primeng/table';
import { Ville } from '../../api/ville';
import { Voiture } from '../../api/voiture';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../api/user';
import { Etat } from '../../api/etat';
import { Niveau } from '../../api/niveau';
import { formatDate } from '@angular/common';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';
import { PdfService } from '../../service/pdf.service';
import { CongeService } from '../../service/conge.service';
import { RefreshService } from '../../service/refresh.service';
@Component({
  selector: 'app-ordre-de-mission',
  templateUrl: './ordre-de-mission.component.html',
  styleUrls: ['./ordre-de-mission.component.scss']
})
export class OrdreDeMissionComponent implements OnInit {

  ordreDialogAdd: boolean = false;

  ordre: OrdreDeMission = {};

  ordres?: OrdreDeMission[] = [];

  villes: Ville[] = [];

  voitures:Voiture[]=[];

  selectedDrop: SelectItem = { value: '' };

  submitted: boolean = false;

  ordreForm: FormGroup;
  ordreFormEdit: FormGroup;

  users: User[] = [];

  rowsPerPageOptions = [5, 10, 15];

  compteur:string='';

  loggedIn:boolean = false;

  token: any;

  userData: any;

  id: any;

  situation: any;

  sexe: any;
  poste: any;
  selectedNomEtat: string = '';

  isEtatDialogOpened: boolean = false;
  etatDialog: boolean = false;
  ordreDialogEdit:boolean = false;
  etatDialogAdd: boolean = false;
  selectedNomNiveau: string = '';
  id_ordre: any;
  etats: Etat[] = [];

  typesetat: any[] = [];

  niveaux: Niveau[] = [];
  compteurInitial: any;
  compteurFinale:any=0;
  distance:any;
  calendarDialogVisible: boolean = false;
  filteredOrdres: any[] = [];
  joursFeries: any[] = [];
  departement:any;
  Events: any[] = [];
  eventDialogVisible: boolean = false;
  newNotificationCount:any;
  notifications:any;
  selectedOrdre: any;
  voituresDisponibles:any;;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    eventClick: (info) => this.handleEventClick(info),
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    locale: frLocale,
  };

  constructor(private ordreDeMissionService: OrdreDeMissionService,private messageService: MessageService,
    private userService: UserService,private formBuilder: FormBuilder,private pdfService:PdfService,
  private congeService:CongeService,private refreshService:RefreshService) {

  this.ordreForm = this.formBuilder.group({
    id_user: [''],
    Date_sortie: ['', Validators.required],
    Date_retour: ['', Validators.required,],
    id_voiture: ['', Validators.required],
    id_ville: ['', Validators.required],
    id_ville_destination: ['', Validators.required],
    compteur_initiale:[''],
    compteur_finale:[''],
    Nom_Niveau: [''],
    Nom_etat: [''],
  });
  this.ordreFormEdit = this.formBuilder.group({
    id:[''],
    id_user: [''],
    Date_sortie: ['', Validators.required],
    Date_retour: ['', Validators.required,],
    id_voiture: ['', Validators.required],
    id_ville: ['', Validators.required],
    id_ville_destination: ['', Validators.required],
    compteur_finale:[''],
    compteurInitiale:[''],
    Nom_Niveau: [''],
    Nom_etat: [''],
  })

}

ngOnInit() {
  this.loggedIn = this.userService.isLoggedIn();
  if (this.loggedIn) {
    this.token = localStorage.getItem('token');
    this.userData = jwtDecode(this.token);
    this.id = this.userData.id_user;
    this.poste = this.userData.poste;
    this.departement=this.userData.departement;
    this.sexe = this.userData.sexe;
    this.situation = this.userData.situation;
    this.ordreDeMissionService.getOrdreDeMissions().subscribe((data: any) => {
      const ordresData = data.ordres;
      const rhAcceptedOrdres = ordresData .filter((ordre: any) =>
        ordre.lastHistorique &&
        ordre.lastHistorique.Nom_Niveau === 'RH' &&
        ordre.lastHistorique.Nom_etat === 'accepté'
      );
      this.filteredOrdres = rhAcceptedOrdres;

      this.joursFeries = data.jour_feries.map((jourFerie: any) => {
        return {
          date: jourFerie.date,
          evenement: jourFerie.evenement
        };
      });

      this.updateCalendarEvents();
          if (this.userData.role === 'approbateur' && this.userData.poste === 'RH') {
            this.ordres = data.ordres.filter((ordre: any) =>
              ordre.historiques.some((historique: any) => historique.id_user_approbateur === this.id) ||
              ordre.id_user === this.id
            );
            this.voitures = data.voitures;
            this.villes = data.villes;
        } else if (this.userData.role === 'approbateur' && this.userData.poste === 'Chef de projet') {
          this.ordres = data.ordres.filter((ordre: any) =>
            (ordre.historiques.some((historique: any) => historique.id_user_approbateur === this.id && !ordre.historiques.some((historique: any) => historique.note === "Votre demande de déplacement a été mis à jour à accepté" || historique.note === "Votre demande de déplacement a été mis à jour à refusé")
        ) ||
              ordre.id_user === this.id) &&
            ordre.users.departement === this.userData.departement
          );
          this.voitures = data.voitures;
          this.villes = data.villes;
        } else {
          this.ordres = data.ordres.filter((ordre: any) => ordre.id_user === this.id);
          this.voitures = data.voitures;
          this.villes = data.villes;
        }
        console.log('Déplacements de l\'utilisateur :', this.ordres);

    });

  }

}


openNew() {
  this.ordre = {};
  this.ordreDialogAdd = true;
  this.ordreForm.reset();
  this.submitted = false;
  this.ordreForm.patchValue({ id_user: this.id });
  this.ordreForm.patchValue({ Nom_Niveau: this.poste });
  this.ordreForm.patchValue({ Nom_etat: "en attente" });
  this.compteurInitial= '';
  this.compteurFinale= '';
  this.distance= '';
  this.ordreDeMissionService.getOrdreDeMissions().subscribe((data: any) => {
    if (data) {
      if (data.voitures) {
        this.voituresDisponibles = data.voitures;
        this.generateDisplayLabels();
        console.log('Données des voitures récupérées avec succès :', this.voituresDisponibles);
      } else {
        console.error('La liste des voitures est vide.');
      }

      if (data.villes) {
        this.villes = data.villes;
        console.log('Données des villes récupérées avec succès :', this.villes);
      } else {
        console.error('La liste des villes est vide.');
      }
      const idVoitureControl = this.ordreForm.get('id_voiture');
      if (idVoitureControl !== null && idVoitureControl !== undefined) {
        idVoitureControl.valueChanges.subscribe((selectedVoitureId: number) => {
          const selectedVoiture = this.voitures.find(voiture => voiture.id === selectedVoitureId);
          if (selectedVoiture !== null && selectedVoiture !== undefined) {
            this.compteurInitial = selectedVoiture.compteur_initiale;
            this.ordreForm.value.compteur_initiale=this.compteurInitial;
            console.log(this.ordreForm.value.compteur_initiale);

          } else {
            this.compteurFinale = null;
          }
        });
      } else {
        console.error("this.ordreForm.get('id_voiture') est null.");
      }
    } else {
      console.error('La réponse est vide ou incorrecte.');
    }
  }, error => {
    console.error('Une erreur s\'est produite lors de la récupération des données :', error);
  });
}

onDateRetourChange() {
  let dateRetour = new Date(this.ordreForm.value.Date_retour);
  dateRetour = new Date(dateRetour.getTime() + 86400000);
  this.ordreFormEdit.patchValue({
    Date_retour: dateRetour.toISOString().split('T')[0]
  });

  if (this.ordres) {
    const dateRetourFormatted = dateRetour.toISOString().split('T')[0];
    const ordresAcceptes = this.ordres.filter((ordre: any) => {
      const dateOrdreFormatted = new Date(ordre.Date_retour).toISOString().split('T')[0];
      return ordre.lastHistorique?.Nom_etat === 'accepté' &&
             ordre.lastHistorique?.Nom_Niveau === 'RH' &&
             dateOrdreFormatted === dateRetourFormatted;
    });
    const voituresAssociees = ordresAcceptes.map(ordre => ordre.id_voiture);
    this.voituresDisponibles = this.voitures.filter(voiture => !voituresAssociees.includes(voiture.id));
    this.generateDisplayLabels();
    console.log("Voitures correspondantes:", this.voituresDisponibles);

    console.log("Nombre de demandes acceptées pour la date de retour sélectionnée:", ordresAcceptes.length);
  } else {
    console.error("La liste des ordres n'est pas définie ou est null.");
  }
}
generateDisplayLabels() {
  this.voituresDisponibles.forEach((voiture:any) => {
      voiture.displayLabel = `${voiture.nom_voiture} - ${voiture.immatricule}`;
  });
}

change(event: any) {
  const newValue = event.target.value;
  this.ordreForm.value.compteur_finale=event.target.value;
  this.ordreForm.value.compteur_initiale=this.compteurInitial;
  console.log("Nouvelle valeur du compteur finale :", newValue);
  this.distance = this.ordreForm.value.compteur_finale-this.compteurInitial;
  if (this.distance < 0) {
    this.messageService.add({severity:'error', summary:'Erreur', detail:'le compteur finale doit étre supérieur au compteur initiale.'});
  }


}
changeEditDistance(event: any) {
  const newValue = event.target.value;
  this.compteurFinale=event.target.value;
  console.log("Nouvelle valeur du compteur finale :", newValue);
  console.log(this.ordreFormEdit.value.compteurInitiale);

  this.distance = this.compteurFinale-this.ordreFormEdit.value.compteurInitiale

}
imprimerDemande(ordre: any) {
  this.pdfService.generatePdfOrdre(ordre);
  console.log(ordre);
}
  hideDialog() {
    this.ordreDialogAdd = false;
    this.etatDialog = false;
    this.ordreDialogEdit=false;
  }
  validerDates() {
    const dateSortie = this.ordreForm.get('Date_sortie')?.value;
    const dateRetour = this.ordreForm.get('Date_retour')?.value;

    if (dateSortie && dateRetour && dateRetour < dateSortie) {
      this.messageService.add({severity:'error', summary:'Erreur', detail:'La date de retour ne peut pas être antérieure à la date de sortie.'});
    }
  }

  addOrdre() {
    this.submitted = true;
    if (this.ordreForm.valid) {
      const ordreFormValue = this.ordreForm.value;
      ordreFormValue.id_user=this.id;
      this.ordreDeMissionService.addOrdreDeMission(ordreFormValue).subscribe(
        () => {
          this.loadOrdres();
          this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Ordre de mission créé', life: 3000 });
          this.hideDialog();
          this.congeService.getNotificationDetailsCombined(this.id).subscribe((data: any) => {
            const notificationsGroupedByTypeAndDate: any[] = [];
            Object.keys(data).forEach((type: string) => {
              const notifications = data[type];
              if (notifications.length > 0) {
                const notificationsGroupedByDate: any[] = [];
                let dayLabel: string = '';
                notifications.forEach((notification: any) => {
                  if(notification.departement==this.departement || notification.departement==null){
                  const formattedDate = this.formatDate(notification.created_at);
                  dayLabel = this.isTodayOrYesterday(formattedDate);
                  notificationsGroupedByDate.push(notification);
                  }
                });
                notificationsGroupedByTypeAndDate.push({ type, date: dayLabel, notifications: notificationsGroupedByDate });
              }
            });
            this.notifications = this.groupNotificationsByDate(notificationsGroupedByTypeAndDate);
            this.getUnreadNotificationCount();
            this.refreshService.setshare(this.newNotificationCount);

          });
        },
        (error) => {
          console.error('Erreur lors de la création de l\'ordre:', error);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message });
        }
      );
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez remplir les champs.', life: 3000 });
    }
  }
  groupNotificationsByDate(notifications: any[]): any[] {
    const groupedNotifications: any[] = [];
    notifications.forEach(notificationGroup => {
      notificationGroup.notifications.forEach((notification:any) => {
        const dayLabel = this.isTodayOrYesterday(this.formatDate(notification.created_at));
        const existingGroup = groupedNotifications.find(group => group.date === dayLabel && group.type === notificationGroup.type);

        if (existingGroup) {
          existingGroup.notifications.push(notification);
        } else {
          groupedNotifications.push({
            type: notificationGroup.type,
            date: dayLabel,
            notifications: [notification]
          });
        }
      });
    });

    return groupedNotifications;
  }
  formatDate(created_at: any): string {
    const date = created_at.date.split('/').reverse().join('-');
    const time = created_at.time;
    return `${date}T${time}`;
  }

  getUnreadNotificationCount() {
    this.newNotificationCount = 0;
    this.notifications.forEach((notificationGroup:any) => {
      notificationGroup.notifications.forEach((notification:any) => {
        if (!notification.lu) {
          this.newNotificationCount++;
        }
      });
    });
  }
  formatDuree(dureeEnMinutes: number): string {
    if (dureeEnMinutes === 0) {
      return "0 heure 0 minute";
    }

    const heures = Math.floor(dureeEnMinutes / 60);
    const minutes = dureeEnMinutes % 60;

    let formattedDuree = '';
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

    return formattedDuree;
  }

  isJourFerie(date: Date, joursFeries: any[]): boolean {
    const dateStr = date.toISOString().split('T')[0];


    const dateObj = new Date(dateStr);

    dateObj.setDate(dateObj.getDate() + 1);

    const nouvelleDateStr = dateObj.toISOString().split('T')[0];

    return joursFeries.some(jourFerie => jourFerie.date === nouvelleDateStr);
  }

  formatTime(timeString: string): string {
    const [hour, minute] = timeString.split(':');
    return `${hour}:${minute}`;
  }
  isTodayOrYesterday(date: string): string {
    const notificationDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const midnightToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const midnightYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (notificationDate >= midnightToday) {
      return 'Aujourd\'hui';
    } else if (notificationDate >= midnightYesterday) {
      return 'Hier';
    } else {
      return date;
    }
}
  updateOrdre() {
    this.submitted = true;
    const ordreData = this.ordreFormEdit.value;
    ordreData.id_user=this.id;
    this.ordreFormEdit.value.Date_sortie = new Date(new Date(this.ordreFormEdit.value.Date_sortie).getTime() + 86400000).toISOString().split('T')[0];
    this.ordreFormEdit.value.Date_retour = new Date(new Date(this.ordreFormEdit.value.Date_retour).getTime() + 86400000).toISOString().split('T')[0];
    const nomVoiture = this.voitures.find(v => v.nom_voiture === this.ordreFormEdit.value.id_voiture);
    const idVoiture = nomVoiture ? nomVoiture.id : null;
    ordreData.id_voiture=idVoiture;
    const nomVille = this.villes.find(v => v.nom_ville === this.ordreFormEdit.value.id_ville);
    const idVille = nomVille ? nomVille.id : null;
    ordreData.id_ville=idVille;
    const nomVilleDestination = this.villes.find(v => v.nom_ville === this.ordreFormEdit.value.id_ville_destination);
    const idVilleDestination = nomVilleDestination ? nomVilleDestination.id : null;
    ordreData.id_ville_destination=idVilleDestination;
    this.ordreDeMissionService.updateOrdreDeMission(ordreData.id, ordreData).subscribe(

      () => {
        this.loadOrdres();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'ordre actualisé', life: 3000 });
        this.hideDialog();
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
      }
    );
  }
  changeEdit(event: any) {
    const selectedCarName = event.value;
    const selectedCar = this.voitures.find(car => car.nom_voiture === selectedCarName);
    console.log(selectedCar);

  }

  getOrdre(id: any) {
    this.ordreDialogEdit = true;
    this.ordreFormEdit.patchValue({ Nom_Niveau: this.poste });
    this.ordreFormEdit.patchValue({ Nom_etat: "en attente" });
    this.ordreDeMissionService.getOrdreDeMissionById(id).subscribe(
      (data: any) => {
        console.log('ordre récupéré:', data);
       const dateSoriteFormatted = formatDate(data.data.Date_sortie, 'MM/dd/yyyy', 'en-US')
        const dateRetourFormatted = formatDate(data.data.Date_retour, 'MM/dd/yyyy', 'en-US')
        const nomVoiture=data.data.voiture.nom_voiture;
        const nomVille=data.data.ville.nom_ville;
        const nomVilleDestination=data.data.villes_destination.nom_ville;
        const compteurInitiale = data.data.voiture.compteur_initiale;
        this.compteur = compteurInitiale;
        this.distance=data.data.voiture.compteur_finale-compteurInitiale;
        this.ordreFormEdit.patchValue({
          id:data.data.id,
          Date_sortie: dateSoriteFormatted,
          Date_retour: dateRetourFormatted,
          id_voiture: nomVoiture,
          id_ville: nomVille,
          id_ville_destination: nomVilleDestination,
          compteur_finale:data.data.voiture.compteur_finale,
          compteurInitiale:data.data.voiture.compteur_initiale
        });

      },
      (error: any) => {
        console.error('Erreur lors de la récupération du congé:', error);
      }
    );
  }


  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  loadOrdres() {
    this.ordreDeMissionService.getOrdreDeMissions().subscribe((data: any) => {
      if (this.userData.role === 'approbateur' && this.userData.poste === 'RH') {
        this.ordres = data.ordres.filter((ordre: any) =>
          ordre.historiques.some((historique: any) => historique.id_user_approbateur === this.id) ||
          ordre.id_user === this.id
        );
        this.voitures = data.voitures;
        this.villes = data.villes;
    } else if (this.userData.role === 'approbateur' && this.userData.poste === 'Chef de projet') {
      this.ordres = data.ordres.filter((ordre: any) =>
        (ordre.historiques.some((historique: any) => historique.id_user_approbateur === this.id && !ordre.historiques.some((historique: any) => historique.note === "Votre demande de déplacement a été mis à jour à accepté" || historique.note === "Votre demande de déplacement a été mis à jour à refusé")
    ) ||
          ordre.id_user === this.id) &&
        ordre.users.departement === this.userData.departement
      );
    } else {
      this.ordres = data.ordres.filter((ordre: any) => ordre.id_user === this.id);
    }
    console.log('Déplacements de l\'utilisateur :', this.ordres);

});


  }

//etat
openEtatDialog(id: any) {
  this.selectedNomEtat = '';
  this.selectedNomNiveau = '';
  this.ordreDeMissionService.getOrdreDeMissionById(id).subscribe(
    (data: any) => {
      console.log(data);
      const ordre = data.data;
      this.id_ordre = ordre.id;

      const historiqueApprobateur = ordre.historiques.find((historique: any) => historique.id_user_approbateur === this.id);
      if (historiqueApprobateur) {
        const dernierNomNiveau = ordre.dernier_nom_niveau;
        const dernierNomEtat = ordre.dernier_nom_etat;
        if (!(dernierNomNiveau === 'RH' && (dernierNomEtat === 'accepté' || dernierNomEtat === 'refusé'))) {
          this.etatDialog = true;
          this.etats = historiqueApprobateur.Nom_etats.map((nomEtat: any) => ({ id: nomEtat.id, Nom_etat: nomEtat.nom_etat }));
          console.log('États associés à l\'utilisateur approbateur :', this.etats);
          this.niveaux = data.niveaux;
          this.selectedNomEtat = dernierNomEtat;
        } else {
          console.log("L'utilisateur n'est pas l'approbateur de ce congé ou les conditions ne sont pas remplies.");
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'État déja modifié', life: 3000 });
        }
      } else {
        console.log("L'utilisateur n'est pas l'approbateur de ce congé.");
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Tu n'as pas l'approbation", life: 3000 });
      }
    },
    (error: any) => {
      console.error('Erreur lors de la récupération du congé :', error);
    }
  );
  this.isEtatDialogOpened = true;

}


updateEtat() {
const etat = this.etats.find((e: any) => e.Nom_etat === this.selectedNomEtat);
console.log(etat);
const niveau = this.niveaux.find((n: any) => n.Nom_Niveau === this.poste);
console.log(niveau);
const id_etat = etat ? etat.id : null;
console.log(id_etat);
const id_niveau = niveau ? niveau.id : null;
console.log(id_niveau);
console.log(this.id_ordre);
console.log('Valeur sélectionnée :', this.selectedNomEtat);
if (id_etat !== null) {
  this.ordreDeMissionService.updateEtatByOrdre(this.id_ordre, { id_etat, id_niveau }).subscribe(
    (data: any) => {
      console.log(data);
      this.loadOrdres();
      this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'État modifié', life: 3000 });
      this.hideDialog();
      this.congeService.getNotificationDetailsCombined(this.id).subscribe((data: any) => {
        const notificationsGroupedByTypeAndDate: any[] = [];
        Object.keys(data).forEach((type: string) => {
          const notifications = data[type];
          if (notifications.length > 0) {
            const notificationsGroupedByDate: any[] = [];
            let dayLabel: string = '';
            notifications.forEach((notification: any) => {
              if(notification.departement==this.departement || notification.departement==null){
              const formattedDate = this.formatDate(notification.created_at);
              dayLabel = this.isTodayOrYesterday(formattedDate);
              notificationsGroupedByDate.push(notification);
              }
            });
            notificationsGroupedByTypeAndDate.push({ type, date: dayLabel, notifications: notificationsGroupedByDate });
          }
        });
        this.notifications = this.groupNotificationsByDate(notificationsGroupedByTypeAndDate);
        this.getUnreadNotificationCount();
        this.refreshService.setshare(this.newNotificationCount);

      });
    },
    error => {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
      console.error('Erreur lors de la mise à jour de l\'état:', error);
    }
  );
} else {
  console.error("L'ID de l'état n'est pas disponible.");
}
}
//calendrier
isRH(): boolean {
  return this.poste === 'RH';
}

openCalendarDialog() {
  this.calendarDialogVisible = true;
  this.updateCalendarEvents();
  this.ordreDeMissionService.getOrdreDeMissions().subscribe((data: any) => {

    const ordresData = data.ordres;
    const rhAcceptedOrdres = ordresData.filter((ordre: any) =>
      ordre.lastHistorique &&
      ordre.lastHistorique.Nom_Niveau === 'RH' &&
      ordre.lastHistorique.Nom_etat === 'accepté'
    );
    this.filteredOrdres = rhAcceptedOrdres;

    this.joursFeries = data.jour_feries.map((jourFerie: any) => {
      return {
        date: jourFerie.date,
        evenement: jourFerie.evenement
      };
    });
  });
}

closeCalendarDialog() {
  this.calendarDialogVisible = false;
}

onDateClick(res: any) {
  alert('Clicked on date : ' + res.dateStr);
}

updateCalendarEvents() {
  const congéEvents = this.filteredOrdres.map(ordre => ({
      title: `${ordre.users.name} - ${ordre.nom_voiture}`,
      start: ordre.Date_sortie,
      end: ordre.Date_retour,
      ordreInfo: ordre,
  }));

  const joursFeriesEvents = this.joursFeries.map(jour_feries => ({
      title: jour_feries.evenement,
      start: jour_feries.date,
      allDay: true,
      rendering: 'background',
      color: 'red'
  }));

  const events = [...congéEvents, ...joursFeriesEvents];

  this.calendarOptions.events = events;
  console.log(this.calendarOptions.events);
}



handleEventClick(info: any) {
console.log('Clic sur l\'événement :', info);
if (info.event.extendedProps && info.event.extendedProps.ordreInfo) {
    this.selectedOrdre = info.event.extendedProps.ordreInfo;
    console.log(this.selectedOrdre);
    this.eventDialogVisible = true;
}
}

closeeventDialog() {
  this.eventDialogVisible = false;
}

customEventContent(info: any) {
  const eventDate = info.event.start.toISOString().slice(0, 10);
  if (this.joursFeries.includes(eventDate)) {
    info.el.style.backgroundColor = 'red';
  }
}

}
