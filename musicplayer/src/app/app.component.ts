import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { AlbumModel, GetAlbums, GetPlayerState, Play, PlayAlbum, PlayerState, Stop } from './app.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  @Select(state => state.music.albums) albums$: Observable<AlbumModel[]>;
  @Select(state => state.music.playerState) playerState$: Observable<PlayerState>;

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this.store.dispatch(new GetPlayerState());
    this.store.dispatch(new GetAlbums());
  }

  play() {
    this.store.dispatch(new Play());
  }

  stop() {
    this.store.dispatch(new Stop());
  }

  playAlbum(album: AlbumModel) {
    this.store.dispatch(new PlayAlbum({service: 'mpd', uri: album.uri}));
  }

}
