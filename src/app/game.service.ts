import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Card } from './game-board/game-board.component';
import { PictureService } from './picture.service';
import { randomString, shuffle } from './util';

export interface Game {
  code: string;
  cards: Card[];
  teamTurn: number;
  teamWon: number;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  currentGame: AngularFirestoreDocument<Game> | undefined;

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
        map((game) => game.id),
        tap((id) => {
          this.afs.doc('gameIds/abc').update({ [newGame.code]: id });
        })
      );
    }
  }

  getGameId(code: string): Observable<string> {
    return this.afs
      .doc<{ [key: string]: string }>('gameIds/abc')
      .get()
      .pipe(
        map((doc) => {
          const key = doc.get(code);
          return key ? key : '';
        })
      );
  }

  getCurrentGame(id: string): AngularFirestoreDocument<Game> {
    this.currentGame = this.afs.doc<Game>(`games/${id}`);
    return this.currentGame;
  }

  updateGame(updatedGame: Game, id: string): Observable<void> {
    return from(this.afs.doc<Game>(`games/${id}`).update(updatedGame));
  }

  private generateGame(
    code: string,
    startTeam: number = 1,
    totalCards: number = 20
  ): Game {
    const game: Game = { code, teamTurn: startTeam, teamWon: 0, cards: [] };

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
