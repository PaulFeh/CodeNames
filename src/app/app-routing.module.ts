import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GamePageComponent } from './game-page/game-page.component';
import { NewGamePageComponent } from './new-game-page/new-game-page.component';

const routes: Routes = [
  { path: ':gameId', component: GamePageComponent },
  {
    path: '',
    component: NewGamePageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
