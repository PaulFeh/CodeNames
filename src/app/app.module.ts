import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppComponent } from './app.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { GameBoardComponent } from './game-board/game-board.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NewGamePageComponent } from './new-game-page/new-game-page.component';
import { GamePageComponent } from './game-page/game-page.component';
import { AngularFireModule } from '@angular/fire';
import { MatFormFieldModule } from '@angular/material/form-field';

const firebaseConfig = {
  apiKey: 'AIzaSyAARLVWBge9-Kiu6mLNg4re0FtgxM494lE',
  authDomain: 'puzzle-app-60af1.firebaseapp.com',
  databaseURL: 'https://puzzle-app-60af1.firebaseio.com',
  projectId: 'puzzle-app-60af1',
  storageBucket: 'puzzle-app-60af1.appspot.com',
  messagingSenderId: '712230202404',
  appId: '1:712230202404:web:04b12e0b0d6d8a45483cb1',
  measurementId: 'G-W0EGHWTKKM',
};

@NgModule({
  declarations: [
    AppComponent,
    GameBoardComponent,
    NewGamePageComponent,
    GamePageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
