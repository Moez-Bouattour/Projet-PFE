import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { UserService } from '../../service/user.service';
import { Autorisation } from '../../api/autorisation';
import { AutorisationService } from '../../service/autorisation.service';
import { jwtDecode } from 'jwt-decode';
import { Historique } from '../../api/historique';
import { Niveau } from '../../api/niveau';
import { User } from '../../api/user';
import { Etat } from '../../api/etat';
import { SoldeAutorisationService } from '../../service/solde-autorisation.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';
import { SoldeAutorisation } from '../../api/solde-autorisation';
import { RepasService } from '../../service/repas.service';
import { PdfService } from '../../service/pdf.service';
import { CongeService } from '../../service/conge.service';
import { RefreshService } from '../../service/refresh.service';

@Component({
  selector: 'app-autorisation',
  templateUrl: './autorisation.component.html',
  styleUrls: ['./autorisation.component.scss']
})
export class AutorisationComponent implements OnInit {

  autorisationDialogAdd: boolean = false;

  showTable: boolean = false;

  submitted: boolean = false;

  selectedUser = null;

  autorisationDialogEdit: boolean = false;

  deleteAutorisationDialog: boolean = false;

  autorisation: Autorisation = {};

  autorisations: any;

  autorisationForm: FormGroup;

  loggedIn: boolean = false;

  token: any;

  userData: any;

  id: any;

  etatDialog: boolean = false;

  etatDialogAdd: boolean = false;

  poste: any;

  users: User[] = [];

  niveauDialog: boolean = false;


  historiques: Historique[] = [];

  niveaux: Niveau[] = [];

  solde: any;

  typesNiveau: any[] = [];

  selectedNomNiveau: string = '';

  Nom_niveau: string = '';

  etats: Etat[] = [];

  typesetat: any[] = [];

  Nom_etat: string = '';

  id_autorisation: any;

  id_type_document: any;

  selectedNomEtat: string = '';

  situation: any;

  soldesAutorisation: any[] = []

  sexe: any;

  selectedFile: any;

  isEtatDialogOpened: boolean = false;

  departement: any;

  calendarDialogVisible: boolean = false;

  filteredAutorisations: any[] = [];

  joursFeries: any[] = [];

  Events: any[] = [];

  soldes: SoldeAutorisation[] = [];

  VoirsoldeDialog: boolean = false;

  autorisationFormEdit:FormGroup

  data: any;

  newNotificationCount:any;

  options: any;

  eventDialogVisible: boolean = false;

  selectedAutorisation: any;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
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
    dateClick: this.handleDateClick.bind(this)
  };
  mois: any;
  notifications:any;

  handleDateClick(arg: DateClickArg) {
    console.log('Date cliquée :', arg.dateStr);
    this.calendarOptions.initialView = 'timeGridDay';
    this.calendarOptions.initialDate = arg.date;
  }


  constructor(private userService: UserService, private autorisationService: AutorisationService,
    private messageService: MessageService, private formBuilder: FormBuilder,
    private repasService:RepasService, private soldeAutorisationService: SoldeAutorisationService,
    private congeService:CongeService,private refreshService:RefreshService,
    private pdfService:PdfService) {
    this.autorisationForm = this.formBuilder.group({
      id_user: [''],
      Date_sortie: ['', Validators.required],
      Heure_debut: ['', Validators.required],
      Heure_fin: ['', Validators.required],
      Duree: [0],
      id_type_document: [''],
      Nom_Niveau: [''],
      Nom_etat: [''],
      raison: ['', Validators.required]
    });
    this.autorisationFormEdit = this.formBuilder.group({
      id: ['', Validators.required],
      id_user: [''],
      Date_sortie: ['', Validators.required],
      Heure_debut: ['', Validators.required],
      Heure_fin: ['', Validators.required],
      Duree: [0],
      raison:[''],
      Nom_Niveau:[''],
      duration:[''],
      Nom_etat:['']
    });
  }
  ngOnInit(): void {
    this.loggedIn = this.userService.isLoggedIn();
    if (this.loggedIn) {
      this.token = localStorage.getItem('token');
      this.userData = jwtDecode(this.token);
      this.id = this.userData.id_user;
      this.poste = this.userData.poste;
      this.sexe = this.userData.sexe;
      this.situation = this.userData.situation;
      this.autorisationService.getAutorisations().subscribe((data: any) => {
        const autorisationsData = data.autorisations;
        const rhAcceptedAutorisations = autorisationsData.filter((autorisation: any) =>
          autorisation.lastHistorique &&
          autorisation.lastHistorique.Nom_Niveau === 'RH' &&
          autorisation.lastHistorique.Nom_etat === 'accepté'
        );
        this.filteredAutorisations = rhAcceptedAutorisations;

        this.joursFeries = data.jour_feries.map((jourFerie: any) => {
          return {
            date: jourFerie.date,
            evenement: jourFerie.evenement
          };
        });

        if (this.userData.role === 'approbateur' && this.userData.poste === 'RH') {
          this.autorisations = data.autorisations.filter((autorisation: any) =>
            autorisation.historiques.some((historique: any) => historique.id_user_approbateur === this.id) ||
            autorisation.id_user === this.id
          );
          const today = new Date();
      const mois= new Date().getMonth() + 1;
      this.soldeAutorisationService.getSoldesAutorisation().subscribe((data: any) => {
        this.soldesAutorisation = data;
        const solde = this.soldesAutorisation.find(s =>
          s.id_user === this.id &&
          s.mois === mois
        );


            console.log(solde);
            this.solde = solde.solde;
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--text-color');
            console.log(this.formatDuree(solde.solde.toString()));
            const soldeHours = Math.floor(solde.solde / 60);
            const soldeMinutes = solde.solde % 60;
            const soldeFormatted = `${soldeHours}h ${soldeMinutes}m`;

            const autorisationPrisHours = Math.floor(solde.autorisation_pris / 60);
            const autorisationPrisMinutes = solde.autorisation_pris % 60;
            const autorisationPrisFormatted = `${autorisationPrisHours}h ${autorisationPrisMinutes}m`;


            this.data = {
              labels: [`Solde restant (${soldeFormatted} )`, `Solde prise (${autorisationPrisFormatted} )`],
              datasets: [
                {
                  data: [solde.solde, solde.autorisation_pris],
                  backgroundColor: [documentStyle.getPropertyValue('--blue-500'), documentStyle.getPropertyValue('--yellow-500')],
                  hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400'), documentStyle.getPropertyValue('--yellow-400')]
                }
              ]
            };

            this.options = {
              plugins: {
                legend: {
                  display: true
                },
                tooltip: {
                  callbacks: {
                    label: function(context: { label: any; raw: any; }) {
                      let label = '';
                      const datasetLabel = context.label;
                      const value = context.raw;
                      const hours = Math.floor(value / 60);
                      const minutes = value % 60;
                      label = `${datasetLabel}: ${hours}h ${minutes}m`;
                      return label;
                    }
                  }
                }
              },
              title: {
                display: true,
                text: 'Test'
              }
            };


          })

        } else if (this.userData.role === 'approbateur' && this.userData.poste === 'Chef de projet') {
          this.autorisations = data.autorisations.filter((autorisation: any) =>
            (autorisation.historiques.some((historique: any) => historique.id_user_approbateur === this.id && !autorisation.historiques.some((historique: any) => historique.note === "Votre demande de sortie a été mis à jour à accepté" || historique.note === "Votre demande de sortie a été mis à jour à refusé")
        ) ||
              autorisation.id_user === this.id) &&
            autorisation.users.departement === this.userData.departement
          );

          const today = new Date();
      const mois =new Date().getMonth() + 1;
      this.soldeAutorisationService.getSoldesAutorisation().subscribe((data: any) => {
        this.soldesAutorisation = data;
        const solde = this.soldesAutorisation.find(s =>
          s.id_user === this.id &&
          s.mois === mois
        );
            console.log(solde);
            this.solde = solde.solde;
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--text-color');
            console.log(this.formatDuree(solde.solde.toString()));
            const soldeHours = Math.floor(solde.solde / 60);
            const soldeMinutes = solde.solde % 60;
            const soldeFormatted = `${soldeHours}h ${soldeMinutes}m`;

            const autorisationPrisHours = Math.floor(solde.autorisation_pris / 60);
            const autorisationPrisMinutes = solde.autorisation_pris % 60;
            const autorisationPrisFormatted = `${autorisationPrisHours}h ${autorisationPrisMinutes}m`;


            this.data = {
              labels: [`Solde restant (${soldeFormatted} )`, `Solde prise (${autorisationPrisFormatted} )`],
              datasets: [
                {
                  data: [solde.solde, solde.autorisation_pris],
                  backgroundColor: [documentStyle.getPropertyValue('--blue-500'), documentStyle.getPropertyValue('--yellow-500')],
                  hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400'), documentStyle.getPropertyValue('--yellow-400')]
                }
              ]
            };

            this.options = {
              plugins: {
                legend: {
                  display: true
                },
                tooltip: {
                  callbacks: {
                    label: function(context: { label: any; raw: any; }) {
                      let label = '';
                      const datasetLabel = context.label;
                      const value = context.raw;
                      const hours = Math.floor(value / 60);
                      const minutes = value % 60;
                      label = `${datasetLabel}: ${hours}h ${minutes}m`;
                      return label;
                    }
                  }
                }
              },
              title: {
                display: true,
                text: 'Test'
              }
            };


          })
        } else {
          this.autorisations = data.autorisations.filter((autorisation: any) => autorisation.id_user === this.id);
             const mois =new Date().getMonth() + 1;
             this.soldeAutorisationService.getSoldesAutorisation().subscribe((data: any) => {
               this.soldesAutorisation = data;
               const solde = this.soldesAutorisation.find(s =>
                 s.id_user === this.id &&
                 s.mois === mois
               );
            console.log(solde);
            this.solde = solde.solde;
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--text-color');
            console.log(this.formatDuree(solde.solde.toString()));
            const soldeHours = Math.floor(solde.solde / 60);
            const soldeMinutes = solde.solde % 60;
            const soldeFormatted = `${soldeHours}h ${soldeMinutes}m`;


            const autorisationPrisHours = Math.floor(solde.autorisation_pris / 60);
            const autorisationPrisMinutes = solde.autorisation_pris % 60;
            const autorisationPrisFormatted = `${autorisationPrisHours}h ${autorisationPrisMinutes}m`;


            this.data = {
              labels: ['Solde restant', 'Solde prise'],
              datasets: [
                {
                  data: [solde.solde, solde.autorisation_pris],
                  backgroundColor: [documentStyle.getPropertyValue('--blue-500'), documentStyle.getPropertyValue('--yellow-500')],
                  hoverBackgroundColor: [documentStyle.getPropertyValue('--blue-400'), documentStyle.getPropertyValue('--yellow-400')]
                }
              ]
            };

            this.options = {
              plugins: {
                legend: {
                  display: true
                },
                tooltip: {
                  callbacks: {
                    label: function(context: { label: any; raw: any; }) {
                      let label = '';
                      const datasetLabel = context.label;
                      const value = context.raw;
                      const hours = Math.floor(value / 60);
                      const minutes = value % 60;
                      label = `${datasetLabel}: ${hours}h ${minutes}m`;
                      return label;
                    }
                  }
                }
              },
              title: {
                display: true,
                text: 'Test'
              }
            };


          })
        }
        const today = new Date();
        const month = today.getMonth() + 1;
        this.mois = today.toLocaleString('fr-FR', { month: 'long' });
        console.log('Autorisations de l\'utilisateur :', this.autorisations);
      });
    }

  }
  calculerDureeEdit() {
    const heureDebut = this.autorisationFormEdit.value.Heure_debut;
    const heureFin = this.autorisationFormEdit.value.Heure_fin;

    if (heureDebut && heureFin) {
      const startTime = heureDebut.split(':');
      const endTime = heureFin.split(':');

      const startHour = parseInt(startTime[0], 10);
      const startMinute = parseInt(startTime[1], 10);
      const endHour = parseInt(endTime[0], 10);
      const endMinute = parseInt(endTime[1], 10);

      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      let differenceInMinutes = endTotalMinutes - startTotalMinutes;

      if (endTotalMinutes < startTotalMinutes) {
        differenceInMinutes = -(startTotalMinutes - endTotalMinutes);
      }

      const hours = Math.floor(Math.abs(differenceInMinutes) / 60);
      const minutes = Math.abs(differenceInMinutes) % 60;

      let durationString = '';
      if (differenceInMinutes < 0) {
        durationString += '-';
      }

      if (hours > 0) {
        durationString += hours + ' heure';
        if (hours > 1) {
          durationString += 's';
        }
      }
      if (minutes > 0) {
        if (hours > 0) {
          durationString += ' ';
        }
        durationString += minutes + ' minute';
        if (minutes > 1) {
          durationString += 's';
        }
      }
      if (differenceInMinutes < 0) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'L\'heure de fin doit être ultérieure à l\'heure de reprise', life: 3000 });
      }
      this.autorisationFormEdit.patchValue({
        Duree: differenceInMinutes
      });
      this.autorisationFormEdit.patchValue({
        duration: durationString.trim()
      });
      console.log(this.autorisationFormEdit.value.Duree);

    }
  }
  getAutorisation(id: any) {
    this.autorisationDialogEdit = true;
    this.autorisationFormEdit.patchValue({ Nom_Niveau: this.poste });
    this.autorisationFormEdit.patchValue({ Nom_etat: "en attente" });
    this.autorisationService.getAutorisationById(id).subscribe(
      (data: any) => {
        console.log('autorisation récupéré:', data);
        const dateSortieFormatted = formatDate(data.data.Date_sortie, 'MM/dd/yyyy', 'en-US')

        const duration=this.formatDuree(data.data.Duree);
        this.autorisationFormEdit.patchValue({
          id: data.data.id,
          Date_sortie: dateSortieFormatted,
          Heure_debut: data.data.Heure_debut,
          Heure_fin: data.data.Heure_fin,
          Duree: data.data.Duree,
          duration:duration,
          raison:data.data.raison,
        });
      },
      (error: any) => {
        console.error('Erreur lors de la récupération du document de type:', error);
      }
    );
  }
  formatTimeAutorisation(time: string): string {
    const [hours, minutes] = time.split(':');
    const formattedHours = hours.padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
  }

  updateAutorisation() {
    this.autorisationDialogEdit = true

    if (this.autorisationFormEdit.valid) {
      const autorisationFormEdit = this.autorisationFormEdit.value;
      const heureDebutValue = autorisationFormEdit.Heure_debut;
      const heureFinValue = autorisationFormEdit.Heure_fin;
      autorisationFormEdit.id_user = this.id;
      autorisationFormEdit.Heure_debut = this.formatTime(heureDebutValue);
      autorisationFormEdit.Heure_fin = this.formatTime(heureFinValue);
      autorisationFormEdit.Date_sortie = new Date(new Date(autorisationFormEdit.Date_sortie).getTime() + 86400000).toISOString().split('T')[0];
      this.autorisationService.updateAutorisation(autorisationFormEdit.id, autorisationFormEdit).subscribe(() => {
        this.loadAutorisations();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'autorisation actualisé', life: 3000 });
        this.autorisationDialogEdit = false;

      }, (error:any) => {
        console.log(error);

        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
      });

    }
  }

  formatDureeSolde(dureeEnMinutes: number): { heures: number, minutes: number } {
    const heures = Math.floor(dureeEnMinutes / 60);
    const minutes = dureeEnMinutes % 60;
    return { heures, minutes };
  }

  get(autorisation: any): number {
    const dateSortie = new Date(autorisation.Date_sortie);
    const mois = dateSortie.getMonth() + 1;

    const solde = autorisation.users.solde_autorisations.find((s: any) => s.annee === String(dateSortie.getFullYear()) && s.mois === mois);
    return solde ? solde.solde : 0;
}


  openNew() {
    if (this.solde > 0) {
      this.autorisation = {};
      this.autorisationForm.reset();
      this.autorisationDialogAdd = true;
      this.submitted = false;
      this.autorisationForm.patchValue({ id_user: this.id });
      this.autorisationForm.patchValue({ Nom_Niveau: this.poste });
      this.autorisationForm.patchValue({ Nom_etat: "en attente" });
      const mois = new Date().getMonth() + 1;
      this.soldeAutorisationService.getSoldesAutorisation().subscribe((data: any) => {
        this.soldesAutorisation = data;
        const solde = this.soldesAutorisation.find(s =>
          s.id_user === this.id &&
          s.mois === mois
        );
        console.log(solde);
        this.solde = solde.solde;
      });
    } else {
      this.autorisationDialogAdd = false;
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Vous avez dépassé votre solde d'autorisation", life: 3000 });
    }
}




  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  hideDialog() {
    this.submitted = false;
    this.autorisationDialogAdd = false;
    this.etatDialog = false;
    this.autorisationDialogEdit=false ;
  }

  addAutorisation() {
    this.submitted = true;
    if (this.autorisationForm.valid) {
      const autorisationForm = this.autorisationForm.value;
      autorisationForm.id_user = this.id;
      autorisationForm.id_type_document = this.id_type_document;
      autorisationForm.Date_sortie = formatDate(autorisationForm.Date_sortie, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
      const dateChoisie: Date = new Date(autorisationForm.Date_sortie);
      console.log(dateChoisie);

      const estJourFerie = this.isJourFerie(dateChoisie, this.joursFeries);

      if (estJourFerie) {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La date choisie correspond à un jour férié.', life: 3000 });
      } else {
        this.autorisationService.addAutorisation(autorisationForm).subscribe(() => {
          this.loadAutorisations();
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
          this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Autorisation créée', life: 3000 });
          this.autorisationDialogAdd = false;
        }, error => {
          console.log(error);

          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
        });
      }
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez remplir tous les champs', life: 3000 });

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


  imprimerDemande(autorisation: any) {
    this.pdfService.generatePdfAutorisation(autorisation);
    console.log(autorisation);
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

  loadAutorisations() {
    this.autorisationService.getAutorisations().subscribe((data: any) => {
      const autorisationsData = data.autorisations;
      const rhAcceptedAutorisations = autorisationsData.filter((autorisation: any) =>
        autorisation.lastHistorique &&
        autorisation.lastHistorique.Nom_Niveau === 'RH' &&
        autorisation.lastHistorique.Nom_etat === 'accepté'
      );
      this.filteredAutorisations = rhAcceptedAutorisations;

      if (this.userData.role === 'approbateur' && this.userData.poste === 'RH') {
        this.autorisations = data.autorisations.filter((autorisation: any) =>
          autorisation.historiques.some((historique: any) => historique.id_user_approbateur === this.id) ||
          autorisation.id_user === this.id
        );

      } else if (this.userData.role === 'approbateur' && this.userData.poste === 'Chef de projet') {
          this.autorisations = data.autorisations.filter((autorisation: any) =>
            (autorisation.historiques.some((historique: any) => historique.id_user_approbateur === this.id && !autorisation.historiques.some((historique: any) => historique.note === "Votre demande de sortie a été mis à jour à accepté" || historique.note === "Votre demande de sortie a été mis à jour à refusé")
        ) ||
              autorisation.id_user === this.id) &&
            autorisation.users.departement === this.userData.departement

        );

      } else {
        this.autorisations = data.autorisations.filter((autorisation: any) => autorisation.id_user === this.id);
      }

      console.log('Autorisations de l\'utilisateur :', this.autorisations);
    });

  }

  calculerDuree() {
    const heureDebut = this.autorisationForm.value.Heure_debut;
    const heureFin = this.autorisationForm.value.Heure_fin;

    if (heureDebut && heureFin) {
      const startTime = heureDebut.split(':');
      const endTime = heureFin.split(':');

      const startHour = parseInt(startTime[0], 10);
      const startMinute = parseInt(startTime[1], 10);
      const endHour = parseInt(endTime[0], 10);
      const endMinute = parseInt(endTime[1], 10);

      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      let differenceInMinutes = endTotalMinutes - startTotalMinutes;

      const repasId = 1;
      this.repasService.getRepasById(repasId).subscribe((repas: any) => {


        const heureDebutRepas = repas.data.heure_debut;
        const heureFinRepas = repas.data.heure_fin;

        const heureDebutRepasMinutes = this.getMinutesFromTime(heureDebutRepas);
        const heureFinRepasMinutes = this.getMinutesFromTime(heureFinRepas);

        if (startTotalMinutes <= heureDebutRepasMinutes && endTotalMinutes >= heureFinRepasMinutes) {
          differenceInMinutes -= heureFinRepasMinutes - heureDebutRepasMinutes;
        } else if (startTotalMinutes >= heureDebutRepasMinutes && endTotalMinutes <= heureFinRepasMinutes) {
          differenceInMinutes = 0;
        } else if (startTotalMinutes < heureDebutRepasMinutes && endTotalMinutes > heureFinRepasMinutes) {
          differenceInMinutes -= heureFinRepasMinutes - heureDebutRepasMinutes;
        }

        const hours = Math.floor(Math.abs(differenceInMinutes) / 60);
        const minutes = Math.abs(differenceInMinutes) % 60;

        let durationString = '';
        if (differenceInMinutes < 0) {
          durationString += '-';
        }

        if (hours > 0) {
          durationString += hours + ' heure';
          if (hours > 1) {
            durationString += 's';
          }
        }
        if (minutes > 0) {
          if (hours > 0) {
            durationString += ' ';
          }
          durationString += minutes + ' minute';
          if (minutes > 1) {
            durationString += 's';
          }
        }

        if (differenceInMinutes < 0) {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'L\'heure de fin doit être ultérieure à l\'heure de reprise (' + durationString.trim() + ')', life: 3000 });
        }

        this.autorisationForm.patchValue({
          Duree: durationString.trim()
        });
      });
    }
  }

  getMinutesFromTime(timeString: string): number {
    if (!timeString || timeString.trim() === '') {
      return 0;
    }
    const timeArray = timeString.split(':');
    const hours = parseInt(timeArray[0], 10);
    const minutes = parseInt(timeArray[1], 10);
    return hours * 60 + minutes;
  }


  //etat
  openEtatDialog(id: any) {
    this.selectedNomEtat = '';
    this.selectedNomNiveau = '';
    this.autorisationService.getAutorisationById(id).subscribe(
      (data: any) => {
        console.log(data);
        this.id_autorisation = id;
        console.log(this.id_autorisation);

        const autorisation = data.data;
        if (autorisation && autorisation.historiques) {
          const historiqueApprobateur = autorisation.historiques.find((historique: any) => historique.id_user_approbateur === this.id);
          if (historiqueApprobateur) {
            const dernierNomNiveau = autorisation.dernier_nom_niveau;
            const dernierNomEtat = autorisation.dernier_nom_etat;
            if (!(dernierNomNiveau === 'RH' && (dernierNomEtat === 'accepté' || dernierNomEtat === 'refusé'))) {
              this.etatDialog = true;
              this.etats = historiqueApprobateur.Nom_etats.map((nomEtat: any) => ({ id: nomEtat.id, Nom_etat: nomEtat.nom_etat }));
              console.log('États associés à l\'utilisateur approbateur :', this.etats);
              this.niveaux = data.niveaux;
              this.selectedNomEtat = dernierNomEtat;
            } else {
              console.log("L'utilisateur n'est pas l'approbateur de ce autorisation ou les conditions ne sont pas remplies.");
              this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'État déjà modifié', life: 3000 });
            }
          } else {
            console.log("L'utilisateur n'est pas l'approbateur de ce autorisation.");
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Tu n'as pas l'approbation", life: 3000 });
          }
        } else {
          console.log("No autorisation or historiques available.");
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Aucune autorisation ou historiques disponibles", life: 3000 });
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération du autorisation.', error);
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
    console.log(this.id_autorisation);
    console.log('Valeur sélectionnée :', this.selectedNomEtat);
    const mois=new Date().getMonth() + 1;
    if (id_etat !== null) {
      this.autorisationService.updateEtatByAutorisation(this.id_autorisation, { id_etat, id_niveau, mois }).subscribe(
        (data: any) => {
          console.log(data);
          this.loadAutorisations();
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
    this.autorisationService.getAutorisations().subscribe((data: any) => {

      const autorisationsData = data.autorisations;
      const rhAcceptedAutorisations = autorisationsData.filter((autorisation: any) =>
        autorisation.lastHistorique &&
        autorisation.lastHistorique.Nom_Niveau === 'RH' &&
        autorisation.lastHistorique.Nom_etat === 'accepté'
      );
      this.filteredAutorisations = rhAcceptedAutorisations;

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
    const autorisationsRHAcceptees = this.autorisations.filter((autorisation: any) =>
      autorisation.lastHistorique?.Nom_Niveau === 'RH' &&
      autorisation.lastHistorique?.Nom_etat === 'accepté'
    );

    const autorisationsEvents = autorisationsRHAcceptees.map((autorisation: any) => {
      const { users, Date_sortie, Heure_debut, Heure_fin } = autorisation;
      const startTime = new Date(`${Date_sortie}T${Heure_debut}`);
      const endTime = new Date(`${Date_sortie}T${Heure_fin}`);
      return {
        title: `Sortie ${users.name}`,
        start: startTime,
        end: endTime,
        allDay: false,
        color: 'green',
        autorisationInfo: autorisation,
      };
    });

    const joursFeriesEvents = this.joursFeries.map((jourFerie: any) => {
      return {
        title: jourFerie.evenement,
        start: new Date(jourFerie.date),
        allDay: true,
        rendering: 'background',
        color: 'red'
      };
    });

    const events = [...autorisationsEvents, ...joursFeriesEvents];

    this.calendarOptions.events = events;
}


  handleEventClick(info: any) {
    console.log('Clic sur l\'événement :', info);
    if (info.event.extendedProps && info.event.extendedProps.autorisationInfo) {
        this.selectedAutorisation = info.event.extendedProps.autorisationInfo;
        console.log(this.selectedAutorisation);
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

//dashbord solde
openSoldeDialog() {
  this.VoirsoldeDialog = true;

}

closevoirsoldeDialog() {
  this.VoirsoldeDialog = false;
}

}
