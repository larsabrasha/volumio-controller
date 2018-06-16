export interface AlbumModel {
  albumart: string;
  name: string;
  artist: string;
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
