import { Injectable } from '@angular/core';
import { getRandomInt } from './util';

@Injectable({
  providedIn: 'root',
})
export class PictureService {
  constructor() {}

  getImages(total = 20){
    const images = new Set<number>();

    while (images.size < total){
      images.add(getRandomInt(1,100));
    }
    return [...images].map(image => `https://github.com/jminuscula/dixit-online/blob/master/cards/card_${image.toString().padStart(5, '0')}.jpg?raw=true`);
  }
  
}
