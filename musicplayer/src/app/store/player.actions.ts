export class GetPlayerState {
  static readonly type = 'Get Player State';
}

export class GetAlbums {
  static readonly type = 'Get Albums';
}

export class GetQueue {
  static readonly type = 'Get Queue';
}

export class GetAlbumsSuccess {
  static readonly type = 'Get Albums Success';
  constructor(public payload: any) {}
}

export class PushQueue {
  static readonly type = 'PushQueue';
  constructor(public payload: any) {}
}

export class PushState {
  static readonly type = 'PushState';
  constructor(public payload: any) {}
}

export class Play {
  static readonly type = 'Play';
}

export class Pause {
  static readonly type = 'Pause';
}

export class Stop {
  static readonly type = 'Stop';
}

export class Previous {
  static readonly type = 'Previous';
}

export class Next {
  static readonly type = 'Next';
}

export class SetRandom {
  static readonly type = 'ToggleRandom';
  constructor(public payload: boolean) {}
}

export class SetRepeat {
  static readonly type = 'ToggleRepeat';
  constructor(public payload: boolean) {}
}

export class PlayQueueItemAtIndex {
  static readonly type = 'Play Queue Item At Index';
  constructor(public payload: number) {}
}

export class ClearQueue {
  static readonly type = 'Clear Queue';
}

export class PlayAlbum {
  static readonly type = 'Play Album';
  constructor(public payload: { service: string; uri: string }) {}
}
