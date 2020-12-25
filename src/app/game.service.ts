import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Card } from './game-board/game-board.component';
import { PictureService } from './picture.service';

export interface Game {
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

  newGame(id?: string) {
    const game = this.generateGame();
    if (id) {
      this.currentGame?.set(game);
      return of(id);
    } else {
      return from(this.afs.collection<Game>('games').add(game)).pipe(
        map((game) => game.id)
      );
    }
  }

  getCurrentGame(id: string) {
    this.currentGame = this.afs.doc<Game>(`games/${id}`);
    return this.currentGame;
  }

  updateGame(updatedGame: Game, id: string) {
    this.afs.doc<Game>(`games/${id}`).update(updatedGame);
  }

  private generateGame(totalCards: number = 20) {
    let game: Game = { teamTurn: 1, teamWon: 0, cards: [] };

    let cards = game.cards;
    let startId = 0;
    const numTeamCards = 7;
    const images = this.pictureService.getImages(totalCards);

    // add assassin card
    cards.push({
      pictureUrl: images[startId],
      id: startId++,
      team: 0,
      assassin: true,
      selected: false,
    });

    // add team 1 cards
    for (let index = 0; index < numTeamCards + 1; index++) {
      cards.push({
        pictureUrl: images[startId],
        id: startId++,
        team: 1,
        assassin: false,
        selected: false,
      });
    }

    // add team 2 cards
    for (let index = 0; index < numTeamCards; index++) {
      cards.push({
        pictureUrl: images[startId],
        id: startId++,
        team: 2,
        assassin: false,
        selected: false,
      });
    }

    // add neutral cards
    while (cards.length < totalCards) {
      cards.push({
        pictureUrl: images[startId],
        id: startId++,
        team: 0,
        assassin: false,
        selected: false,
      });
    }

    this.shuffle(cards);

    return game;
  }

  private shuffle(array: Card[]) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}
