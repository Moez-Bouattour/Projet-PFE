import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor(

  ) { }

  generatePdfConge(conge: any) {
    const doc = new jsPDF();
    const logo = new Image();
    logo.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = logo.width;
      canvas.height = logo.height;
      const context = canvas.getContext('2d');
      context?.drawImage(logo, 0, 0);
      const logoDataUrl = canvas.toDataURL('image/png');
      doc.addImage(logoDataUrl, 'PNG', 10, 10, 18, 18);

      const titre = 'Demande de congé acceptée N°: ' + conge.id;
      const titreFontSize = 16;
      const titreWidth = doc.getStringUnitWidth(titre) * titreFontSize / doc.internal.scaleFactor;
      const titreX = (doc.internal.pageSize.width - titreWidth) / 2;
      doc.setFontSize(titreFontSize);
      doc.text(titre, titreX, 20);

      let infoY = 40;
      const lineHeight = 10;
      infoY += lineHeight;
      doc.setFontSize(12);

      doc.text('Nom utilisateur: ' + conge.users.name, 10, infoY);
      doc.text('Email utilisateur: ' + conge.users.email, 10, infoY + lineHeight);
      doc.text('Téléphone utilisateur: ' + (conge.users.telephone || 'Non spécifié'), 10, infoY + lineHeight * 2);
      doc.text('Type de congé: ' + conge.type_conges.type_nom_conge, 10, infoY + lineHeight * 3);
      doc.text('Date début: ' + conge.date_debut_conge, 10, infoY + lineHeight * 4);
      doc.text('Date reprise: ' + conge.date_fin_conge, 10, infoY + lineHeight * 5);
      doc.text('Durée: ' + conge.duree + ' jours', 10, infoY + lineHeight * 6);
      const espaceY = infoY + lineHeight * 7;
      const lastHistoriqueDate = new Date(conge.lastHistorique.date);
      const acceptationDateString = 'Date acceptation: ' + lastHistoriqueDate.toLocaleDateString();
      const acceptationDateWidth = doc.getStringUnitWidth(acceptationDateString) * 12 / doc.internal.scaleFactor;
      const acceptationDateX = doc.internal.pageSize.width - acceptationDateWidth - 10;
      const acceptationDateY = espaceY + lineHeight;
      doc.text(acceptationDateString, acceptationDateX, acceptationDateY);



      doc.save(`Demande_congé_${conge.id}.pdf`);
    };
    logo.src = 'http://localhost:4200/assets/layout/images/logo-dark.svg';



  }

  generatePdfAutorisation(autorisation: any) {
    const doc = new jsPDF();
    const logo = new Image();
    logo.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = logo.width;
      canvas.height = logo.height;
      const context = canvas.getContext('2d');
      context?.drawImage(logo, 0, 0);
      const logoDataUrl = canvas.toDataURL('image/png');
      doc.addImage(logoDataUrl, 'PNG', 10, 10, 18, 18);
    const titre = "Demande d'autorisation acceptée N°: " + autorisation.id;
    const titreFontSize = 16;
    const titreWidth = doc.getStringUnitWidth(titre) * titreFontSize / doc.internal.scaleFactor;
    const titreX = (doc.internal.pageSize.width - titreWidth) / 2;
    doc.setFontSize(titreFontSize);
    doc.text(titre, titreX, 20);

    let infoY = 40;
    const lineHeight = 10;

    doc.setFontSize(12);

    doc.text('Nom utilisateur: ' + autorisation.users.name, 10, infoY);
    doc.text('Email utilisateur: ' + autorisation.users.email, 10, infoY + lineHeight);
    doc.text('Téléphone utilisateur: ' + (autorisation.users.telephone || 'Non spécifié'), 10, infoY + lineHeight * 2);
    doc.text('Date de sortie: ' + autorisation.Date_sortie, 10, infoY + lineHeight * 3);

    const heureDebut = autorisation.Heure_debut.split(':');
    const heureDebutFormatted = heureDebut[0] + ':' + heureDebut[1];

    const heureFin = autorisation.Heure_fin.split(':');
    const heureFinFormatted = heureFin[0] + ':' + heureFin[1];

    doc.text('Heure début: ' + heureDebutFormatted, 10, infoY + lineHeight * 4);
    doc.text('Heure reprise: ' + heureFinFormatted, 10, infoY + lineHeight * 5);
    doc.text('Raison: ' + autorisation.raison, 10, infoY + lineHeight * 6);
    const dureeHeures = Math.floor(autorisation.Duree / 60);
    const dureeMinutes = autorisation.Duree % 60;

    doc.text('Durée: ' + dureeHeures + ' heures ' + dureeMinutes + ' minutes', 10, infoY + lineHeight * 7);

    const espaceY = infoY + lineHeight * 8;

    const lastHistoriqueDate = new Date(autorisation.lastHistorique.date);
    const acceptationDateString = 'Date acceptation: ' + lastHistoriqueDate.toLocaleDateString();
    const acceptationDateWidth = doc.getStringUnitWidth(acceptationDateString) * 12 / doc.internal.scaleFactor;
    const acceptationDateX = doc.internal.pageSize.width - acceptationDateWidth - 10;
    const acceptationDateY = espaceY + lineHeight;
    doc.text(acceptationDateString, acceptationDateX, acceptationDateY);
    doc.save(`Demande_autorisation_${autorisation.id}.pdf`);
  };
  logo.src = 'http://localhost:4200/assets/layout/images/logo-dark.svg';

  }

  generatePdfOrdre(ordre: any) {
    const doc = new jsPDF();
    const logo = new Image();
    logo.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = logo.width;
      canvas.height = logo.height;
      const context = canvas.getContext('2d');
      context?.drawImage(logo, 0, 0);
      const logoDataUrl = canvas.toDataURL('image/png');
      doc.addImage(logoDataUrl, 'PNG', 10, 10, 18, 18);
    const titre = 'Demande d\'ordre de mission acceptée N°: ' + ordre.id;
    const titreFontSize = 16;
    const titreWidth = doc.getStringUnitWidth(titre) * titreFontSize / doc.internal.scaleFactor;
    const titreX = (doc.internal.pageSize.width - titreWidth) / 2;
    doc.setFontSize(titreFontSize);
    doc.text(titre, titreX, 20);

    let infoY = 40;
    const lineHeight = 10;

    doc.setFontSize(12);

    doc.text('Nom utilisateur : ' + ordre.users.name, 10, infoY);
    doc.text('Email utilisateur : ' + ordre.users.email, 10, infoY + lineHeight);
    doc.text('Téléphone utilisateur : ' + (ordre.users.telephone || 'Non spécifié'), 10, infoY + lineHeight * 2);
    doc.text('Date de sortie : ' + ordre.Date_sortie, 10, infoY + lineHeight * 3);
    doc.text('Date de retour : ' + ordre.Date_retour, 10, infoY + lineHeight * 4);
    doc.text('Ville de départ : ' + ordre.ville.nom_ville, 10, infoY + lineHeight * 5);
    doc.text('Ville de destination : ' + ordre.villes_destination.nom_ville, 10, infoY + lineHeight * 6);
    doc.text('Voiture : ' + ordre.voiture.nom_voiture, 10, infoY + lineHeight * 7);
    doc.text('Immatricule : ' + ordre.voiture.immatricule, 10, infoY + lineHeight * 8);
    doc.text('Compteur initial : ' + ordre.compteur_initiale, 10, infoY + lineHeight * 9);
    doc.text('Compteur final : ' + ordre.compteur_finale, 10, infoY + lineHeight * 10);

    const espaceY = infoY + lineHeight * 12;

    const lastHistoriqueDate = new Date(ordre.lastHistorique.date);
    const acceptationDateString = 'Date acceptation: ' + lastHistoriqueDate.toLocaleDateString();
    const acceptationDateWidth = doc.getStringUnitWidth(acceptationDateString) * 12 / doc.internal.scaleFactor;
    const acceptationDateX = doc.internal.pageSize.width - acceptationDateWidth - 10;
    const acceptationDateY = espaceY + lineHeight;
    doc.text(acceptationDateString, acceptationDateX, acceptationDateY);
    doc.save(`Demande_ordre_mission_${ordre.id}.pdf`);
  };
  logo.src = 'http://localhost:4200/assets/layout/images/logo-dark.svg';

  }

}
