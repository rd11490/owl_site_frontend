import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, throwError as observableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CircuitPointResponse,
  initialCircuitPoints,
  initialTeamCircuitPoints,
  TeamCircuitPointResponse,
} from './models';

@Injectable({
  providedIn: 'root',
})
export class CircuitPointService {
  public playerCircuitPoints: Promise<CircuitPointResponse> = Promise.resolve(initialCircuitPoints);
  public playerCircuitPointsSync: CircuitPointResponse = initialCircuitPoints;

  public teamCircuitPoints: Promise<TeamCircuitPointResponse> = Promise.resolve(initialTeamCircuitPoints);
  public teamCircuitPointsSync: TeamCircuitPointResponse = initialTeamCircuitPoints;

  constructor(private http: HttpClient) {}

  getCircuitPoints(): void {
    this.playerCircuitPoints = firstValueFrom(
      this.http
        .get<CircuitPointResponse>(`https://mb1m37u0ig.execute-api.us-east-1.amazonaws.com/dev/circuitPoints`)
        .pipe(catchError(this.handleError)),
    ).then((setup) => {
      this.playerCircuitPointsSync = setup;
      return setup;
    });
  }

  getTeamCircuitPoints(): void {
    this.teamCircuitPoints = firstValueFrom(
      this.http
        .get<TeamCircuitPointResponse>(`https://mb1m37u0ig.execute-api.us-east-1.amazonaws.com/dev/teamCircuitPoints`)
        .pipe(catchError(this.handleError)),
    ).then((setup) => {
      this.teamCircuitPointsSync = setup;
      return setup;
    });
  }

  private handleError(res: HttpErrorResponse) {
    console.error(res.error);
    return observableThrowError(res.error || 'Server error');
  }
}
