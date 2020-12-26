import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../game.service';

@Component({
  templateUrl: './new-game-page.component.html',
  styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent implements OnInit {
  gameNotFound = this.router.getCurrentNavigation()?.extras.state?.notFound;

  constructor(private router: Router, private gameService: GameService) {}

  gameCodeControl = new FormControl('');
  gameCode: string = '';

  ngOnInit(): void {}

  newGame() {
    this.gameService.newGame().subscribe((id) => {
      this.router.navigate(['/', id]);
    });
  }

  joinGame(id: string) {
    this.router.navigate(['/', id]);
  }
}
