import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SoldeAutorisationService {

  http: any;
  url = environment.baseUrl + "/soldeAutorisation"
  constructor(private httpClient: HttpClient) { }

  getSoldesAutorisation() {
    return this.httpClient.get(this.url + '/getAll');
  }
  addSoldeAutorisation(data:any) {
    return this.httpClient.post(this.url + '/add',data);
  }
  

}
