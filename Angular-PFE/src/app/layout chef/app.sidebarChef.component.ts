import { Component, ElementRef } from '@angular/core';
import { LayoutService } from "./service/app.layout.service";

@Component({
    selector: 'app-sidebar-chef',
    templateUrl: './app.sidebarChef.component.html'
})
export class AppSidebarComponent {
    constructor(public layoutService: LayoutService, public el: ElementRef) { }
}

