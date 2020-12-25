import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PictureService {

  constructor(private http: HttpClient) { }

  getPicture(){
    return this.http.get('https://picsum.photos/id/237/200/300', { responseType: 'blob' });
  }
}
