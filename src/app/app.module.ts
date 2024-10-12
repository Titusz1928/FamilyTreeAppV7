import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { InfoDialogComponent } from './header/dialogs/info-dialog/info-dialog.component';
import { LoginDialogComponent } from './header/dialogs/login-dialog/login-dialog.component';
import { DesktopComponent } from './desktop/desktop.component';
import { TreeAreaComponent } from './treearea/treearea.component';
import { FooterComponent } from './footer/footer.component';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';  // Modular Firebase SDK
import { provideAuth, getAuth } from '@angular/fire/auth';  // Modular API for Auth
import { provideFirestore, getFirestore } from '@angular/fire/firestore';  // Modular API for Firestore

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';

import { environment } from 'src/environments/environment';  // Firebase configuration

import { NotfoundComponent } from './notfound/notfound.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    InfoDialogComponent,
    LoginDialogComponent,
    DesktopComponent,
    TreeAreaComponent,
    FooterComponent,
    NotfoundComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    // Firebase initialization must be first
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),  // Auth service
    provideFirestore(() => getFirestore()),  // Firestore service (this is what was missing)

    // Angular Material Modules
    MatDialogModule,
    MatIconModule,
    MatToolbarModule,
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatGridListModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
