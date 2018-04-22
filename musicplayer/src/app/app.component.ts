import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs/Observable';

import { AlbumModel, GetAlbums, Play, Stop } from './app.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  @Select(state => state.music.albums) albums$: Observable<AlbumModel[]>;

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this.getAlbums();
  }

  getAlbums() {
    this.store.dispatch(new GetAlbums());
  }

  play() {
    this.store.dispatch(new Play());
  }

  stop() {
    this.store.dispatch(new Stop());
  }

}
