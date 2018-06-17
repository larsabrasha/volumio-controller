import { Action, State, Store, StateContext } from '@ngxs/store';

import { VolumioService } from './../volumio.service';
import { IVolumioServiceListener } from './../volumio.service.listener';
import * as actions from './player.actions';
import { AppStateModel } from './player.model';

@State<AppStateModel>({
  name: 'music',
  defaults: {
    albums: [],
    queue: [],
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

  onPushQueue(data: any) {
    this.store.dispatch(new actions.PushQueue(data));
  }

  onPushState(data: any) {
    this.store.dispatch(new actions.PushState(data));
  }

  @Action(actions.GetPlayerState)
  getPlayerState() {
    this.volumioService.getPlayerState();
  }

  @Action(actions.GetAlbums)
  getAlbums() {
    this.volumioService.getAlbums();
  }

  @Action(actions.GetQueue)
  getQueue() {
    this.volumioService.getQueue();
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

  @Action(actions.PushQueue)
  pushQueue({ getState, setState }: StateContext<AppStateModel>, { payload }) {
    const state = getState();
    state.queue = payload;
    setState(state);
  }

  @Action(actions.PushState)
  pushState({ getState, setState }: StateContext<AppStateModel>, { payload }) {
    const state = getState();
    state.playerState = payload;
    setState(state);
  }

  @Action(actions.Play)
  play(context: StateContext<AppStateModel>) {
    const state = context.getState();
    context.patchState({
      playerState: {
        ...state.playerState,
        status: 'play',
      },
    });
    this.volumioService.play();
  }

  @Action(actions.Pause)
  pause(context: StateContext<AppStateModel>) {
    const state = context.getState();
    context.patchState({
      playerState: {
        ...state.playerState,
        status: 'pause',
      },
    });
    this.volumioService.pause();
  }

  @Action(actions.Stop)
  stop(context: StateContext<AppStateModel>) {
    const state = context.getState();
    context.patchState({
      playerState: {
        ...state.playerState,
        status: 'stop',
      },
    });
    this.volumioService.stop();
  }

  @Action(actions.Previous)
  previous() {
    this.volumioService.previous();
  }

  @Action(actions.Next)
  next() {
    this.volumioService.next();
  }

  @Action(actions.SetRandom)
  toggleRandom(
    context: StateContext<AppStateModel>,
    action: actions.SetRandom
  ) {
    const state = context.getState();
    context.patchState({
      playerState: {
        ...state.playerState,
        random: action.payload,
      },
    });
    this.volumioService.toggleRandom(action.payload);
  }

  @Action(actions.SetRepeat)
  toggleRepeat(
    context: StateContext<AppStateModel>,
    action: actions.SetRepeat
  ) {
    const state = context.getState();
    context.patchState({
      playerState: {
        ...state.playerState,
        repeat: action.payload,
      },
    });
    this.volumioService.toggleRepeat(action.payload);
  }

  @Action(actions.PlayAlbum)
  playAlbum(context: StateContext<AppStateModel>, action: actions.PlayAlbum) {
    this.volumioService.replaceAndPlay({
      service: 'mpd',
      uri: action.payload.uri,
    });
  }

  @Action(actions.PlayQueueItemAtIndex)
  playQueueItemAtIndex(
    context: StateContext<AppStateModel>,
    action: actions.PlayQueueItemAtIndex
  ) {
    this.volumioService.playQueueItemAtIndex(action.payload);
  }

  @Action(actions.ClearQueue)
  clearQueue() {
    this.volumioService.clearQueue();
  }
}
