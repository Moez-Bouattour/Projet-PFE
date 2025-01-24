import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Conge } from '../api/conge';


@Injectable({
  providedIn: 'root'
})
export class soldeService {

  http: any;
  url = environment.baseUrl + "/soldes"
  constructor(private httpClient: HttpClient) { }

  getSoldes() {
    return this.httpClient.get(this.url + '/getAll');
  }
  addSolde(data: any) {
    return this.httpClient.post(this.url + '/add', data);
  }
  addType(data: any) {
    return this.httpClient.post(this.url + '/addType', data);
  }
  updateAnnee(data: any) {
    return this.httpClient.post(this.url + '/updateAnnee', data);
  }
  updateSolde(id:any,data: any) {
    return this.httpClient.post(this.url + '/update/'+id, data);
  }
}
