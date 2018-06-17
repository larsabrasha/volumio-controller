import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  Next,
  Pause,
  Play,
  Previous,
  SetRandom,
  SetRepeat,
  Stop,
  SetVolume,
} from '../store/player.actions';
import { PlayerState } from '../store/player.model';

@Component({
  selector: 'app-playerstatus',
  templateUrl: './playerstatus.component.html',
  styleUrls: ['./playerstatus.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerstatusComponent implements OnInit {
  @Select(state => state.music.playerState)
  playerState$: Observable<PlayerState>;

  constructor(private store: Store) {}

  ngOnInit() {}

  play() {
    this.store.dispatch(new Play());
  }

  pause() {
    this.store.dispatch(new Pause());
  }

  stop() {
    this.store.dispatch(new Stop());
  }

  previous() {
    this.store.dispatch(new Previous());
  }

  next() {
    this.store.dispatch(new Next());
  }

  setRandom(value: boolean) {
    this.store.dispatch(new SetRandom(value));
  }

  setRepeat(value: boolean) {
    this.store.dispatch(new SetRepeat(value));
  }

  volumeChange(value) {
    this.store.dispatch(new SetVolume(value));
  }

  mute() {
    this.store.dispatch(new SetVolume(0));
  }

  fullVolume() {
    this.store.dispatch(new SetVolume(100));
  }
}
