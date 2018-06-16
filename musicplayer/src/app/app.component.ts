import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import * as actions from './store/player.actions';
import * as playerModel from './store/player.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'app';

  @Select(state => state.music.albums)
  albums$: Observable<playerModel.AlbumModel[]>;
  @Select(state => state.music.playerState)
  playerState$: Observable<playerModel.PlayerState>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(new actions.GetPlayerState());
    this.store.dispatch(new actions.GetAlbums());
  }

  play() {
    this.store.dispatch(new actions.Play());
  }

  stop() {
    this.store.dispatch(new actions.Stop());
  }

  playAlbum(album: playerModel.AlbumModel) {
    this.store.dispatch(
      new actions.PlayAlbum({ service: 'mpd', uri: album.uri }),
    );
  }
}
