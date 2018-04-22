import { Component, OnInit } from '@angular/core';
import { VolumioService } from './volumio.service';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private volumioService: VolumioService) {
  }

  ngOnInit(): void {
    this.getAlbums();
  }

  getAlbums() {
    this.volumioService.getAlbums();
  }

  play() {
    this.volumioService.play();
  }

  stop() {
    this.volumioService.stop();
  }

}
