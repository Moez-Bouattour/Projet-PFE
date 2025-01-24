import { Component, ElementRef } from '@angular/core';
import { LayoutService } from "./service/app.layout.service";

@Component({
    selector: 'app-sidebar-rh',
    templateUrl: './app.sidebarRH.component.html'
})
export class AppSidebarComponent {
    constructor(public layoutService: LayoutService, public el: ElementRef) { }
}

