import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Card } from './game-board/game-board.component';
import { PictureService } from './picture.service';
import { randomString, shuffle } from './util';

export interface Game {
  code: string;
  cards: Card[];
  teamTurn: number;
  teamWon: number;
  teams?: { 1: string[]; 2: string[] };
  codeMasters: { [x: string]: boolean };
  clues: { word: string; amount: number; team: number }[];
  cardsSelected: number;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private currentGame: AngularFirestoreDocument<Game> | undefined;

  constructor(
    private afs: AngularFirestore,
    private pictureService: PictureService
  ) {}

  createNewGame(startTeam: number, code?: string): Observable<string> {
    const length = 6;
    const values = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const newGame = this.generateGame(
      code ? code : randomString(length, values),
      startTeam
    );
    if (code) {
      this.currentGame?.set(newGame);
      return of(code);
    } else {
      return from(this.afs.collection<Game>('games').add(newGame)).pipe(
        map((game) => game.id)
      );
    }
  }

  getGameId(code: string): Observable<string> {
    return of(code).pipe(
      switchMap((val) =>
        this.afs
          .collection<{ code: string }>('games', (ref) =>
            ref.where('code', '==', val)
          )
          .valueChanges({ idField: 'id' })
      ),
      map((val) => (val.length ? val[val.length - 1].id : '')),
      take(1)
    );
  }

  getCurrentGame(id: string): AngularFirestoreDocument<Game> {
    if (this.currentGame?.ref.id !== id) {
      this.currentGame = this.afs.doc<Game>(`games/${id}`);
    }
    return this.currentGame;
  }

  updateGame(updatedGame: Game, id: string): Observable<void> {
    return from(this.getCurrentGame(id).update(updatedGame));
  }

  endTurn(game: Game, id: string, update = true): void {
    if (game) {
      game.teamTurn = game?.teamTurn === 1 ? 2 : 1;
      game.cardsSelected = 0;

      if (update) {
        this.updateGame(game, id);
      }
    }
  }

  selectCard(card: Card, game: Game, id: string): void {
    if (game?.teamWon === 0) {
      card.selected = true;
      game.teamWon = this.gameWon(card, game);
      game.cardsSelected += 1;

      const lastClueAmount = game.clues[game.clues.length - 1].amount;
      const maxSelectableCards =
        lastClueAmount === -1 || lastClueAmount === 0 ? 8 : lastClueAmount + 1;

      if (
        game.cardsSelected >= maxSelectableCards ||
        game?.teamTurn !== card.team
      ) {
        this.endTurn(game, id, false);
      }

      this.updateGame(game, id);
    }
  }

  addSpyMaster(playerId: string, game: Game, gameId: string): void {
    if (game?.teamWon === 0) {
      game.codeMasters[playerId] = true;

      this.updateGame(game, gameId);
    }
  }

  addClue(
    word: string,
    amount: number,
    team: number,
    game: Game,
    gameId: string
  ): void {
    if (this.canAddClue(game, team)) {
      const updatedGame = { ...game };
      updatedGame.clues.push({ word, amount, team });
      this.updateGame(updatedGame, gameId);
    }
  }

  private canAddClue(game: Game, team: number): boolean {
    return (
      game.teamTurn === team &&
      game.clues[game.clues?.length - 1]?.team !== team
    );
  }

  private gameWon(selectedCard: Card, game: Game): number {
    let winningTeam = 0;

    if (selectedCard.assassin === true) {
      winningTeam = game?.teamTurn === 1 ? 2 : 1;
    } else if (
      game.cards
        .filter((card) => card.team === 1)
        .every((card) => card.selected === true)
    ) {
      winningTeam = 1;
    } else if (
      game.cards
        .filter((card) => card.team === 2)
        .every((card) => card.selected === true)
    ) {
      winningTeam = 2;
    }

    return winningTeam;
  }

  private generateGame(
    code: string,
    startTeam: number = 1,
    totalCards: number = 20
  ): Game {
    const game: Game = {
      code,
      teamTurn: startTeam,
      teamWon: 0,
      cards: [],
      codeMasters: {},
      clues: [],
      cardsSelected: 0,
    };

    let startId = 0;
    const numTeamCards = 7;
    const images = this.pictureService.getImages(totalCards);

    // add assassin card
    game.cards.push({
      pictureUrl: images[startId],
      id: startId++,
      team: 0,
      assassin: true,
      selected: false,
    });

    // add team 1 cards
    for (let index = 0; index < numTeamCards + 1; index++) {
      game.cards.push({
        pictureUrl: images[startId],
        id: startId++,
        team: startTeam,
        assassin: false,
        selected: false,
      });
    }

    // add team 2 cards
    for (let index = 0; index < numTeamCards; index++) {
      game.cards.push({
        pictureUrl: images[startId],
        id: startId++,
        team: startTeam === 1 ? 2 : 1,
        assassin: false,
        selected: false,
      });
    }

    // add neutral cards
    while (game.cards.length < totalCards) {
      game.cards.push({
        pictureUrl: images[startId],
        id: startId++,
        team: 0,
        assassin: false,
        selected: false,
      });
    }

    game.cards = shuffle(game.cards);

    return game;
  }
}
