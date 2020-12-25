import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  // Output,
  // EventEmitter,
} from '@angular/core';
import { PictureService } from '../picture.service';

export interface Card {
  id: number;
  pictureUrl: string;
  team: number;
  assassin: boolean;
  selected: boolean;
}

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoardComponent implements OnInit {
  cards: Card[] = [];
  totalCards = 20;
  showTeams = false;
  teamTurn = 1;
  teamWon = 0;

  get cardsTeam1() {
    return this.cards.filter((card) => card.team === 1);
  }
  get cardsLeftTeam1() {
    return this.cardsTeam1.filter((card) => card.selected === false);
  }

  get cardsTeam2() {
    return this.cards.filter((card) => card.team === 2);
  }

  get cardsLeftTeam2() {
    return this.cardsTeam2.filter((card) => card.selected === false);
  }

  // @Output()
  // cardSelected: EventEmitter<Card> = new EventEmitter();
  constructor(private pictureService: PictureService) {
    this.generateBoard(this.totalCards);
  }

  ngOnInit(): void {}

  generateBoard(totalCards: number = 20) {
    this.cards = [];
    this.showTeams = false;
    this.teamTurn = 1;
    this.teamWon = 0;
    let startId = 0;
    const numTeamCards = 7;
    const images = this.pictureService.getImages(totalCards);

    // add assassin card
    this.cards.push({
      pictureUrl: images[startId],
      id: startId++,
      team: 0,
      assassin: true,
      selected: false,
    });

    // add team 1 cards
    for (let index = 0; index < numTeamCards + 1; index++) {
      this.cards.push({
        pictureUrl: images[startId],
        id: startId++,
        team: 1,
        assassin: false,
        selected: false,
      });
    }

    // add team 2 cards
    for (let index = 0; index < numTeamCards; index++) {
      this.cards.push({
        pictureUrl: images[startId],
        id: startId++,
        team: 2,
        assassin: false,
        selected: false,
      });
    }

    // add neutral cards
    while (this.cards.length < totalCards) {
      this.cards.push({
        pictureUrl: images[startId],
        id: startId++,
        team: 0,
        assassin: false,
        selected: false,
      });
    }

    this.shuffle(this.cards);
  }

  clickedCard(card: Card) {
    if (this.showTeams || card.selected) {
      return;
    }

    if (this.teamWon === 0) {
      // this.cardSelected.emit(card);
      card.selected = true;
      this.teamWon = this.gameWon(this.cards, card);
      if (this.teamTurn !== card.team) {
        this.endTurn();
      }
    }
  }

  clickedShowTeams() {
    this.showTeams = !this.showTeams;
  }

  endTurn() {
      this.teamTurn = this.teamTurn === 1 ? 2 : 1;
  }

  newGame() {
    this.generateBoard(this.totalCards);
  }

  gameWon(cards: Card[], selectedCard: Card) {
    let winningTeam = 0;

    if (selectedCard.assassin === true) {
      winningTeam = this.teamTurn === 1 ? 2 : 1;
    } else if (this.cardsTeam1.every((card) => card.selected === true)) {
      winningTeam = 1;
    } else if (this.cardsTeam2.every((card) => card.selected === true)) {
      winningTeam = 2;
    }

    return winningTeam;
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
