import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minuteSeconds',
})
export class MinuteSecondsPipe implements PipeTransform {
  transform(value: number): string {
    if (value != null) {
      const minutes = Math.floor(value / 60);
      const seconds = value - minutes * 60;
      return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }
    return '';
  }
}
