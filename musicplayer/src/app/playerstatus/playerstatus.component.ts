import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Play, Stop } from '../store/player.actions';
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

  stop() {
    this.store.dispatch(new Stop());
  }
}
