import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { OrdreDeMission } from '../api/ordre-de-mission';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdreDeMissionService {


  http: any;
  url = environment.baseUrl + "/Ordre_de_mission"
  constructor(private httpClient: HttpClient) { }


  getOrdreDeMissions() {
    return this.httpClient.get(this.url + '/getAll');
  }
  getOrdreDeMissionById(id: any) {
    return this.httpClient.get(this.url + '/getById/' + id);
  }
  updateOrdreDeMission(id: any, data: OrdreDeMission) {
    return this.httpClient.post(this.url + '/update/' + id, data);
  }

  addOrdreDeMission(data: OrdreDeMission) {
    return this.httpClient.post(this.url + '/add', data);
  }

  updateEtatByOrdre(id:any,data:any){
    return this.httpClient.post(`${this.url}/${id}/updateEtat`,data);
  }

  getNotifications(userId: number): Observable<any> {
    return this.httpClient.get(`${this.url}/getNotification/${userId}`);
}
}
