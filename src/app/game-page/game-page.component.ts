import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  map,
  shareReplay,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import { Card } from '../game-board/game-board.component';
import { Game, GameService } from '../game.service';
import { TeamsService } from '../teams.service';

@Component({
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
  @ViewChild('joinTeamTemplate')
  joinTeamTemplate: TemplateRef<number> | undefined;
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
  player$ = this.teamsService.getCurrentUser();

  isSpymaster$ = new BehaviorSubject<boolean>(false);

  teams$ = this.gameId$.pipe(
    switchMap((gameId) => this.teamsService.getTeams(gameId))
  );

  editNameMode = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private gameService: GameService,
    private teamsService: TeamsService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentTeam$
      .pipe(
        take(1),
        switchMap((team) => {
          if (!(team >= 0)) {
            if (this.joinTeamTemplate && this.dialog.openDialogs.length === 0) {
              return this.dialog
                .open(this.joinTeamTemplate, { minWidth: 300 })
                .afterClosed();
            }
          }
          return of(0);
        }),
        withLatestFrom(this.gameId$),
        switchMap(([team, id]) => {
          if (team > 0) {
            return this.teamsService.joinTeam(id, team);
          }
          return of(0);
        }),
        take(1)
      )
      .subscribe();
  }

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
        }),
        take(1)
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

  endTurn(game: Game, id: string, currentTeam: number): void {
    if (game && game.teamTurn === currentTeam) {
      this.gameService.endTurn(game, id);
    }
  }

  toggleSpymaster(playerId: string, game: Game, gameId: string): void {
    this.isSpymaster$.next(!this.isSpymaster$.value);
    if (!game.codeMasters.hasOwnProperty(playerId)) {
      this.gameService.addSpyMaster(playerId, game, gameId);
    }
  }

  cardSelected(card: Card, game: Game, id: string): void {
    if (card && game) {
      this.gameService.selectCard(card, game, id);
    }
  }

  trackBy(index: number, item: { id: string; name: string }): string {
    return item.id;
  }
}
