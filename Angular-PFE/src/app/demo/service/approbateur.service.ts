import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Approbateur } from '../api/approbateur';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ApprobateurService {

  url = environment.baseUrl + "/approbateur";

  constructor(private httpClient: HttpClient) { }

  getApprobateurs(): Observable<Approbateur[]> {
    return this.httpClient.get<Approbateur[]>(this.url + '/getAll');
  }

  getApprobateurById(id: any): Observable<Approbateur> {
    return this.httpClient.get<Approbateur>(this.url + '/getById/' + id);
  }

  addApprobateur(data: Approbateur): Observable<any> {
    return this.httpClient.post(this.url + '/add', data);
  }

  updateApprobateur(id: any, data: Approbateur): Observable<any> {
    return this.httpClient.post(this.url + '/update/' + id, data);
  }

  deleteApprobateur(id: any): Observable<any> {
    return this.httpClient.delete(this.url + '/delete/' + id);
  }

  updateUserRole(id: any): Observable<any> {
    return this.httpClient.post(this.url + '/updateUserRole/' + id, {});
  }

  getApprobateursByNiveau(id: any): Observable<Approbateur[]> {
    return this.httpClient.get<Approbateur[]>(`${this.url}/${id}/approbateurs`);
  }

}
