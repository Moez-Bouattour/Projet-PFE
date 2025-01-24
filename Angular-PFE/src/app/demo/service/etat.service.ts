import { Injectable } from '@angular/core';
import { Etat } from '../api/etat';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class EtatService {

  http: any;
  url = environment.baseUrl + "/etat"
  constructor(private httpClient: HttpClient) { }

  getEtats() {
    return this.httpClient.get(this.url + '/getAll');
  }
  getEtatById(id: any) {
    return this.httpClient.get(this.url + '/getById/' + id);
  }

  addEtat(data: Etat) {
    return this.httpClient.post(this.url + '/add', data);
  }

  updateEtat(id: any, data: Etat) {
    return this.httpClient.post(this.url + '/update/' + id, data);
  }

  deleteEtat(id: any) {
    return this.httpClient.delete(this.url + '/delete/' + id);
  }

  getEtatsByNiveau(id: any) {
    return this.httpClient.get(`${this.url}/${id}/etats`);
  }

}
