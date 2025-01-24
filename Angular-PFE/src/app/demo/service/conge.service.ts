import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Conge } from '../api/conge';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CongeService {

  http: any;
  url = environment.baseUrl + "/congé"
  constructor(private httpClient: HttpClient) { }

  getConges() {
    return this.httpClient.get(this.url + '/getAll');
  }

  getCongeById(id: any) {
    return this.httpClient.get(this.url + '/getById/' + id);
  }

  addConge(data: any) {
    return this.httpClient.post(this.url + '/add', data);
  }

  updateConge(id: any, data: Conge) {
    return this.httpClient.post(this.url + '/update/' + id, data);
  }

  deleteConges(id: any) {
    return this.httpClient.delete(this.url + '/delete/' + id);
  }

  updateEtatByCongé(id:any,data:any){
    return this.httpClient.post(`${this.url}/${id}/updateEtat`,data);
  }

  getNotifications(userId: number): Observable<any> {
    return this.httpClient.get(`${this.url}/getNotification/${userId}`);
}
getNotificationDetailsCombined(userId:number): Observable<any> {
  return this.httpClient.get(`${this.url}/getNotificationDetailsCombined/${userId}`);
}
markNotificationAsRead(id:any){
  return this.httpClient.post(`${this.url}/markNotificationsAsRead/${id}`,{});
}


}

