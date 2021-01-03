import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

interface Teams {
  [key: number]: { [key: string]: string };
}

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  teamsCollection = this.afs.collection<Teams>(`teams`);
  constructor(private auth: AngularFireAuth, private afs: AngularFirestore) {}

  setName(name: string): Observable<boolean> {
    return this.auth.user.pipe(
      tap((user) => user?.updateProfile({ displayName: name })),
      tap((user) => user?.reload()),
      map((user) => (user ? true : false)),
      take(1)
    );
  }

  getCurrentUser(): Observable<{ name: string; id: string }> {
    return this.auth.user.pipe(
      filter((user) => user !== null),
      distinctUntilChanged(),
      map((user) =>
        user?.displayName
          ? { name: user.displayName, id: user.uid }
          : { name: '', id: '' }
      )
    );
  }

  initTeams(gameId: string, teams: Teams = { 1: {}, 2: {} }): void {
    this.teamsCollection.doc(gameId).set(teams);
  }

  joinTeam(gameId: string, team: number): Observable<boolean> {
    return this.auth.user.pipe(
      switchMap((user) => {
        if (user) {
          const teamsDoc = this.teamsCollection.doc(gameId);
          return teamsDoc.get().pipe(
            switchMap((teams) => {
              let updatedTeams: Teams = {};
              if (user) {
                const team1 = teams.get('1');
                const team2 = teams.get('2');
                if (team1?.hasOwnProperty(user.uid)) {
                  delete team1[user.uid];
                } else if (team2?.hasOwnProperty(user.uid)) {
                  delete team2[user.uid];
                }

                updatedTeams = { 1: { ...team1 }, 2: { ...team2 } };
              }

              return teams.exists
                ? teamsDoc.update({
                    ...updatedTeams,
                    [team]: {
                      ...updatedTeams[team],
                      [user.uid]: user.displayName || user.uid,
                    },
                  })
                : teamsDoc.set({
                    [team]: { [user.uid]: user.displayName || user.uid },
                  });
            }),
            switchMap(() => of(true))
          );
        } else {
          return of(false);
        }
      })
    );
  }

  private getTeams(gameId: string): Observable<Teams | undefined> {
    return this.teamsCollection.doc(gameId).valueChanges().pipe(shareReplay());
  }

  getTeam(
    gameId: string,
    team: number
  ): Observable<{ id: string; name: string }[]> {
    return this.getTeams(gameId).pipe(
      map((teams) => (teams ? { ...teams[team] } : {})),
      map((currentTeam) => {
        // turn object map into array
        const players = [];
        for (const player in currentTeam) {
          if (currentTeam) {
            players.push({ name: currentTeam[player], id: player });
          }
        }

        return players;
      })
    );
  }

  getCurrentTeam(gameId: string): Observable<number> {
    return this.getTeams(gameId).pipe(
      withLatestFrom(this.auth.user),
      map(([teams, user]) => {
        let currentTeam = -1;
        if (teams && user?.uid) {
          if (teams[1]?.hasOwnProperty(user?.uid)) {
            currentTeam = 1;
          }
          if (teams[2]?.hasOwnProperty(user?.uid)) {
            currentTeam = 2;
          }
        }
        return currentTeam;
      })
    );
  }
}
