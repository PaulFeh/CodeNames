import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
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
    ),
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
}
