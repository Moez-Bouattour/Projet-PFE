import { HttpClient } from '@angular/common/http';
import { Injectable, Type } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { TypeConge } from '../api/type-conge';

@Injectable({
  providedIn: 'root'
})
export class TypeCongeService {

  url = environment.baseUrl + "/typeConges";

  constructor(private httpClient: HttpClient) { }

  getTypeConges(): Observable<TypeConge[]> {
    return this.httpClient.get<TypeConge[]>(this.url + '/getAll');
  }
  getTypeCongeById(id: any) {
    return this.httpClient.get(this.url + '/getById/' + id);
  }

  addTypeConge(data: any) {
    return this.httpClient.post(this.url + '/add', data);
  }

  updateTypeConge(id: any, data: TypeConge) {
    return this.httpClient.post(this.url + '/update/' + id, data);
  }

  deleteTypeConge(id: any) {
    return this.httpClient.delete(this.url + '/delete/' + id);
  }
}


