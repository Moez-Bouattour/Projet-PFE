import { ElementRef, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { BadgeModule } from 'primeng/badge';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';
import { ChipModule } from 'primeng/chip';
import { AppMenuComponent } from './app.menuRH.component';
import { AppConfigModule } from './config/configRH.module';
import { AppLayoutComponent } from './app.layoutRH.component';
import { AppSidebarComponent } from './app.sidebarRH.component';
import { AppFooterComponent } from './app.footerRH.component';
import { AppTopBarComponent } from './app.topbarRH.component';
import { AppMenuitemComponent } from './app.menuitemRH.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MultiSelectModule } from 'primeng/multiselect';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@NgModule({
    declarations: [
        AppMenuitemComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppMenuComponent,
        AppSidebarComponent,
        AppLayoutComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        InputTextModule,
        SidebarModule,
        ScrollTopModule,
    ScrollPanelModule,
        BadgeModule,
        RadioButtonModule,
        InputSwitchModule,
        RippleModule,
        RouterModule,
        AppConfigModule,
        ChipModule,
        DialogModule,
        ButtonModule,
        OverlayPanelModule,
        MultiSelectModule

    ],
    exports: [AppLayoutComponent]
})
export class AppLayoutModule { }
