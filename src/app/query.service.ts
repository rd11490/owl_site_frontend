import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, throwError as observableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Composition, Player, QueryResponse } from './models';

@Injectable()
export class QueryService {
  aggregationType?: string;
  composition: Composition[] = [];
  heroes: string[] = [];
  mapNames: string[] = [];
  mapTypes: string[] = [];
  opponentComposition: Composition[] = [];
  opponentTeams: string[] = [];
  players: Player[] = [];
  stages: string[] = [];
  teams: string[] = [];

  queryResponseSync: QueryResponse = new QueryResponse();
  queryResponse: Promise<QueryResponse> = Promise.resolve(new QueryResponse());

  // eslint-disable-next-line no-unused-vars
  constructor(private http: HttpClient) {}

  setAggregationType(aggregationType: string) {
    this.aggregationType = aggregationType;
  }

  setCompsition(composition: Composition[]) {
    this.composition = composition;
  }

  setOpponentCompsition(composition: Composition[]) {
    this.opponentComposition = composition;
  }

  setTeams(teams: string[]) {
    this.teams = teams;
  }

  setOpponentTeams(teams: string[]) {
    this.opponentTeams = teams;
  }

  setHeroes(heroes: string[]) {
    this.heroes = heroes;
  }

  setPlayers(players: Player[]) {
    this.players = players;
  }

  setMapTypes(mapTypes: string[]) {
    this.mapTypes = mapTypes;
  }

  setMapNames(mapNames: string[]) {
    this.mapNames = mapNames;
  }

  setStages(stages: string[]) {
    this.stages = stages;
  }

  buildSearchRequest() {
    return {
      aggregation: this.aggregationType || 'Player',
      composition: this.composition?.map((c) => c.cluster),
      heroes: this.heroes,
      mapNames: this.mapNames,
      mapTypes: this.mapTypes,
      opponentComposition: this.opponentComposition?.map((c) => c.cluster),
      opponentTeams: this.opponentTeams,
      players: this.players.map((player) => player.player),
      stages: this.stages,
      teams: this.teams,
    };
  }

  selectionText(): string {
    const strs: string[] = [];
    if (this.aggregationType != null) {
      strs.push(`Aggregation Type: ${this.aggregationType}`);
    }

    if (this.players.length > 0) {
      strs.push(`Players: ${this.players.map((p) => p.player)}`);
    }

    if (this.heroes.length > 0) {
      strs.push(`Heroes: ${this.heroes}`);
    }

    if (this.teams.length > 0) {
      strs.push(`Teams: ${this.teams}`);
    }

    if (this.opponentTeams.length > 0) {
      strs.push(`Opponent Teams: ${this.opponentTeams}`);
    }

    if (this.composition.length > 0) {
      strs.push(`Composition: ${this.composition.map((p) => p.label)}`);
    }

    if (this.opponentComposition.length > 0) {
      strs.push(`Opponent Composition: ${this.opponentComposition.map((p) => p.label)}`);
    }

    if (this.mapNames.length > 0) {
      strs.push(`Maps: ${this.mapNames}`);
    }

    if (this.mapTypes.length > 0) {
      strs.push(`Map Types: ${this.mapTypes}`);
    }

    if (this.stages.length > 0) {
      strs.push(`Stages: ${this.stages}`);
    }

    if (strs.length === 0) {
      return 'Select Query Options';
    } else {
      return strs.join(' | ');
    }
  }

  runQuery(): Promise<QueryResponse> {
    this.queryResponse = firstValueFrom(
      this.http
        .post<QueryResponse>(
          'https://mb1m37u0ig.execute-api.us-east-1.amazonaws.com/dev/query',
          this.buildSearchRequest()
        )
        .pipe(catchError(this.handleError))
    ).then((response) => {
      this.queryResponseSync = response;
      return response;
    });

    return this.queryResponse;
  }

  private handleError(res: HttpErrorResponse) {
    console.error(res.error);
    return observableThrowError(res.error || 'Server error');
  }
}
