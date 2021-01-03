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

  constructor(private changeRef: ChangeDetectorRef) {}

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
