import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';

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

  @Output()
  cardSelected: EventEmitter<Card> = new EventEmitter();
  constructor() {}

  ngOnInit(): void {
    this.generateBoard(this.totalCards);
  }

  generateBoard(totalCards: number = 20) {
    let startId = 0;
    const numTeamCards= 7

    this.cards.push({
      id: startId++,
      pictureUrl: `https://picsum.photos/id/${this.getRandomInt(1000)}/200/200`,
      team: -1,
      assassin: true,
      selected: false,
    });

    for (let index = 0; index < numTeamCards; index++) {
      this.cards.push({
        id: startId++,
        pictureUrl: `https://picsum.photos/id/${this.getRandomInt(1000)}/200/200`,
        team: 0,
        assassin: false,
        selected: false,
      });
    }
    for (let index = 0; index < numTeamCards+1; index++) {
      this.cards.push({
        id: startId++,
        pictureUrl: `https://picsum.photos/id/${this.getRandomInt(1000)}/200/200`,
        team: 1,
        assassin: false,
        selected: false,
      });
    }
    for (let index = 0; index < totalCards-2-(numTeamCards* 2 ); index++) {
      this.cards.push({
        id: startId++,
        pictureUrl: `https://picsum.photos/id/${this.getRandomInt(1000)}/200/200`,
        team: 2,
        assassin: false,
        selected: false,
      });
    }

    this.shuffle(this.cards);
    console.log(this.cards.length)
  }

  clickedCard(card: Card) {
    this.cardSelected.emit(card);
    card.selected = true;
  }

  clickedShowTeams() {
    this.showTeams = !this.showTeams;
  }

  private getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  private shuffle(array: Card[]) {
    var currentIndex = array.length, temporaryValue, randomIndex;

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
