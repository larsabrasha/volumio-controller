import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { INSPECT_MAX_BYTES } from 'buffer';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent {
  @Input() value: number;
  @Input() min: number = 0;
  @Input() max: number = 100;

  @Output() valueChange = new EventEmitter<number>();

  onInput($event: Event) {
    const value = parseInt(($event.target as HTMLInputElement).value);
    this.valueChange.emit(value);
  }
}
