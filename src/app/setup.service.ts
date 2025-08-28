import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, throwError as observableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { intialSetup, SetupResponse } from './models';

@Injectable({
  providedIn: 'root',
})
export class SetupService {
  public constants: Promise<SetupResponse> = Promise.resolve(intialSetup);
  public constantsSync: SetupResponse = intialSetup;

  constructor(private http: HttpClient) {}

  getSetup(season: string): void {
    this.constants = firstValueFrom(
      this.http
        .get<SetupResponse>(`https://mb1m37u0ig.execute-api.us-east-1.amazonaws.com/dev/setup?season=${season}`)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('An error occurred:', error);
            return observableThrowError(() => new Error(error.message || 'Server error'));
          })
        )
    ).then(
      (setup) => {
        this.constantsSync = setup;
        return setup;
      },
      (error) => {
        console.error('Failed to get setup:', error);
        return intialSetup;
      }
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return observableThrowError(() => new Error(error.message || 'Server error'));
  }
}
