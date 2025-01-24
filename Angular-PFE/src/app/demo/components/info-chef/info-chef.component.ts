import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';
import { User } from '../../api/user';

@Component({
  selector: 'app-info-chef',
  templateUrl: './info-chef.component.html',
  styleUrls: ['./info-chef.component.scss']
})
export class InfoChefComponent {
  url: any;
  token: any;
  userData: any;
  email: any;
  name: any;
  id: any;
  poste: any;
  departement: any;
  users: User[] = [];
  loggedIn: boolean = false;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.loggedIn = this.userService.isLoggedIn();
    if (this.loggedIn) {
      this.userService.getUsers().subscribe((data: any) => {
        this.users = data.users;
console.log(this.users);

        this.token = localStorage.getItem('token');
        this.userData = jwtDecode(this.token);
        this.name = this.userData.name;
        this.id = this.userData.user_id;
        this.email = this.userData.email;
        this.poste = this.userData.poste;
        this.departement = this.userData.departement;
        this.users = data.users.filter((user: any) => user.departement === this.departement && user.id !== this.id);
      })
    }
  };

}
