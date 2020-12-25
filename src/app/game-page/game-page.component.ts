import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { GameService } from '../game.service';

@Component({
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
  gameId$ = this.route.paramMap.pipe(
    map((params) => {
      let id = params.get('gameId');
      if (id) {
        return id;
      }

      return '';
    })
  );

  currentGame$ = this.gameId$.pipe(
    switchMap((id) =>
      typeof id === 'string'
        ? this.gameService.getCurrentGame(id).valueChanges()
        : of(null)
    )
  );

  constructor(
    private gameService: GameService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {}
}
