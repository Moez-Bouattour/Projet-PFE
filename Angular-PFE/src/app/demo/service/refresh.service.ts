import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {

  public share: any;
  private shareSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private newNotificationCountSource = new Subject<number>();

  public share$ = this.shareSubject.asObservable();

  constructor() { }

  setshare(data: any) {
    this.shareSubject.next(data);
  }

  getshare() {
    return this.shareSubject.value;
  }
  updateNewNotificationCount(count: number) {
    this.newNotificationCountSource.next(count);
  }

  get newNotificationCount$() {
    return this.newNotificationCountSource.asObservable();
  }
}

