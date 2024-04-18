import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, throwError as observableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FaceitRosterResponse, initialFaceitRosterResponse } from './models';

@Injectable({
  providedIn: 'root',
})
export class RosterService {
  public constants: Promise<FaceitRosterResponse> = Promise.resolve(initialFaceitRosterResponse);
  public constantsSync: FaceitRosterResponse = initialFaceitRosterResponse;

  constructor(private http: HttpClient) {}

  getRosters(): void {
    this.constants = firstValueFrom(
      this.http
        .get<FaceitRosterResponse>(`https://mb1m37u0ig.execute-api.us-east-1.amazonaws.com/dev/faceitRosters`)
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
