import { Component } from '@angular/core';
import { LayoutService } from "./service/app.layout.service";

@Component({
    selector: 'app-footer-employe',
    templateUrl: './app.footerEmploye.component.html'
})
export class AppFooterComponent {
    constructor(public layoutService: LayoutService) { }
}
