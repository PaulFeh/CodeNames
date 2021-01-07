import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Game } from '../game.service';

@Component({
  selector: 'app-game-toobar',
  templateUrl: './game-toobar.component.html',
  styleUrls: ['./game-toobar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameToobarComponent implements OnInit, OnChanges {
  @ViewChild('roomCode')
  roomCodeTemplate: TemplateRef<any> | undefined;
  @Input()
  game: Game | undefined | null;
  @Input()
  isHandset = false;
  @Input()
  isClueGiver = false;
  @Output()
  revealCards = new EventEmitter<boolean>();
  @Output()
  newGame = new EventEmitter();
  @Output()
  endTurn = new EventEmitter();
  @Output()
  clue = new EventEmitter<{ word: string; amount: number }>();
  @Output()
  leaveGame = new EventEmitter();
  @Output()
  toggleMenu = new EventEmitter();
  team1CardCount: number | undefined;
  team2CardCount: number | undefined;

  showCode = false;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.updateScore();
  }

  ngOnChanges(): void {
    this.updateScore();
  }

  viewRoomCode(): void {
    this.showCode = !this.showCode;
  }

  clickedRevealCards(): void {
    this.revealCards.emit();
  }

  clickedNewGame(): void {
    this.newGame.emit(this.game?.code);
  }

  clickedEndTurn(): void {
    this.endTurn.emit();
  }

  clickedLeaveGame(): void {
    this.leaveGame.emit();
  }

  clickedSubmitClue(): void {
    this.clue.emit();
  }

  viewRoomCodeDialog(): void {
    if (this.roomCodeTemplate) {
      this.dialog.open(this.roomCodeTemplate);
    }
  }

  clickedToggleMenu(): void {
    this.toggleMenu.emit();
  }

  private cardsLeft(team: number): number | undefined {
    return this.game?.cards
      .filter((card) => card.team === team)
      .filter((card) => !card.selected).length;
  }

  private updateScore(): void {
    this.team1CardCount = this.cardsLeft(1);
    this.team2CardCount = this.cardsLeft(2);
  }
}
