import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AlbumModel } from '../store/player.model';
import { PlayAlbum } from '../store/player.actions';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumsComponent implements OnInit {
  @Select(state => state.music.albums)
  albums$: Observable<AlbumModel[]>;

  constructor(private store: Store) {}

  ngOnInit() {}

  playAlbum(album: AlbumModel) {
    this.store.dispatch(new PlayAlbum({ service: 'mpd', uri: album.uri }));
  }
}
