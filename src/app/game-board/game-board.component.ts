import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Game, GameService } from '../game.service';

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
export class GameBoardComponent implements OnInit, OnChanges {
  totalCards = 20;
  showTeams = false;
  showCode = false;

  get cardsTeam1() {
    return this.game?.cards.filter((card) => card.team === 1);
  }
  get cardsLeftTeam1() {
    return this.cardsTeam1?.filter((card) => card.selected === false);
  }

  get cardsTeam2() {
    return this.game?.cards.filter((card) => card.team === 2);
  }

  get cardsLeftTeam2() {
    return this.cardsTeam2?.filter((card) => card.selected === false);
  }

  @Input()
  gameId: string = '';
  @Input()
  game: Game | undefined | null;
  @Output()
  cardSelected: EventEmitter<Card> = new EventEmitter();
  @Output()
  turnEnded: EventEmitter<number> = new EventEmitter();

  constructor(private gameService: GameService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    // if new game reset showTeams
    let cards: Card[] = changes.game.currentValue.cards;
    if (cards.every((card) => !card.selected)) {
      this.showTeams = false;
    }
  }

  clickedCard(card: Card) {
    if (this.showTeams || card.selected) {
      return;
    }

    if (this.game?.teamWon === 0) {
      this.cardSelected.emit(card);
      card.selected = true;
      this.game.teamWon = this.gameWon(card);
      if (this.game?.teamTurn !== card.team) {
        this.endTurn(false);
      }

      this.gameService.updateGame(
        {
          ...this.game,
        },
        this.gameId
      );
    }
  }

  clickedShowTeams() {
    this.showTeams = !this.showTeams;
  }

  endTurn(update = true) {
    if (this.game) {
      this.turnEnded.emit(this.game?.teamTurn);
      this.game.teamTurn = this.game?.teamTurn === 1 ? 2 : 1;

      if (update) {
        this.gameService.updateGame(
          {
            ...this.game,
          },
          this.gameId
        );
      }
    }
  }

  newGame(id?: string) {
    this.gameService.newGame(id);
  }

  gameWon(selectedCard: Card) {
    let winningTeam = 0;

    if (selectedCard.assassin === true) {
      winningTeam = this.game?.teamTurn === 1 ? 2 : 1;
    } else if (this.cardsTeam1?.every((card) => card.selected === true)) {
      winningTeam = 1;
    } else if (this.cardsTeam2?.every((card) => card.selected === true)) {
      winningTeam = 2;
    }

    return winningTeam;
  }

  trackByFn(index: number, item: Card) {
    return item.id;
  }
}
