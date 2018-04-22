import { Action, State, Store, StateContext } from '@ngxs/store';

import { VolumioService } from './volumio.service';
import { IVolumioServiceListener } from './volumio.service.listener';

// Actions

export class GetPlayerState {
  static readonly type = 'Get Player State';
}

export class GetAlbums {
  static readonly type = 'Get Albums';
}

export class GetAlbumsSuccess {
  static readonly type = 'Get Albums Success';
  constructor(public payload: any) {}
}

export class PushState {
  static readonly type = 'PushState';
  constructor(public payload: any) {}
}

export class Play {
  static readonly type = 'Play';
}

export class Stop {
  static readonly type = 'Stop';
}

export class PlayAlbum {
  static readonly type = 'Play Album';
  constructor(public payload: {service: string, uri: string}) {}
}


// Model

export interface AlbumModel {
  albumart: string;
  uri: string;
}

export interface PlayerState {
  status: string;
  position: number;
  title: string;
  artist: string;
  album: string;
  albumart: string;
  uri: string;
  trackType: string;
  seek: number;
  duration: number;
  random: boolean;
  repeat: boolean;
  repeatSingle: boolean;
  consume: boolean;
  volume: number;
  mute: boolean;
  stream: string;
  updatedb: boolean;
  volatile: boolean;
  service: string;
}

export class AppStateModel {
  albums: AlbumModel[];
  playerState: PlayerState;
}


// State

@State<AppStateModel>({
  name: 'music',
  defaults: {
    albums: [],
    playerState: null
  }
})
export class AppState implements IVolumioServiceListener {

  constructor(private volumioService: VolumioService, private store: Store) {
    this.volumioService.addListener(this);
  }

  onPushBrowseLibrary(data: any) {
    this.store.dispatch(new GetAlbumsSuccess(data));
  }

  onPushState(data: any) {
    this.store.dispatch(new PushState(data));
  }

  @Action(GetPlayerState)
  getPlayerState() {
    this.volumioService.getPlayerState();
  }

  @Action(GetAlbums)
  getAlbums({ getState, setState }: StateContext<AppStateModel>) {
    this.volumioService.getAlbums();
  }

  @Action(GetAlbumsSuccess)
  getAlbumsSuccess({ getState, setState }: StateContext<AppStateModel>, { payload }) {
    const state = getState();
    state.albums = payload.navigation.lists[0].items.map(item => ({albumart: item.albumart, uri: item.uri}));
    setState(state);
  }

  @Action(PushState)
  pushState({ getState, setState }: StateContext<AppStateModel>, { payload }) {
    const state = getState();
    state.playerState = payload;
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

  @Action(PlayAlbum)
  playAlbum({ getState, setState }: StateContext<AppStateModel>, { payload }) {
    this.volumioService.replaceAndPlay({service: 'mpd', uri: payload.uri});
  }
}
