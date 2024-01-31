
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {Log} from '../models/log';

@Injectable({
  providedIn: 'root'
})
export class ServerBackendService {

  constructor(private http: HttpClient) { }

  getAllLogs(): Observable<HttpResponse<Log[]>> {
    return this.http.get<Log[]>(`${environment.backendUrl}/logs`, { observe: 'response' });
  }
}
