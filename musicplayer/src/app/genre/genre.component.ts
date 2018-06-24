import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { LoadGenre, PlayAlbum } from '../store/player.actions';
import { GenreModel, AlbumModel } from '../store/player.model';
import { RouterStateModel } from '@ngxs/router-plugin/src/router.state';
import { RouterStateSnapshot } from '@angular/router';

@Component({
  selector: 'app-genre',
  templateUrl: './genre.component.html',
  styleUrls: ['./genre.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenreComponent implements OnInit {
  @Select(state => state.music.genreAlbums)
  genreAlbums$: Observable<AlbumModel[]>;

  constructor(private store: Store) {
    const router: Observable<any> = this.store.select(state => state.router);
    router.subscribe(router => {
      const state = router.state as RouterStateSnapshot;
      const genre = state.root.firstChild.params['genre'];
      console.log('state: ' + JSON.stringify(state));

      store.dispatch(new LoadGenre(genre));
    });
  }

  ngOnInit() {}

  playAlbum(album: AlbumModel) {
    console.log(album.uri);
    this.store.dispatch(new PlayAlbum({ service: 'mpd', uri: album.uri }));
  }
}
