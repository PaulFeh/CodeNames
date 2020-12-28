import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Game, GameService } from '../game.service';

@Component({
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
  gameId$ = this.route.paramMap.pipe(
    map((params) => {
      const id = params.get('gameId');

      return id ? id : '';
    })
  );

  currentGame$ = this.gameId$.pipe(
    switchMap((id) => this.gameService.getCurrentGame(id).valueChanges()),
    tap((game) => {
      if (!game) {
        this.router.navigate([''], { state: { notFound: true } });
      }
    })
  );

  constructor(
    private gameService: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {}

  updateGame(game: Game): void {
    this.gameId$
      .pipe(
        switchMap((id) => this.gameService.updateGame(game, id)),
        take(1)
      )
      .subscribe();
  }

  newGame(gameCode: string): void {
    this.gameService.createNewGame(gameCode).pipe(take(1)).subscribe();
  }
}
