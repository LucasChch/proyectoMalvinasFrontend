import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'http://localhost:3000'; // Asegurate de que coincida con la URL de tu backend

  constructor(private http: HttpClient) {}

  sendEmail(emails: string[], subject: string, message: string): Observable<any> {
    console.log(emails, subject, message);
    return this.http.post(`${this.apiUrl}/send-email`, { emails, subject, message });
  }
}
