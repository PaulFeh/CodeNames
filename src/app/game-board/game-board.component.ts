import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
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
  ChangeDetectorRef,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        // each time the binding value changes
        // query('.card', [
        //   stagger(100, [animate('0.5s', style({ opacity: 0 }))]),
        // ]),
        query('.card', [
          style({ transform: 'translateY(-100%)', opacity: 0 }),
          stagger(
            100,
            animate('.1s', style({ transform: 'translateY(0)', opacity: '*' }))
          ),
        ]),
      ]),
    ]),
  ],
})
export class GameBoardComponent implements OnInit, OnChanges {
  @ViewChild('roomCode')
  roomCodeTemplate: TemplateRef<any> | undefined;
  @Input()
  game: Game | undefined | null;
  @Input()
  showTeams = true;
  @Input()
  playerTeam = 0;
  @Output()
  updateGameEvent = new EventEmitter<Game>();
  @Output()
  cardSelectedEvent = new EventEmitter<Card>();
  @Output()
  newGameEvent = new EventEmitter<string>();

  totalCards = 20;
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

  constructor(
    private changeRef: ChangeDetectorRef,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.showTeams) {
      this.showTeams = changes.showTeams.currentValue;
      this.changeRef.detectChanges();
    }

    // if new game reset showTeams
    if (changes.game?.previousValue?.teamWon > 0) {
      this.showTeams = false;
    }

    const previousGame = changes.game?.previousValue as Game;
    const currentGame = changes.game?.currentValue as Game;

    if (previousGame && currentGame) {
      const previousClues = previousGame.clues;
      const currentClues = currentGame.clues;

      if (previousClues.length !== currentClues.length) {
        const lastClue = currentClues[currentClues.length - 1];
        this.snackbar.open(
          `${
            lastClue.team === 1 ? 'Red' : 'Blue'
          } Team's Clue: ${lastClue.word.toUpperCase()} (${
            lastClue.amount === -1 ? '∞' : lastClue.amount
          })`,
          undefined,
          {
            duration: 4000,
          }
        );
      }

      const previousSelectedCards = previousGame.cards
        .filter((card) => card.selected)
        .map((card) => card.id);
      const currentSelectedCards = currentGame.cards
        .filter((card) => card.selected)
        .map((card) => card.id);

      if (currentSelectedCards.length !== previousSelectedCards.length) {
        const selectedCard = currentSelectedCards.filter(
          (x) => !previousSelectedCards.includes(x)
        )[0];
        const selectedIndex = currentGame.cards
          .map((card) => card.id)
          .indexOf(selectedCard);
        this.snackbar.open(`Card ${selectedIndex + 1} selected!`, undefined, {
          duration: 4000,
        });
      }
    }
  }

  clickedCard(card: Card): void {
    if (
      this.showTeams ||
      card.selected ||
      this.game?.teamTurn !== this.playerTeam
    ) {
      return;
    }

    this.cardSelectedEvent.emit(card);
  }

  newGame(): void {
    this.newGameEvent.next(this.game?.code);
  }

  trackByFn(index: number, item: Card): number {
    return item.id;
  }
}
