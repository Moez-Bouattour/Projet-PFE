import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { JourFerie } from '../api/jour-ferie';

@Injectable({
  providedIn: 'root'
})
export class JourFerieService {

  http: any;
  url = environment.baseUrl + "/jourFerie"
  constructor(private httpClient: HttpClient) { }

  getJoursFeries() {
    return this.httpClient.get(this.url + '/getAll');
  }

  getJourFerieById(id: any) {
    return this.httpClient.get(this.url + '/getById/' + id);
  }

  addJourFerie(data: any) {
    return this.httpClient.post(this.url + '/add', data);
  }

  updateJourFerie(id: any, data: JourFerie) {
    return this.httpClient.post(this.url + '/update/' + id, data);
  }

  deleteJourFerie(id: any) {
    return this.httpClient.delete(this.url + '/delete/' + id);
  }
}
