import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameToobarComponent } from './game-toobar.component';

describe('GameToobarComponent', () => {
  let component: GameToobarComponent;
  let fixture: ComponentFixture<GameToobarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameToobarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameToobarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
