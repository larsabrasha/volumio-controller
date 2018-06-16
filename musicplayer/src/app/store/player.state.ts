import { Action, State, Store, StateContext } from '@ngxs/store';

import { VolumioService } from './../volumio.service';
import { IVolumioServiceListener } from './../volumio.service.listener';
import * as actions from './player.actions';
import { AppStateModel } from './player.model';

@State<AppStateModel>({
  name: 'music',
  defaults: {
    albums: [],
    playerState: null,
  },
})
export class AppState implements IVolumioServiceListener {
  constructor(private volumioService: VolumioService, private store: Store) {
    this.volumioService.addListener(this);
  }

  onPushBrowseLibrary(data: any) {
    this.store.dispatch(new actions.GetAlbumsSuccess(data));
  }

  onPushState(data: any) {
    this.store.dispatch(new actions.PushState(data));
  }

  @Action(actions.GetPlayerState)
  getPlayerState() {
    this.volumioService.getPlayerState();
  }

  @Action(actions.GetAlbums)
  getAlbums({ getState, setState }: StateContext<AppStateModel>) {
    this.volumioService.getAlbums();
  }

  @Action(actions.GetAlbumsSuccess)
  getAlbumsSuccess(
    { getState, setState }: StateContext<AppStateModel>,
    { payload }
  ) {
    const state = getState();
    state.albums = payload.navigation.lists[0].items.map(item => ({
      albumart: item.albumart,
      uri: item.uri,
      artist: item.artist,
      name: item.title,
    }));
    setState(state);
  }

  @Action(actions.PushState)
  pushState({ getState, setState }: StateContext<AppStateModel>, { payload }) {
    const state = getState();
    state.playerState = payload;
    setState(state);
  }

  @Action(actions.Play)
  play({ getState, setState }: StateContext<AppStateModel>) {
    this.volumioService.play();
  }

  @Action(actions.Stop)
  stop({ getState, setState }: StateContext<AppStateModel>) {
    this.volumioService.stop();
  }

  @Action(actions.PlayAlbum)
  playAlbum({ getState, setState }: StateContext<AppStateModel>, { payload }) {
    this.volumioService.replaceAndPlay({ service: 'mpd', uri: payload.uri });
  }
}
