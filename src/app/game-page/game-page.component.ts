import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import {
  map,
  shareReplay,
  switchMap,
  take,
  tap,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';
import { Card } from '../game-board/game-board.component';
import { Game, GameService } from '../game.service';
import { TeamsService } from '../teams.service';

@UntilDestroy()
@Component({
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
  @ViewChild('joinTeamTemplate')
  joinTeamTemplate: TemplateRef<number> | undefined;
  @ViewChild('addClueTemplate')
  submitClueTemplate: TemplateRef<number> | undefined;
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

  team1$ = this.teamsService.getTeam(1);
  team2$ = this.teamsService.getTeam(2);

  currentTeam$ = this.teamsService.getCurrentTeam().pipe(shareReplay());

  isTeam1$ = this.currentTeam$.pipe(map((team) => team === 1));
  isTeam2$ = this.currentTeam$.pipe(map((team) => team === 2));
  player$ = this.teamsService.getCurrentUser();

  isSpymaster$ = new BehaviorSubject<boolean>(false);
  private joinTeam$ = new Subject<number>();
  private clearTeams$ = new Subject();

  teams$ = this.gameId$.pipe(
    switchMap((gameId) => this.teamsService.getTeams(gameId))
  );

  isClueGiver$ = this.currentGame$.pipe(
    withLatestFrom(this.player$),
    map(([game, player]) => {
      return game?.codeMasters.hasOwnProperty(player.id);
    })
  );

  editNameMode = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private gameService: GameService,
    private teamsService: TeamsService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private idle: Idle
  ) {
    idle.setIdle(5 * 60);
    idle.setTimeout(10 * 60);
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    idle.onTimeout.pipe(untilDestroyed(this)).subscribe(() => {
      this.router.navigate(['']);
      this.dialog.closeAll();
      idle.stop();
    });
    idle.watch();
  }

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
        take(1),
        untilDestroyed(this)
      )
      .subscribe();

    this.joinTeam$
      .pipe(
        throttleTime(3000),
        withLatestFrom(this.gameId$),
        switchMap(([team, id]) => this.teamsService.joinTeam(id, team)),
        untilDestroyed(this)
      )
      .subscribe();

    this.clearTeams$
      .pipe(
        throttleTime(3000),
        withLatestFrom(this.gameId$),
        switchMap(([val, id]) => this.teamsService.initTeams(id)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  updateGame(game: Game): void {
    this.gameId$
      .pipe(
        switchMap((id) => this.gameService.updateGame(game, id)),
        take(1),
        untilDestroyed(this)
      )
      .subscribe();
  }

  newGame(startTeam: number, gameCode: string): void {
    this.gameService
      .createNewGame(startTeam, gameCode)
      .pipe(take(1), untilDestroyed(this))
      .subscribe();
  }

  getStartTeam(game: Game): number {
    const team1Count = game.cards.filter((card) => card.team === 1).length;
    const team2Count = game.cards.filter((card) => card.team === 2).length;

    return team1Count > team2Count ? 2 : 1;
  }

  joinTeam(team: number): void {
    if (team) {
      this.joinTeam$.next(team);
    }
  }

  setName(name: string): void {
    this.teamsService
      .setName(name)
      .pipe(untilDestroyed(this))
      .subscribe(() => (this.editNameMode = false));
  }

  clearTeams(id: string): void {
    if (id) {
      this.clearTeams$.next();
    }
  }

  endTurn(game: Game, id: string, currentTeam: number): void {
    if (game && game.teamTurn === currentTeam && !this.waitingForClue(game)) {
      this.gameService.endTurn(game, id);
    }
  }

  toggleSpymaster(
    playerId: string | undefined,
    game: Game,
    gameId: string
  ): void {
    if (playerId) {
      this.isSpymaster$.next(!this.isSpymaster$.value);
      if (!game.codeMasters.hasOwnProperty(playerId)) {
        this.gameService.addSpyMaster(playerId, game, gameId);
      }
    }
  }

  cardSelected(card: Card, game: Game, id: string, isCluegiver: boolean): void {
    if (card && game && !this.waitingForClue(game) && !isCluegiver) {
      this.gameService.selectCard(card, game, id);
    }
  }

  submitClue(team: number, game: Game, id: string): void {
    if (this.submitClueTemplate && this.dialog.openDialogs.length === 0) {
      this.dialog
        .open(this.submitClueTemplate)
        .afterClosed()
        .subscribe((val) => {
          if (val?.clue) {
            this.gameService.addClue(
              val.clue,
              parseInt(val.number, 10),
              team,
              game,
              id
            );
          }
        });
    }
  }

  waitingForClue(game: Game | null | undefined): boolean {
    return game?.teamTurn !== game?.clues[game?.clues?.length - 1]?.team;
  }

  trackBy(index: number, item: { id: string; name: string }): string {
    return item.id;
  }
}
