import { Component, OnInit } from '@angular/core';
import { CongeService } from '../../service/conge.service';
import { AutorisationService } from '../../service/autorisation.service';
import { DatePipe } from '@angular/common';
import { OrdreDeMissionService } from '../../service/ordre-de-mission.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  data: any;
  options: any;
  totalCongesAcceptees: any;
  filteredConges: any[] = [];
  secondData: any;
  secondOptions: any;
  currentDate: any;
  data1: any;
  options1: any;
  lineData: any;
  lineOptions: any;
  nombreOrdresAcceptes: any;
  totalAutorisationsAcceptees: any;
  totalHeuresAutorisationsAcceptees: any;
  dataEmploye: any;
  optionsEmploye: any;
  thirdOptions: any;
  thirdData: any;
  dataVoiture: any;
  optionsVoiture: any;
  congesAvril: any;
  constructor(private congeService: CongeService, private autorisationService: AutorisationService,
    private ordreDeMission: OrdreDeMissionService, private datePipe: DatePipe) { }

  ngOnInit() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.currentDate = this.datePipe.transform(new Date(), 'dd MMMM yyyy, EEE');

    this.congeService.getConges().subscribe((data: any) => {
      const congesData = data.conges;
      const rhAcceptedConges = congesData.filter((conge: any) =>
        conge.lastHistorique.Nom_Niveau === 'RH' &&
        conge.lastHistorique.Nom_etat === 'accepté'
      );
      this.filteredConges = rhAcceptedConges;
      this.totalCongesAcceptees = this.filteredConges.length;
      const congesParMois = rhAcceptedConges.reduce((acc: any, conge: any) => {
        const mois = new Date(conge.date_debut_conge).getMonth();
        const type = conge.type_conges.type_nom_conge;
        if (!acc[type]) {
          acc[type] = Array(4).fill(0);
        }
        acc[type][mois] = (acc[type][mois] || 0) + 1;
        return acc;
      }, {});

      const colorPalette = ['indigo', 'purple', 'teal', 'orange'];
      const textColor = documentStyle.getPropertyValue('--text-color');
      const datasets = Object.keys(congesParMois).map((type: string, index: number) => ({
        label: `${type} (${congesParMois[type].reduce((acc: number, count: number) => acc + count, 0)})`,
        backgroundColor: documentStyle.getPropertyValue(`--${colorPalette[index]}-500`),
        data: congesParMois[type]
      }));

      this.data = { labels: ['Janvier', 'Février', 'Mars', 'Avril'], datasets };

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Mois',
              color: textColor
            }
          },
          y: {
            stacked: true,
            ticks: {
              color: textColorSecondary,
              stepSize: 1
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            },
            title: {
              display: true,
              text: '',
              color: textColor
            }
          }
        },
      };


      const congesParMois1 = congesData.reduce((acc: any, conge: any) => {
        const mois = new Date(conge.date_debut_conge).getMonth();
        acc[mois] = (acc[mois] || 0) + 1;
        return acc;
      }, {});

      rhAcceptedConges.forEach((conge: any) => {
        const mois = new Date(conge.date_debut_conge).getMonth();
        if (!congesParMois[mois]) {
          congesParMois[mois] = 0;
        }
        congesParMois[mois]++;
      });
      const labels = ['Janvier', 'Février', 'Mars', 'Avril'];

      const data1 = labels.map((label, index) => congesParMois[index] || 0);


      this.data1 = {
        labels: labels,
        datasets: [
          {
            label: "Nombre total des congés acceptés",
            backgroundColor: documentStyle.getPropertyValue('--primary-500'),
            borderColor: documentStyle.getPropertyValue('--primary-500'),
            data: data1
          },
        ]
      };

      this.options1 = {
        scales: {
          y: {
            ticks: {
              callback: function (value: number) {
                return Number.isInteger(value) ? value : '';
              }
            },
            title: {
              display: true,
              text: 'Nombre de demandes',
              color: textColor
            }
          },
          x: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Mois',
              color: textColor
            }
          },
        },
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: function (context: { dataset: any; dataIndex: any; }) {
                let label = '';
                const datasetLabel = context.dataset.label || '';
                const value = context.dataset.data[context.dataIndex];
                const days = Math.floor(value);
                label = `${datasetLabel}: ${days} jour${days !== 1 ? 's' : ''}`;
                return label;
              }
            }
          }



        },
      };
      const congesAvril = rhAcceptedConges.filter((conge: any) => {
        const debut = new Date(conge.date_debut_conge);
        const fin = new Date(conge.date_fin_conge);
        const moisDebut = debut.getMonth();
        const moisFin = fin.getMonth();

        return (moisDebut === 0 || moisFin === 0 || (moisDebut < 0 && moisFin > 0));
      });
      const congesParUtilisateur: { [key: string]: { total: number, types: { [key: string]: number } } } = {};
      const allTypesConges: Set<string> = new Set();

      this.congesAvril = congesAvril.length
      congesAvril.forEach((conge: any) => {
        const user = conge.users.name.toString();
        const dateDebut = new Date(conge.date_debut_conge) as any;
        const dateFin = new Date(conge.date_fin_conge) as any;
        const dureeConge = (dateFin - dateDebut) / (1000 * 60 * 60 * 24);


        if (dateDebut.getMonth() === 0 || dateFin.getMonth() === 0 || (dateDebut.getMonth() < 0 && dateFin.getMonth() > 0)) {
          const debutAvril = new Date(dateDebut.getFullYear(), 0,0);
          const finAvril = new Date(dateDebut.getFullYear(), 1, 0);
          const debutConge = dateDebut < debutAvril ? debutAvril : dateDebut;
          const finConge = dateFin > finAvril ? finAvril : dateFin;
          let dureeConge = (finConge - debutConge) / (1000 * 60 * 60 * 24);

          if (dureeConge % 1 !== 0) {
            dureeConge = Math.floor(dureeConge) + 1;
          } else {
            dureeConge = Math.floor(dureeConge);
          }
          const typeConge = conge.type_conges.type_nom_conge.toString();

          if (!congesParUtilisateur[user]) {
            congesParUtilisateur[user] = { total: 0, types: {} };
          }

          allTypesConges.add(typeConge);

          if (!congesParUtilisateur[user].types[typeConge]) {
            congesParUtilisateur[user].types[typeConge] = 0;
          }

          congesParUtilisateur[user].total += dureeConge;
          congesParUtilisateur[user].types[typeConge] += dureeConge;
        }

      });

      const typesConge = Array.from(allTypesConges);
      const labels2 = Object.keys(congesParUtilisateur);
      const colors = typesConge.map((type, index) => colorPalette[index % colorPalette.length]);

      const datasets2 = typesConge.map((type, index) => ({
        label: type,
        backgroundColor: documentStyle.getPropertyValue(`--${colorPalette[index]}-500`),
        borderColor: colors[index % colors.length],
        data: labels2.map((user) => congesParUtilisateur[user].types[type] || 0)
      }));

      this.dataEmploye = {
        labels: labels2,
        datasets: datasets2
      };

      this.optionsEmploye = {
        scales: {
          y: {
            ticks: {
              callback: function (value: number) {
                return Number.isInteger(value) ? value : '';
              }
            },
            title: {
              display: true,
              text: 'Nombre de jours',
              color: textColor
            }
          },
          x: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Utilisateurs',
              color: textColor
            }
          },
        },
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: function (context: { dataset: any; dataIndex: any; }) {
                let label = '';
                const datasetLabel = context.dataset.label || '';
                const value = context.dataset.data[context.dataIndex];
                label = `${datasetLabel}: ${value} jour${value !== 1 ? 's' : ''}`;
                return label;
              }
            }
          }
        },
      };
    });

    this.autorisationService.getAutorisations().subscribe((data: any) => {
      const autorisationsData = data.autorisations;
      const autorisationsAcceptees = autorisationsData.filter((autorisation: any) =>
        autorisation.lastHistorique.Nom_etat === 'accepté' &&
        autorisation.lastHistorique.Nom_Niveau === 'RH'
      );

      const totalHeuresParMois = autorisationsAcceptees.reduce((acc: any, autorisation: any) => {
        const dateSortie = new Date(autorisation.Date_sortie);
        const mois = dateSortie.getMonth();
        const annee = dateSortie.getFullYear();
        const moisAnnee = `${mois}-${annee}`;
        const heuresPrises = autorisation.Duree / 60; // Conversion des minutes en heures
        if (!acc[moisAnnee]) {
            acc[moisAnnee] = 0;
        }
        acc[moisAnnee] += heuresPrises;
        return acc;
    }, {});

      this.totalAutorisationsAcceptees = autorisationsAcceptees.length;
      const heuresParMoisData = ['0-2025', '1-2025', '2-2025', '3-2025'].map((moisAnnee: string) => {
        return totalHeuresParMois[moisAnnee] || 0;
      });

      this.secondData = {
        labels: ['Janvier', 'Février', 'Mars', 'Avril'],
        datasets: [{
          label: 'Total des heures prises',
          backgroundColor: documentStyle.getPropertyValue('--green-600'),
          borderColor: documentStyle.getPropertyValue('--green-600'),
          data: heuresParMoisData
        }]
      };

      this.secondOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: function (context: { label: any; raw: any; }) {
                let label = '';
                const datasetLabel = context.label;
                const value = context.raw;
                const hours = Math.floor(value);
                const minutes = Math.round((value - hours) * 60);

                label = `${datasetLabel}: ${hours}h ${minutes}m`;
                return label;
              }
            }
          }
        },
        indexAxis: 'y',
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: textColorSecondary,
              stepSize: 1
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Heures',
              color: textColor
            }
          },
          y: {
            stacked: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Mois',
              color: textColor
            }
          }
        }
      };
      const autorisationsAccepteesAvril = autorisationsData.filter((autorisation: any) =>
        autorisation.lastHistorique.Nom_etat === 'accepté' &&
        autorisation.lastHistorique.Nom_Niveau === 'RH' &&
        new Date(autorisation.Date_sortie).getMonth() === 0
      );

      const totalHeuresParUtilisateur: { [key: string]: number } = {};

      autorisationsAccepteesAvril.forEach((autorisation: any) => {
        const utilisateur = autorisation.users.name;
        const duree = autorisation.Duree / 60; // Convertir la durée de l'autorisation en heures
        if (!totalHeuresParUtilisateur[utilisateur]) {
            totalHeuresParUtilisateur[utilisateur] = 0;
        }
        totalHeuresParUtilisateur[utilisateur] += duree;
    });


      const totalAutorisationsAccepteesAvril = autorisationsAccepteesAvril.length;

      const labels = Object.keys(totalHeuresParUtilisateur);
      const data3 = Object.values(totalHeuresParUtilisateur);

      this.thirdData = {
        labels: labels,
        datasets: [{
          label: 'Total des heures prises',
          backgroundColor: documentStyle.getPropertyValue('--red-500'),
          borderColor: documentStyle.getPropertyValue('--red-500'),
          data: data3
        }]
      };
      this.thirdOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: function (context: { label: any; raw: any; }) {
                let label = '';
                const datasetLabel = context.label;
                const value = context.raw;
                const hours = Math.floor(value);
                const minutes = Math.round((value - hours) * 60);
                label = `${datasetLabel}: ${hours}h ${minutes}m`;
                return label;
              }
            }
          }
        },
        indexAxis: 'y',
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: textColorSecondary,
              stepSize: 1
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Heures',
              color: textColor
            }
          },
          y: {
            stacked: true,
            ticks: {
              color: textColorSecondary,
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Utilisateurs',
              color: textColor
            }
          }
        }
      };

    });


    this.ordreDeMission.getOrdreDeMissions().subscribe((data: any) => {
      const ordresAcceptes = data.ordres.filter((ordre: any) =>
        ordre.lastHistorique.Nom_etat === 'accepté' &&
        ordre.lastHistorique.Nom_Niveau === 'RH'
      );

      const ordresParMois: { [key: number]: number } = {};
      this.nombreOrdresAcceptes = ordresAcceptes.length;
      ordresAcceptes.forEach((ordre: any) => {
        const dateSortie = new Date(ordre.Date_sortie);
        const mois = dateSortie.getMonth();
        const dureeEnJours = this.calculerDureeEnJours(ordre.Date_sortie, ordre.Date_retour);
        if (!ordresParMois[mois]) {
          ordresParMois[mois] = 0;
        }
        ordresParMois[mois] += dureeEnJours;
      });

      const labels = ['Janvier', 'Février', 'Mars', 'Avril'];

      const data1 = labels.map((label, index) => ordresParMois[index] || 0);

      const datasets = [{
        label: 'Nombre total des jours d\'ordres acceptés',
        data: data1,
        fill: false,
        backgroundColor: documentStyle.getPropertyValue('--pink-500'),
        borderColor: documentStyle.getPropertyValue('--pink-500'),
        tension: 0.4
      }];

      this.lineData = {
        labels: labels,
        datasets: datasets
      };

      this.lineOptions = {
        plugins: {
          legend: {
            labels: {
              fontColor: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: function (context: { dataset: any; dataIndex: any; }) {
                let label = '';
                const datasetLabel = context.dataset.label || '';
                const value = context.dataset.data[context.dataIndex];
                const days = Math.floor(value);
                label = `${datasetLabel}: ${days} jour${days !== 1 ? 's' : ''}`;
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'category',
            labels: labels,
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Mois',
              color: textColor
            }
          },
          y: {
            ticks: {
              color: textColorSecondary,
              stepSize: 1
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Nombre de jours',
              color: textColor
            }
          }
        }
      };

      const ordresAvecDistance = data.ordres.map((ordre: any) => {
        const compteurInitial = parseFloat(ordre.compteur_initiale);
        const compteurFinal = parseFloat(ordre.compteur_finale);
        const distanceParcourue = compteurFinal - compteurInitial;
        return {
          ...ordre,
          distance_parcourue: distanceParcourue
        };
      });


      const ordresAvril = ordresAvecDistance.filter((ordre: any) => {
        const dateSortie = new Date(ordre.Date_sortie);
        return dateSortie.getMonth() === 0;
      });

      const distanceParVoitureAvril: { [key: string]: number } = {};

      ordresAvril.forEach((ordre: any) => {
        const nomVoiture = ordre.voiture.nom_voiture;
        const immatriculeVoiture = ordre.voiture.immatricule;
        const distanceParcourue = ordre.distance_parcourue;
        const cleVoiture = `${nomVoiture} (${immatriculeVoiture})`;

        if (!distanceParVoitureAvril[cleVoiture]) {
          distanceParVoitureAvril[cleVoiture] = 0;
        }
        distanceParVoitureAvril[cleVoiture] += distanceParcourue;
      });

      const labelsVoitures = Object.keys(distanceParVoitureAvril);
      const dataVoitures = labelsVoitures.map((nomVoiture) => distanceParVoitureAvril[nomVoiture]);


      const datasetsVoitures = [{
        label: 'Distance parcourue par voiture',
        data: dataVoitures,
        fill: false,
        backgroundColor: documentStyle.getPropertyValue('--cyan-500'),
        borderColor: documentStyle.getPropertyValue('--cyan-500'),
        tension: 0.4
      }];

      this.dataVoiture = {
        labels: labelsVoitures,
        datasets: datasetsVoitures
      };
      this.optionsVoiture = {
        plugins: {
          legend: {
            labels: {
              fontColor: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: function (context: { dataset: any; dataIndex: any; }) {
                let label = '';
                const datasetLabel = context.dataset.label || '';
                const value = context.dataset.data[context.dataIndex];
                label = `${datasetLabel}: ${value} km`;
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'category',
            labels: labelsVoitures,
            ticks: {
              color: textColor
            },
            title: {
              display: true,
              text: 'Voitures',
              color: textColor
            }
          },
          y: {
            ticks: {
              color: textColor
            },
            title: {
              display: true,
              text: 'Distance (km)',
              color: textColor
            }
          }
        },
      };

    });


  }

  calculerDureeEnJours(dateDebut: string, dateFin: string): number {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const difference = fin.getTime() - debut.getTime();
    const jours = Math.ceil(difference / (1000 * 3600 * 24));
    return jours;
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
  convertMinutesToHours(totalMinutes: number): number {
    return totalMinutes / 60;
  }
}
