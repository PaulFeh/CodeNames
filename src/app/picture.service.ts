import { Injectable } from '@angular/core';
import { shuffle } from './util';

@Injectable({
  providedIn: 'root',
})
export class PictureService {
  constructor() {}

  getImages(total = 20): string[] {
    const totalImages = 100;
    let imgArray = Array.from(Array(totalImages), (e, i) => i + 1);
    imgArray = shuffle(imgArray);

    imgArray = imgArray
      .filter((val) => {
        const duplicates = [24, 45];
        return !duplicates.includes(val);
      })
      .slice(0, total);

    return imgArray.map(
      (image) =>
        `https://github.com/jminuscula/dixit-online/blob/master/cards/card_${image
          .toString()
          .padStart(5, '0')}.jpg?raw=true`
    );
  }
}
