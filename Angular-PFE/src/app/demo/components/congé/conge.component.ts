import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { UserService } from 'src/app/demo/service/user.service';
import { User } from 'src/app/demo/api/user';
import { CongeService } from '../../service/conge.service';
import { Conge } from '../../api/conge';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { TypeConge } from '../../api/type-conge';
import { jwtDecode } from 'jwt-decode';
import { Niveau } from '../../api/niveau';
import { Historique } from '../../api/historique';
import { Etat } from '../../api/etat';
import { soldeService } from '../../service/solde.service';
import { Solde } from '../../api/solde';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';
import { debounceTime, take } from 'rxjs/operators';
import { PdfService } from '../../service/pdf.service';
import { RefreshService } from '../../service/refresh.service';

@Component({
  selector: 'app-conge',
  templateUrl: './conge.component.html',
  styleUrls: ['./conge.component.scss']
})
export class CongeComponent implements OnInit {

  congeDialogAdd: boolean = false;

  conge: Conge = {};

  conges?: Conge[] = [];

  typeConges: TypeConge[] = [];

  submitted: boolean = false;

  congeForm: FormGroup;

  congeFormEdit: FormGroup;

  rowsPerPageOptions = [5, 10, 15];

  loggedIn: boolean = false;

  token: any;

  userData: any;

  id: any;

  poste: any;

  users: User[] = [];

  etatDialog: boolean = false;

  etatDialogAdd: boolean = false;

  historiques: Historique[] = [];

  niveaux: Niveau[] = [];

  soldes: Solde[] = [];

  typesconges: TypeConge[] = [];

  solde: any;

  typesNiveau: any[] = [];

  selectedNomNiveau: string = '';

  Nom_niveau: string = '';

  etats: Etat[] = [];

  typesetat: any[] = [];

  Nom_etat: string = '';

  id_conge: any;

  id_type_document: any;

  selectedNomEtat: string = '';

  situation: any;

  sexe: any;

  selectedFile: any;

  isEtatDialogOpened: boolean = false;

  departement: any;

  calendarDialogVisible: boolean = false;

  filteredConges: any[] = [];

  joursFeries: any[] = [];

  Events: any[] = [];

  selectedCongeDetails: any;

  VoirsoldeDialog: boolean = false;

  data: any;

  options: any;

  totalSolde: any;

  totalSoldeInitiale: any;

  totalSoldeRequis: any;

  anneeSelected: any;

  eventDialogVisible: boolean = false;

  selectedConge: any;

  congeDialogEdit:boolean=false;

  notifications: any[] = [];
  newNotificationCount:any;

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
  errorMessageDisplayed: any;


  constructor(private congeService: CongeService, private messageService: MessageService,
    private userService: UserService, private formBuilder: FormBuilder, private soldeService: soldeService , private pdfService: PdfService,
  private refreshService:RefreshService) {
    this.congeForm = this.formBuilder.group({
      id_user: [''],
      id_type_document: [''],
      date_debut_conge: ['', Validators.required],
      date_fin_conge: ['', Validators.required],
      id_type_conge: ['', Validators.required],
      duree: new FormControl({ value: '', disabled: true }, Validators.required),
      Nom_Niveau: [''],
      Nom_etat: [''],
      justification_medicale: [null],
    });
    this.congeFormEdit = this.formBuilder.group({
      id: ['', Validators.required],
      id_user: [''],
      date_debut_conge: ['', Validators.required],
      date_fin_conge: ['', Validators.required],
      id_type_conge: ['', Validators.required],
      duree: new FormControl({ value: '', disabled: true }, Validators.required),
      Nom_Niveau: [''],
      Nom_etat: [''],
    });

    this.congeForm.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.calculateDuree(this.congeForm);
    });
    this.congeFormEdit.valueChanges.pipe(
      debounceTime(100)
    ).subscribe(() => {
      this.calculateDuree(this.congeFormEdit);
    });

  }
  ngOnInit() {
    this.loggedIn = this.userService.isLoggedIn();
    if (this.loggedIn) {
      this.token = localStorage.getItem('token');
      this.userData = jwtDecode(this.token);
      this.id = this.userData.id_user;
      this.poste = this.userData.poste;
      this.sexe = this.userData.sexe;
      this.situation = this.userData.situation;
      this.congeService.getConges().subscribe((data: any) => {
        this.typeConges = data.type_conges;

        const congesData = data.conges;
        const rhAcceptedConges = congesData.filter((conge: any) =>
          conge.lastHistorique &&
          conge.lastHistorique.Nom_Niveau === 'RH' &&
          conge.lastHistorique.Nom_etat === 'accepté'
      );

        this.filteredConges = rhAcceptedConges;

        this.joursFeries = data.jour_feries.map((jourFerie: any) => {
          return {
            date: jourFerie.date,
            evenement: jourFerie.evenement
          };
        });

        this.updateCalendarEvents();
        if (this.userData.role === 'approbateur' && this.userData.poste === 'RH') {
          this.conges = data.conges.filter((conge: any) =>
            conge.historiques.some((historique: any) => historique.id_user_approbateur === this.id) ||
            conge.id_user === this.id
          );

        } else if (this.userData.role === 'approbateur' && this.userData.poste === 'Chef de projet') {
          this.conges = data.conges.filter((conge: any) =>
            (conge.historiques.some((historique: any) => historique.id_user_approbateur === this.id && !conge.historiques.some((historique: any) => historique.note === "Votre demande de congé a été mis à jour à accepté" || historique.note === "Votre demande de congé a été mis à jour à refusé")
        ) ||
              conge.id_user === this.id) &&
            conge.users.departement === this.userData.departement );

        } else {
          this.conges = data.conges.filter((conge: any) => conge.id_user === this.id);
        }

        console.log('Congés de l\'utilisateur :', this.conges);
      });
    }

  }



  calculateDuree(form: FormGroup) {
    const dateDebut = form.get('date_debut_conge')?.value;
    const dateFin = form.get('date_fin_conge')?.value;
    const typeCongeId = form.get('id_type_conge')?.value;

    if (dateDebut != null && dateFin != null && typeCongeId) {
      const dateDebutParsed = new Date(dateDebut);
      const dateFinParsed = new Date(dateFin);
      const diffInMs = dateFinParsed.getTime() - dateDebutParsed.getTime();
      const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

      const joursFeries = this.joursFeries.map((jourFerie: any) => new Date(jourFerie.date));
      let excludedDays = 0;
      let currentDate = new Date(dateDebut);

      while (currentDate <= dateFinParsed) {
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          excludedDays++;
        }
        if (joursFeries.some((jf: any) => jf.toDateString() === currentDate.toDateString())) {
          excludedDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const diffInDaysWithoutExcluded = diffInDays - excludedDays;
      const typeConge = this.typeConges.find(type => type.id === typeCongeId);

      if (typeConge && typeConge.type_nom_conge === 'annuel') {
        form.patchValue({ duree: diffInDaysWithoutExcluded });
      } else {
        form.patchValue({ duree: diffInDays });
      }

      if (diffInDays < 0 && !this.errorMessageDisplayed) {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'La date de fin doit être ultérieure à la date de début', life: 3000 });
        this.errorMessageDisplayed = true;
      }
    }
  }


  onDateChange() {
    if (this.congeForm) {
      this.congeForm.get('date_debut_conge')?.valueChanges.subscribe(() => {
        this.calculateDuree(this.congeForm);

      });

      this.congeForm.get('date_fin_conge')?.valueChanges.subscribe(() => {
        this.calculateDuree(this.congeForm);
      });
    }
    if (this.congeFormEdit) {
      this.congeFormEdit.get('date_debut_conge')?.valueChanges.subscribe(() => {
        this.calculateDuree(this.congeFormEdit);

      });

      this.congeFormEdit.get('date_fin_conge')?.valueChanges.subscribe(() => {
        this.calculateDuree(this.congeFormEdit);
      });
    }
  }


  openNew() {
    this.conge = {};
    this.congeDialogAdd = true;
    this.congeForm.reset();
    this.submitted = false;
    this.congeForm.patchValue({ id_user: this.id });
    console.log(this.congeForm.value.id_user);
    this.congeForm.patchValue({ Nom_Niveau: this.poste });
    this.congeForm.patchValue({ Nom_etat: "en attente" });

    if (this.sexe === 'homme' && this.situation === 'non marié' || this.situation === 'non mariée' && this.sexe === 'femme') {
      this.typesconges = this.typeConges.filter(typeConge => typeConge.type_nom_conge === 'annuel' || typeConge.type_nom_conge === 'maladie');
    } else if (this.situation === 'marié' && this.sexe === 'homme') {
      this.typesconges = this.typeConges.filter(typeConge => typeConge.type_nom_conge === 'annuel' || typeConge.type_nom_conge === 'maladie' || typeConge.type_nom_conge === 'paternité');
    } else if (this.situation === 'mariée' && this.sexe === 'femme') {
      this.typesconges = this.typeConges.filter(typeConge => typeConge.type_nom_conge === 'annuel' || typeConge.type_nom_conge === 'maladie' || typeConge.type_nom_conge === 'maternité');
      console.log(this.typeConges);
    }
    this.soldeService.getSoldes().subscribe((data: any) => {
      this.soldes = data;
    })


  }
  editJourferie(conge: Conge) {
    this.conge = { ...conge };
    this.congeDialogEdit= true;
  }
  updateConge() {
    if (this.congeFormEdit.valid) {
      const congeFormEdit = this.congeFormEdit.value;
      congeFormEdit.date_debut_conge = new Date(new Date(congeFormEdit.date_debut_conge).getTime() + 86400000).toISOString().split('T')[0];
      congeFormEdit.date_fin_conge = new Date(new Date(congeFormEdit.date_fin_conge).getTime() + 86400000).toISOString().split('T')[0];
      const typeConge = this.typeConges.find(tc => tc.type_nom_conge === this.congeFormEdit.value.id_type_conge);
      const idTypeConge = typeConge ? typeConge.id : null;
      congeFormEdit.id_type_conge=idTypeConge;
      this.congeService.updateConge(congeFormEdit.id, congeFormEdit).subscribe(() => {
        this.loadConges();
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Congé actualisé', life: 3000 });
        this.congeDialogEdit = false;

      }, error => {
        console.log(error);

        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
      });

    }
  }
  getConge(id: any) {
    this.congeDialogEdit= true;

    this.congeFormEdit.patchValue({ Nom_Niveau: this.poste });
    this.congeFormEdit.patchValue({ Nom_etat: "en attente" });

    this.congeService.getCongeById(id).subscribe(
      (data: any) => {
        console.log('Congé récupéré:', data);
        const dateDebutFormatted = formatDate(data.data.date_debut_conge, 'MM/dd/yyyy', 'en-US');
        const dateFinFormatted = formatDate(data.data.date_fin_conge, 'MM/dd/yyyy', 'en-US');
        if (this.sexe === 'homme' && this.situation === 'non marié' || this.situation === 'non mariée' && this.sexe === 'femme') {
          this.typesconges = this.typeConges.filter(typeConge => typeConge.type_nom_conge === 'annuel' || typeConge.type_nom_conge === 'maladie');
          const typeConge = this.typeConges.find(tc => tc.id === data.data.id_type_conge);
          const typeNomConge = typeConge ? typeConge.type_nom_conge : '';

          this.congeFormEdit.patchValue({
            id: data.data.id,
            id_type_conge:typeNomConge,
            date_debut_conge: dateDebutFormatted,
            duree:data.data.duree,
            date_fin_conge: dateFinFormatted
          });
        } else if (this.situation === 'marié' && this.sexe === 'homme') {
          this.typesconges = this.typeConges.filter(typeConge => typeConge.type_nom_conge === 'annuel' || typeConge.type_nom_conge === 'maladie' || typeConge.type_nom_conge === 'paternité');
          const typeConge = this.typeConges.find(tc => tc.id === data.data.id_type_conge);
          const typeNomConge = typeConge ? typeConge.type_nom_conge : '';

          this.congeFormEdit.patchValue({
            id: data.data.id,
            id_type_conge:typeNomConge,
            date_debut_conge: dateDebutFormatted,
            duree:data.data.duree,
            date_fin_conge: dateFinFormatted
          });
        } else if (this.situation === 'mariée' && this.sexe === 'femme') {
          this.typesconges = this.typeConges.filter(typeConge => typeConge.type_nom_conge === 'annuel' || typeConge.type_nom_conge === 'maladie' || typeConge.type_nom_conge === 'maternité');
          console.log(this.typeConges);
          const typeConge = this.typeConges.find(tc => tc.id === data.data.id_type_conge);
          const typeNomConge = typeConge ? typeConge.type_nom_conge : '';

          this.congeFormEdit.patchValue({
            id: data.data.id,
            id_type_conge:typeNomConge,
            date_debut_conge: dateDebutFormatted,
            duree:data.data.duree,
            date_fin_conge: dateFinFormatted
          });
        }

      },
      (error: any) => {
        console.error('Erreur lors de la récupération du congé!', error);
      }
    );
  }


getDuree(conge: any): string {
  return `${conge.duree} ${conge.duree > 1 ? 'jours' : 'jour'}`;
}


get(conge: any): string {
  const typeConge = this.typeConges.find(type => type.id === conge.id_type_conge);
  const date = new Date(conge.date_fin_conge);
  if (typeConge) {
    const solde = conge.users.soldes.find((s: any) => s.annee === String(date.getFullYear()) && s.id_type_conge === typeConge.id);
    const soldeJours = solde ? solde.solde : 0;
    return `${soldeJours} ${soldeJours > 1 ? 'jours' : 'jour'}`;
  }
  return '0 jour';
}



  getSolde() {
    const idUser = this.id;
    const idTypeConge = this.congeForm.get('id_type_conge')?.value;
    const dateDebutConge = this.congeForm.get('date_debut_conge')?.value;

    const dateFinConge = this.congeForm.get('date_fin_conge')?.value;
    const solde = this.soldes.find(s =>
      s.id_user === idUser &&
      s.id_type_conge === idTypeConge &&
      s.annee === new Date(dateFinConge).getFullYear().toString()
    );
    console.log(solde);
    this.solde = solde ? solde.solde : null;
    return solde ? solde.solde : null;
  }

  getSoldeEdit() {
    const idUser = this.id;
    const idTypeConge = this.congeFormEdit.get('id_type_conge')?.value;
    const dateFinConge = this.congeFormEdit.get('date_fin_conge')?.value;

    console.log(idTypeConge);
    const typeConge = this.typeConges.find(tc => tc.type_nom_conge === idTypeConge);
    const id = typeConge ? typeConge.id : null;
    console.log(id);

    this.soldeService.getSoldes().pipe(
      take(1)).subscribe((data: any) => {
      this.soldes = data;

      const solde = this.soldes.find(s =>
        s.id_user === idUser &&
        s.id_type_conge === id &&
        s.annee === new Date(dateFinConge).getFullYear().toString()
      );
      console.log(solde);
      this.solde = solde ? solde.solde : null;
    });
  }

  hideDialog() {
    this.congeDialogAdd = false;
    this.etatDialog = false;
    this.calendarDialogVisible = false;
    this.VoirsoldeDialog = false;
    this.congeDialogEdit= false;
    this.solde = '';

  }
  isMaladieSelected(): boolean {
    const selectedTypeCongeId = this.congeForm.get('id_type_conge')?.value;
    const selectedTypeConge = this.typeConges.find(tc => tc.id === selectedTypeCongeId);
    return selectedTypeConge ? selectedTypeConge.type_nom_conge === 'maladie' : false;
  }
  onFileSelected(event: any) {
    const selectedFiles: File[] = event.files;
    if (selectedFiles && selectedFiles.length > 0) {
      this.selectedFile = selectedFiles[0];
      console.log(this.selectedFile);
    }
  }

  addConge() {
    this.submitted = true;
    if (this.congeForm.valid) {
      const congeFormValue = this.congeForm.value;
      congeFormValue.id_user = this.id;
      congeFormValue.id_type_document = this.id_type_document;
      congeFormValue.date_debut_conge = formatDate(congeFormValue.date_debut_conge, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
      congeFormValue.date_fin_conge = formatDate(congeFormValue.date_fin_conge, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
      const formData = new FormData();
      Object.keys(congeFormValue).forEach(key => {
        formData.append(key, congeFormValue[key]);
      });
      if (this.selectedFile) {
        formData.append('justification_medicale', this.selectedFile, this.selectedFile.name);
      }
      this.congeService.addConge(formData).subscribe(() => {
        this.loadConges();
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
        this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'Congé créé', life: 3000 });
        this.congeDialogAdd = false;
      }, error => {
        console.log(error);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error.error.message, life: 3000 });
      });
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

  getUnreadNotificationCount() {
    this.newNotificationCount = 0;
    this.notifications.forEach(notificationGroup => {
      notificationGroup.notifications.forEach((notification:any) => {
        if (!notification.lu) {
          this.newNotificationCount++;
        }
      });
    });
  }
  loadConges() {

    this.congeService.getConges().subscribe((data: any) => {
      this.typeConges = data.type_conges;
      if (this.userData.role === 'approbateur' && this.userData.poste === 'RH') {
        this.conges = data.conges.filter((conge: any) =>
          conge.historiques.some((historique: any) => historique.id_user_approbateur === this.id) ||
          conge.id_user === this.id
        );

        const congesData = data.conges;
        const rhAcceptedConges = congesData.filter((conge: any) =>
          conge.lastHistorique &&
          conge.lastHistorique.Nom_Niveau === 'RH' &&
          conge.lastHistorique.Nom_etat === 'accepté'
      );
        this.filteredConges = rhAcceptedConges;

        this.joursFeries = data.jour_feries.map((jourFerie: any) => {
          return {
            date: jourFerie.date,
            evenement: jourFerie.evenement
          };
        });
      } else if (this.userData.role === 'approbateur' && this.userData.poste === 'Chef de projet') {
        this.conges = data.conges.filter((conge: any) =>
          (conge.historiques.some((historique: any) => historique.id_user_approbateur === this.id && !conge.historiques.some((historique: any) => historique.note === "Votre demande de congé a été mis à jour à accepté" || historique.note === "Votre demande de congé a été mis à jour à refusé")
      ) ||
            conge.id_user === this.id) &&
          conge.users.departement === this.userData.departement );

      } else {
        this.conges = data.conges.filter((conge: any) => conge.id_user === this.id);
      }

      console.log('Congés de l\'utilisateur :', this.conges);
    });
  }

  imprimerDemande(conge: any) {
    this.pdfService.generatePdfConge(conge);
    console.log(conge);

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
  //etat
  openEtatDialog(id: any) {
    this.selectedNomEtat = '';
    this.selectedNomNiveau = '';
    this.congeService.getCongeById(id).subscribe(
      (data: any) => {
        console.log(data);
        const conge = data.data;
        this.id_conge = conge.id;

        const historiqueApprobateur = conge.historiques.find((historique: any) => historique.id_user_approbateur === this.id);
        if (historiqueApprobateur) {
          const dernierNomNiveau = conge.dernier_nom_niveau;
          const dernierNomEtat = conge.dernier_nom_etat;
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
    console.log(this.id_conge);
    console.log('Valeur sélectionnée :', this.selectedNomEtat);
    if (id_etat !== null) {
      this.congeService.updateEtatByCongé(this.id_conge, { id_etat, id_niveau }).subscribe(
        (data: any) => {
          console.log(data);
          this.loadConges();
          this.updateCalendarEvents();
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
          this.messageService.add({ severity: 'success', summary: 'Réussi', detail: 'État modifié', life: 3000 });
          this.hideDialog();
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

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  //calendrier
  isRH(): boolean {
    return this.poste === 'RH';
  }

  openCalendarDialog() {
    this.calendarDialogVisible = true;
    this.updateCalendarEvents();
    this.congeService.getConges().subscribe((data: any) => {
      this.typeConges = data.type_conges;
      const congesData = data.conges;
      const rhAcceptedConges = congesData.filter((conge: any) =>
        conge.lastHistorique &&
        conge.lastHistorique.Nom_Niveau === 'RH' &&
        conge.lastHistorique.Nom_etat === 'accepté'
    );
      this.filteredConges = rhAcceptedConges;

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
    const congéEvents = this.filteredConges.map(conge => ({
        title: `${conge.users.name} - ${conge.type_conges.type_nom_conge}`,
        start: conge.date_debut_conge,
        end: conge.date_fin_conge,
        congeInfo: conge,
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
  if (info.event.extendedProps && info.event.extendedProps.congeInfo) {
      this.selectedConge = info.event.extendedProps.congeInfo;
      console.log(this.selectedConge);
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
  this.userService.getUsers().subscribe((data: any) => {
    const user = data.users_avec_soldes_par_annee.find((user: any) => user.user.id === this.id);
    console.log(user);
    const currentYear = new Date().getFullYear().toString();
    const soldesForCurrentYear = user.soldes_par_annee.find((solde: any) => solde.annee === currentYear);
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    this.anneeSelected = soldesForCurrentYear.soldes;
    console.log(this.anneeSelected);
    this.totalSolde = this.anneeSelected.reduce((acc: any, user: any) => acc + user.solde, 0);
    this.totalSoldeInitiale = this.anneeSelected.reduce((acc: any, user: any) => acc + user.solde_initiale, 0);
    this.totalSoldeRequis = this.anneeSelected.reduce((acc: any, user: any) => acc + user.conge_pris, 0);
    const TotalSolde = this.totalSolde;

    console.log(this.totalSolde);

    this.data = {
      labels: [
        `Solde restant (${TotalSolde} jours)`,
        `Solde pris (${this.totalSoldeRequis} jours)`,
        `Solde initiale (${this.totalSoldeInitiale} jours)`
      ],
      datasets: [
        {
          data: [TotalSolde, this.totalSoldeRequis, this.totalSoldeInitiale],
          label: 'Nombre de jours',
          backgroundColor: [
            documentStyle.getPropertyValue('--indigo-500'),
            documentStyle.getPropertyValue('--purple-500'),
            documentStyle.getPropertyValue('--teal-500')
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--indigo-400'),
            documentStyle.getPropertyValue('--purple-400'),
            documentStyle.getPropertyValue('--teal-400')
          ]
        }
      ]
    };

    this.options = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor
          }
        }
      }
    };
  });
}


closevoirsoldeDialog() {
  this.VoirsoldeDialog = false;
}

}
