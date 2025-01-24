import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { User } from '../api/user';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url = environment.baseUrl + "/user";
  private loggedIn = new BehaviorSubject<boolean>(this.token.loggedIn());
  authStatus = this.loggedIn.asObservable();

  constructor(private httpClient: HttpClient,private token: TokenService){ }

  getUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(this.url + '/getAll');
  }

  addUser(user: any): Observable<any> {
    return this.httpClient.post<any>(this.url + '/add', user);
  }

  deleteUser(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.url}/delete/${id}`);
  }

  login(data: any) {
    return this.httpClient.post(this.url + '/login', data);
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.httpClient.post<any>(`${this.url}/update/${id}`, data);
  }

  getUserById(id: number): Observable<User> {
    return this.httpClient.get<User>(`${this.url}/getUserById/${id}`);
  }

  changeAuthStatus(value: boolean) {
    this.loggedIn.next(value);
  }
  storeToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  sendPasswordResetLink(data:any) {
    return this.httpClient.post(`${this.url}/sendPasswordResetLink`, data)
  }
  changePassword(data:any) {
    return this.httpClient.post(`${this.url}/resetPassword`, data)
  }
}
