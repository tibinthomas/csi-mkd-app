import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(private http: HttpClient) {}

  uploadFileToAzure(file: File, sasUrl: string): Observable<string> {
    return this.http
      .put(JSON.parse(sasUrl).url, file, {
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type,
          'X-Skip-Interceptor': '', // <== This will bypass the Authorization header
        },
        observe: 'response',
      })
      .pipe(
        map(() => JSON.parse(sasUrl).url.split('?')[0]), // Return public blob URL without SAS token
        catchError((error) => {
          console.error('Azure upload failed:', error);
          return throwError(() => new Error('File upload to Azure failed.'));
        })
      );
  }
}
