import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Ville } from '../api/ville';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VilleService {

  url = environment.baseUrl + "/villes";

  constructor(private httpClient: HttpClient) { }

  getVilles(): Observable<Ville[]> {
    return this.httpClient.get<Ville[]>(this.url + '/getAll');
  }
  getVilleById(id: any) {
    return this.httpClient.get(this.url + '/getById/' + id);
  }

  addVille(data: Ville) {
    return this.httpClient.post(this.url + '/add', data);
  }

  updateVille(id: any, data: Ville) {
    return this.httpClient.post(this.url + '/update/' + id, data);
  }

  deleteVille(id: any) {
    return this.httpClient.delete(this.url + '/delete/' + id);
  }
}
