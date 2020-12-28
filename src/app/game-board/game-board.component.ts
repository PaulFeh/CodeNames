import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Game } from '../game.service';

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

  get cardsTeam1(): Card[] {
    return this.game?.cards
      ? this.game.cards.filter((card) => card.team === 1)
      : [];
  }
  get cardsLeftTeam1(): Card[] {
    return this.cardsTeam1?.filter((card) => card.selected === false);
  }

  get cardsTeam2(): Card[] {
    return this.game?.cards
      ? this.game.cards.filter((card) => card.team === 2)
      : [];
  }

  get cardsLeftTeam2(): Card[] {
    return this.cardsTeam2?.filter((card) => card.selected === false);
  }

  @ViewChild('roomCode')
  roomCodeTemplate: TemplateRef<any> | undefined;

  @Input()
  game: Game | undefined | null;
  @Output()
  updateGameEvent = new EventEmitter<Game>();
  @Output()
  newGameEvent = new EventEmitter<string>();

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    // if new game reset showTeams
    const cards: Card[] = changes.game.currentValue.cards;
    if (cards.every((card) => !card.selected)) {
      this.showTeams = false;
    }
  }

  clickedCard(card: Card): void {
    if (this.showTeams || card.selected) {
      return;
    }

    if (this.game?.teamWon === 0) {
      card.selected = true;
      this.game.teamWon = this.gameWon(card);
      if (this.game?.teamTurn !== card.team) {
        this.endTurn(false);
      }

      this.updateGameEvent.emit({
        ...this.game,
      });
    }
  }

  clickedShowTeams(): void {
    this.showTeams = !this.showTeams;
  }

  endTurn(update = true): void {
    if (this.game) {
      this.game.teamTurn = this.game?.teamTurn === 1 ? 2 : 1;

      if (update) {
        this.updateGameEvent.emit({
          ...this.game,
        });
      }
    }
  }

  newGame(): void {
    this.newGameEvent.next(this.game?.code);
  }

  gameWon(selectedCard: Card): number {
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

  viewRoomCode(): void {
    if (this.roomCodeTemplate) {
      this.dialog.open(this.roomCodeTemplate);
    }
  }

  trackByFn(index: number, item: Card): number {
    return item.id;
  }
}
