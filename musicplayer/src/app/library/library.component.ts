import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { GenreModel } from '../store/player.model';
import { Observable } from 'rxjs';
import { GetGenres } from '../store/player.actions';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryComponent implements OnInit {
  @Select(state => state.music.genres)
  genres$: Observable<GenreModel[]>;

  constructor(private store: Store) {
    this.store.dispatch(new GetGenres());
  }

  ngOnInit() {}
}
