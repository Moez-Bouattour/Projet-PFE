import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Typedocument } from '../api/typedocument';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class TypedocumentService {

  http: any;
  url = environment.baseUrl + "/typeDocument"
  constructor(private httpClient: HttpClient) { }

  gettypeDocuments() {
    return this.httpClient.get(this.url + '/getAll');
  }

  getTypeDocumentById(id: any) {
    return this.httpClient.get(this.url + '/getById/' + id);
  }

  addTypeDocument(data: Typedocument) {
    return this.httpClient.post(this.url + '/add', data);
  }

  updateTypeDocument(id: any, data: Typedocument) {
    return this.httpClient.post(this.url + '/update/' + id, data);
  }

  deleteTypeDocuments(id: any) {
    return this.httpClient.delete(this.url + '/delete/' + id);
  }

}
