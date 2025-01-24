import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { Autorisation } from '../api/autorisation';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AutorisationService {
  http: any;
  url = environment.baseUrl + "/autorisation"
  constructor(private httpClient: HttpClient) { }

  getAutorisations() {
    return this.httpClient.get(this.url + '/getAll');
  }

  getAutorisationById(id: any) {
    return this.httpClient.get(this.url + '/getById/' + id);
  }
  updateAutorisation(id: any, data: Autorisation) {
    return this.httpClient.post(this.url + '/update/' + id, data);
  }

  addAutorisation(data: Autorisation) {
    return this.httpClient.post(this.url + '/add', data);
  }

  updateEtatByAutorisation(id:any,data:any){
    return this.httpClient.post(`${this.url}/${id}/updateEtat`,data);
  }

  getNotifications(userId: number): Observable<any> {
    return this.httpClient.get(`${this.url}/getNotification/${userId}`);
}
markNotificationAsRead(id:any){
    return this.httpClient.post(`${this.url}/markNotificationAsRead/${id}`,{});
  }



}
