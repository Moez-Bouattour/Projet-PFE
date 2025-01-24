import { Component } from '@angular/core';
import { LayoutService } from "./service/app.layout.service";

@Component({
    selector: 'app-footer-rh',
    templateUrl: './app.footerRH.component.html'
})
export class AppFooterComponent {
    constructor(public layoutService: LayoutService) { }
}
