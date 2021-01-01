import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { adjectives } from './adjectives';
import { animals } from './animals';
import { TeamsService } from './teams.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'code-names';
  constructor(
    private auth: AngularFireAuth,
    private teamsService: TeamsService
  ) {
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomAanimal = animals[Math.floor(Math.random() * animals.length)];
    auth.signInAnonymously().then((user) => {
      if (!user.user?.displayName) {
        teamsService.setName(`${randomAdj} ${randomAanimal}`).subscribe();
      }
    });
  }
}
