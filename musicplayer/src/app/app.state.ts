import { Action, State, Store, StateContext } from '@ngxs/store';

import { VolumioService } from './volumio.service';
import { IVolumioServiceListener } from './volumio.service.listener';

// Actions

export class GetAlbums {
  static readonly type = 'Get Albums';
}

export class GetAlbumsSuccess {
  static readonly type = 'Get Albums Success';
  constructor(public payload: any) {}
}

export class Play {
  static readonly type = 'Play';
}

export class Stop {
  static readonly type = 'Stop';
}


// Model

export class AlbumModel {
  albumart: string;
  uri: string;
}

export class AppStateModel {
  albums: AlbumModel[];
}


// State

@State<AppStateModel>({
  name: 'music',
  defaults: {albums: []}
})
export class AppState implements IVolumioServiceListener {

  constructor(private volumioService: VolumioService, private store: Store) {
    this.volumioService.addListener(this);
  }

  onPushBrowseLibrary(data: any) {
    this.store.dispatch(new GetAlbumsSuccess(data));
  }

  @Action(GetAlbums)
  getAlbums({ getState, setState }: StateContext<AppStateModel>) {
    this.volumioService.getAlbums();

    const state = getState();
    state.albums = [];
    setState(state);
  }

  @Action(GetAlbumsSuccess)
  getAlbumsSuccess({ getState, setState }: StateContext<AppStateModel>, { payload }) {
    const state = getState();
    state.albums = payload.navigation.lists[0].items.map(item => ({albumart: item.albumart, uri: item.uri}));
    setState(state);
  }

  @Action(Play)
  play({ getState, setState }: StateContext<AppStateModel>) {
    this.volumioService.play();
  }

  @Action(Stop)
  stop({ getState, setState }: StateContext<AppStateModel>) {
    this.volumioService.stop();
  }
}
