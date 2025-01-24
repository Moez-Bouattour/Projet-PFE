import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { Voiture } from '../api/voiture';

@Injectable({
  providedIn: 'root'
})
export class VoitureService {


  url = environment.baseUrl + "/voitures";

  constructor(private httpClient: HttpClient) { }

  getVoitures(): Observable<Voiture[]> {
    return this.httpClient.get<Voiture[]>(this.url + '/getAll');
  }
  getVoitureById(id: any) {
    return this.httpClient.get(this.url + '/getById/' + id);
  }

  addVoiture(data: Voiture) {
    return this.httpClient.post(this.url + '/add', data);
  }

  updateVoiture(id: any, data: Voiture) {
    return this.httpClient.post(this.url + '/update/' + id, data);
  }

  deleteVoiture(id: any) {
    return this.httpClient.delete(this.url + '/delete/' + id);
  }
}
