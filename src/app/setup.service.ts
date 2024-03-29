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
