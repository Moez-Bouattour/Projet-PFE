import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RepasService {

  url = environment.baseUrl + "/repas";
  constructor(private httpClient: HttpClient) { }

  modifierParametreRepas(weekendSettings: any): Observable<any> {
    return this.httpClient.post<any>(this.url + '/update', weekendSettings);
  }

  getRepasById(id: any) {
    return this.httpClient.get(this.url + '/getById/' + id);
  }
}
