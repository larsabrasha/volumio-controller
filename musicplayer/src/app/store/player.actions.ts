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
  constructor(public payload: { service: string; uri: string }) {}
}
