import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Observable } from 'rxjs';
import { Historique } from '../api/historique';

@Injectable({
  providedIn: 'root'
})
export class HistoriqueService {

  http: any;
  url = environment.baseUrl + "/historiques"
  constructor(private httpClient: HttpClient) { }

  getHistoriques(): Observable<Historique[]> {
    return this.httpClient.get<Historique[]>(this.url + '/getAll');
  }

}
