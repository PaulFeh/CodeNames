import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { adjectives } from './adjectives';
import { animals } from './animals';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'code-names';
  constructor(private auth: AngularFireAuth) {
    auth.signInAnonymously().then((user) => {
      if (!user.user?.displayName) {
        const randomAdj =
          adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomAanimal =
          animals[Math.floor(Math.random() * animals.length)];
        user.user?.updateProfile({
          displayName: `${randomAdj} ${randomAanimal}`,
        });
      }
    });
  }
}
