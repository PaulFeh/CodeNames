import { Injectable } from '@angular/core';
import { shuffle } from './util';

@Injectable({
  providedIn: 'root',
})
export class PictureService {
  constructor() {}

  getImages(total = 20, previousCards?: number[]): string[] {
    const totalImages = 337;
    let imgArray = Array.from(Array(totalImages), (e, i) => i + 1);
    imgArray = shuffle(imgArray);

    imgArray = imgArray
      .filter((val) => {
        return !previousCards?.includes(val);
      })
      .slice(0, total);

    return imgArray.map(
      (image) =>
        `https://raw.githubusercontent.com/vietthehand/CodeNames/master/cards/card%20(${image}).jpg`
    );
  }
}
