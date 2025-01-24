import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Niveau } from '../api/niveau';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NiveauService {

  http: any;
  url = environment.baseUrl + "/niveau"
  constructor(private httpClient: HttpClient) { }


  getNiveaux(): Observable<Niveau[]> {
    return this.httpClient.get<Niveau[]>(this.url + '/getAll');
  }
  getNiveauById(id: any) {
    return this.httpClient.get(this.url + '/getById/' + id);
  }

  addNiveau(data: Niveau) {
    return this.httpClient.post(this.url + '/add', data);
  }

  updateNiveau(id: any, data: Niveau) {
    return this.httpClient.post(this.url + '/update/' + id, data);
  }

  deleteNiveau(id: any) {
    return this.httpClient.delete(this.url + '/delete/' + id);
  }

  getNiveauxByTypeDocument(id: any) {
    return this.httpClient.get(`${this.url}/${id}/niveaux`);

  }

}
