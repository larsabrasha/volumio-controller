import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import * as actions from './store/player.actions';
import {
  Next,
  PlayPause,
  Previous,
  VolumeUp,
  VolumeDown,
} from './store/player.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(private store: Store, private hotkeysService: HotkeysService) {
    this.store.dispatch(new actions.GetQueue());
    this.store.dispatch(new actions.GetPlayerState());

    this.addHotKey('space', new PlayPause());
    this.addHotKey('left', new Previous());
    this.addHotKey('right', new Next());
    this.addHotKey('up', new VolumeUp());
    this.addHotKey('down', new VolumeDown());
  }

  addHotKey(combo: string | string[], action: any) {
    this.hotkeysService.add(
      new Hotkey(combo, () => {
        this.store.dispatch(action);
        return false;
      })
    );
  }

  ngOnInit(): void {}
}
