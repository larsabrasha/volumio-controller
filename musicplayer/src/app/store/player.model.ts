export interface AlbumModel {
  title: string;
  albumart: string;
  name: string;
  artist: string;
  uri: string;
}

export interface GenreModel {
  title: string;
  uri: string;
}

export interface QueueItem {
  album: string;
  albumart: string;
  artist: string;
  duration: number;
  name: string;
  service: string;
  trackType: string;
  tracknumber: number;
  type: string;
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
  genres: GenreModel[];
  genreAlbums: AlbumModel[];
  queue: QueueItem[];
  playerState: PlayerState;
}
