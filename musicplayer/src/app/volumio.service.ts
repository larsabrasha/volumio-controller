import { Injectable, OnInit } from '@angular/core';
import * as io from 'socket.io-client';

@Injectable()
export class VolumioService {
  socket: any;

  constructor() {
    this.socket = io('http://volumio.local');

    this.socket.on('connect', (data) => {
      console.log('connect');
      console.log(data);
    });

    this.socket.on('pushBrowseLibrary', (data) => {
      console.log('pushBrowseLibrary');
      console.log(data);
    });

    this.socket.on('disconnect', (data) => {
      console.log('disconnect');
      console.log(data);
    });
  }

  getAlbums() {
    this.socket.emit('browseLibrary', {
      uri: 'albums://',
      // uri: 'music-library'
    });
  }

  play() {
    this.socket.emit('play');
  }

  stop() {
    this.socket.emit('stop');
  }

}
