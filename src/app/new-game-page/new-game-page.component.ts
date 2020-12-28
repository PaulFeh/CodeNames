import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject } from 'rxjs';
import { switchMap, tap, throttleTime } from 'rxjs/operators';
import { GameService } from '../game.service';

@UntilDestroy()
@Component({
  templateUrl: './new-game-page.component.html',
  styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent implements OnInit {
  gameNotFound = this.router.getCurrentNavigation()?.extras.state?.notFound;
  joinGame$ = new Subject<string>();

  constructor(private router: Router, private gameService: GameService) {}

  ngOnInit(): void {
    this.joinGame$
      .pipe(
        tap(() => {
          this.gameNotFound = false;
        }),
        throttleTime(250),
        switchMap((val) => {
          if (val) {
            return this.gameService.getGameId(val.toLocaleUpperCase());
          } else {
            return this.gameService.createNewGame(1);
          }
        }),
        tap((id) => {
          if (id) {
            this.router.navigate(['/', id]);
          } else {
            this.gameNotFound = true;
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  newGame(): void {
    this.joinGame$.next();
  }

  joinGame(code: string): void {
    if (code && code.length === 6) {
      this.joinGame$.next(code);
    }
  }
}
