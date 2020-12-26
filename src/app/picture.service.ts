import { Injectable } from '@angular/core';
import { getRandomInt } from './util';

@Injectable({
  providedIn: 'root',
})
export class PictureService {
  constructor() {}

  getImages(total = 20) {
    const images = new Set<number>();
    const totalImages = 100;

    while (images.size < total) {
      let rand = getRandomInt(1, totalImages);
      const duplicates = [24, 45];
      if (!duplicates.includes(rand)) {
        images.add(rand);
      }
    }

    return [...images].map(
      (image) =>
        `https://github.com/jminuscula/dixit-online/blob/master/cards/card_${image
          .toString()
          .padStart(5, '0')}.jpg?raw=true`
    );
  }
}
