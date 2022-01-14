import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, throwError as observableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { intialSetup, SetupResponse } from './models';

@Injectable({
  providedIn: 'root',
})
export class SetupService {
  public constants: Promise<SetupResponse> = Promise.resolve(intialSetup);

  constructor(private http: HttpClient) {
    this.constants = this.getSetup();
  }

  getSetup(): Promise<SetupResponse> {
    return firstValueFrom(
      this.http
        .get<SetupResponse>('https://mb1m37u0ig.execute-api.us-east-1.amazonaws.com/dev/setup')
        .pipe(catchError(this.handleError))
    );
  }

  private handleError(res: HttpErrorResponse) {
    console.error(res.error);
    return observableThrowError(res.error || 'Server error');
  }
}
