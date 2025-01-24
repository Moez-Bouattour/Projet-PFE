import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

@Injectable()
export class ParametrageService {
  http: any;
  url = environment.baseUrl + "/typeDocument"

  constructor(private httpClient: HttpClient) { }
  getTypeDocuments() {
    return this.httpClient.get(this.url + '/getAll');
  }

}
