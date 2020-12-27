import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../game.service';

@Component({
  templateUrl: './new-game-page.component.html',
  styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent implements OnInit {
  gameNotFound = this.router.getCurrentNavigation()?.extras.state?.notFound;

  constructor(private router: Router, private gameService: GameService) {}

  ngOnInit(): void {}

  newGame() {
    this.gameService.newGame().subscribe((id) => {
      this.router.navigate(['/', id]);
    });
  }

  joinGame(code: string) {
    this.gameService.getGameId(code.toLocaleUpperCase()).subscribe((id) => {
      this.router.navigate(['/', id]);
    });
  }
}
