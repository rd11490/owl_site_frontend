import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, throwError as observableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CircuitPointResponse, initialCircuitPoints } from './models';

@Injectable({
  providedIn: 'root',
})
export class CircuitPointService {
  public constants: Promise<CircuitPointResponse> = Promise.resolve(initialCircuitPoints);
  public constantsSync: CircuitPointResponse = initialCircuitPoints;

  constructor(private http: HttpClient) {}

  getCircuitPoints(): void {
    this.constants = firstValueFrom(
      this.http
        .get<CircuitPointResponse>(`https://mb1m37u0ig.execute-api.us-east-1.amazonaws.com/dev/circuitPoints`)
        .pipe(catchError(this.handleError))
    ).then((setup) => {
      this.constantsSync = setup;
      return setup;
    });
  }

  private handleError(res: HttpErrorResponse) {
    console.error(res.error);
    return observableThrowError(res.error || 'Server error');
  }
}
