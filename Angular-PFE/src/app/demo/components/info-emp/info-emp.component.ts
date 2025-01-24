import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { UserService } from '../../service/user.service';
import { User } from '../../api/user';

@Component({
  selector: 'app-info-emp',
  templateUrl: './info-emp.component.html',
  styleUrls: ['./info-emp.component.scss']
})
export class InfoEmpComponent implements OnInit {
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
  chefDeProjetNom?: string = '';

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.loggedIn = this.userService.isLoggedIn();
    if (this.loggedIn) {
      this.userService.getUsers().subscribe((data: any) => {
        this.users = data.users;
        this.token = localStorage.getItem('token');
        this.userData = jwtDecode(this.token);
        this.name = this.userData.name;
        this.id = this.userData.user_id;
        this.email = this.userData.email;
        this.poste = this.userData.poste;
        this.departement = this.userData.departement;
        console.log(this.departement);
        const chefDeProjet = this.users.find(user => user.departement === this.departement && user.poste === 'Chef de projet');
        console.log(chefDeProjet);
        if (chefDeProjet) {
          this.chefDeProjetNom = chefDeProjet.name;
          console.log("Poste du chef de projet du même département:",this.chefDeProjetNom);
        } else {
          console.log("Aucun chef de projet trouvé pour ce département.");
        }
      })
    }
  };
}
