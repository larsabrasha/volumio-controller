import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';
import { AppComponent } from './app.component';
import { VolumioService } from './volumio.service';
import { AppState } from './store/player.state';
import { PlayerstatusComponent } from './playerstatus/playerstatus.component';
import { AlbumsComponent } from './albums/albums.component';
import { LibraryComponent } from './library/library.component';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { environment } from '../environments/environment';
import { MinuteSecondsPipe } from './minute-seconds.pipe';
import { PlaylistComponent } from './playlist/playlist.component';
import { SliderComponent } from './slider/slider.component';
import { HotkeyModule } from 'angular2-hotkeys';

@NgModule({
  declarations: [
    AppComponent,
    PlayerstatusComponent,
    AlbumsComponent,
    LibraryComponent,
    MinuteSecondsPipe,
    PlaylistComponent,
    SliderComponent,
  ],
  imports: [
    BrowserModule,
    HotkeyModule.forRoot(),
    NgxsModule.forRoot([AppState]),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
    }),
    // NgxsLoggerPluginModule.forRoot({
    //   disabled: environment.production,
    // }),
  ],
  providers: [VolumioService],
  bootstrap: [AppComponent],
})
export class AppModule {}
