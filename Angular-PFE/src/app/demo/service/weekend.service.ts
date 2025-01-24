import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class WeekendService {

  url = environment.baseUrl + "/weekend";
  constructor(private httpClient: HttpClient) { }

  modifierParametreWeekend(weekendSettings: any): Observable<any> {
    return this.httpClient.post<any>(this.url + '/update', weekendSettings);
  }

  getWeekendById(id: any) {
    return this.httpClient.get(this.url + '/getById/' + id);
  }
}
