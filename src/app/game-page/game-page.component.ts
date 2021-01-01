import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { Card } from '../game-board/game-board.component';
import { Game, GameService } from '../game.service';
import { TeamsService } from '../teams.service';

@Component({
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  gameId$ = this.route.paramMap.pipe(
    map((params) => {
      const id = params.get('gameId');

      return id ? id : '';
    }),
    shareReplay()
  );

  currentGame$ = this.gameId$.pipe(
    switchMap((id) => this.gameService.getCurrentGame(id).valueChanges()),
    tap((game) => {
      if (!game) {
        this.router.navigate([''], { state: { notFound: true } });
      }
    })
  );

  team1$ = this.gameId$.pipe(
    switchMap((gameId) => this.teamsService.getTeam(gameId, 1))
  );
  team2$ = this.gameId$.pipe(
    switchMap((gameId) => this.teamsService.getTeam(gameId, 2))
  );

  currentTeam$ = this.gameId$.pipe(
    switchMap((gameId) => this.teamsService.getCurrentTeam(gameId)),
    shareReplay()
  );

  isTeam1$ = this.currentTeam$.pipe(map((team) => team === 1));
  isTeam2$ = this.currentTeam$.pipe(map((team) => team === 2));
  playerName$ = this.teamsService.getName();

  isSpymaster$ = new BehaviorSubject<boolean>(false);

  editNameMode = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private gameService: GameService,
    private teamsService: TeamsService,
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

  newGame(startTeam: number, gameCode: string): void {
    this.gameService
      .createNewGame(startTeam, gameCode)
      .pipe(take(1))
      .subscribe();
  }

  getStartTeam(game: Game): number {
    const team1Count = game.cards.filter((card) => card.team === 1).length;
    const team2Count = game.cards.filter((card) => card.team === 2).length;

    return team1Count > team2Count ? 2 : 1;
  }

  joinTeam(team: number): void {
    this.gameId$
      .pipe(
        switchMap((id) => {
          return this.teamsService.joinTeam(id, team);
        })
      )
      .subscribe();
  }

  setName(name: string): void {
    this.teamsService
      .setName(name)
      .subscribe(() => (this.editNameMode = false));
  }

  clearTeams(id: string): void {
    if (id) {
      this.teamsService.initTeams(id);
    }
  }

  endTurn(game: Game, id: string): void {
    if (game) {
      this.gameService.endTurn(game, id);
    }
  }

  toggleSpymaster(): void {
    this.isSpymaster$.next(!this.isSpymaster$.value);
  }

  cardSelected(card: Card, game: Game, id: string): void {
    if (card && game) {
      this.gameService.selectCard(card, game, id);
    }
  }
}
