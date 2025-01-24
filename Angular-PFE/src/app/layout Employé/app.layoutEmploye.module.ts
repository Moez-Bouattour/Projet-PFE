import { NgModule } from '@angular/core';
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
import { AppMenuComponent } from './app.menuEmploye.component';
import { AppMenuitemComponent } from './app.menuitemEmploye.component';
import { RouterModule } from '@angular/router';
import { AppTopBarComponent } from './app.topbarEmploye.component';
import { AppFooterComponent } from './app.footerEmploye.component';
import { AppConfigModule } from './config/configEmploye.module';
import { AppSidebarComponent } from "./app.sidebarEmploye.component";
import { ChipModule } from 'primeng/chip';
import { AppLayoutComponentEmploye } from './app.layoutEmploye.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MultiSelectModule } from 'primeng/multiselect';

@NgModule({
    declarations: [
        AppMenuitemComponent,
        AppTopBarComponent,
        AppFooterComponent,
        AppMenuComponent,
        AppSidebarComponent,
        AppLayoutComponentEmploye
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
    exports: [AppLayoutComponentEmploye]
})
export class AppLayoutModuleEmploye { }
