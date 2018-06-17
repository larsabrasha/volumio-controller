import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

import { IVolumioServiceListener } from './volumio.service.listener';

@Injectable()
export class VolumioService {
  socket: any;
  listeners: IVolumioServiceListener[] = [];

  constructor() {
    this.socket = io('http://volumio.local');

    this.socket.on('connect', () => {
      console.log('connect');
    });

    this.socket.on('pushBrowseLibrary', data => {
      this.listeners.forEach(listener => {
        listener.onPushBrowseLibrary(data);
      });
    });

    this.socket.on('pushQueue', data => {
      this.listeners.forEach(listener => {
        listener.onPushQueue(data);
      });
    });

    this.socket.on('pushState', data => {
      this.listeners.forEach(listener => {
        listener.onPushState(data);
      });
    });

    this.socket.on('disconnect', () => {
      console.log('disconnect');
    });
  }

  addListener(listener: IVolumioServiceListener) {
    this.listeners.push(listener);
  }

  getPlayerState() {
    this.socket.emit('getState');
  }

  getAlbums() {
    this.socket.emit('browseLibrary', {
      uri: 'albums://',
    });
  }

  getQueue() {
    this.socket.emit('getQueue');
  }

  replaceAndPlay(payload: { service: string; uri: string }) {
    this.socket.emit('replaceAndPlay', {
      service: payload.service,
      uri: payload.uri,
    });
  }

  play() {
    this.socket.emit('play');
  }

  pause() {
    this.socket.emit('pause');
  }

  stop() {
    this.socket.emit('stop');
  }

  previous() {
    this.socket.emit('prev');
  }

  next() {
    this.socket.emit('next');
  }

  setRandom(value: boolean) {
    this.socket.emit('setRandom', { value });
  }

  setRepeat(value: boolean) {
    this.socket.emit('setRepeat', { value });
  }

  setVolume(value: number) {
    this.socket.emit('volume', value);
  }

  playQueueItemAtIndex(index: number) {
    this.socket.emit('play', { value: index });
  }

  clearQueue() {
    this.socket.emit('clearQueue');
  }
}
