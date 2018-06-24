import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsModule } from '@ngxs/store';
import { HotkeyModule } from 'angular2-hotkeys';
import { environment } from '../environments/environment';
import { AlbumsComponent } from './albums/albums.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GenreComponent } from './genre/genre.component';
import { LibraryComponent } from './library/library.component';
import { MinuteSecondsPipe } from './minute-seconds.pipe';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PlayerstatusComponent } from './playerstatus/playerstatus.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { SliderComponent } from './slider/slider.component';
import { AppState } from './store/player.state';
import { VolumioService } from './volumio.service';

@NgModule({
  declarations: [
    AppComponent,
    PlayerstatusComponent,
    AlbumsComponent,
    LibraryComponent,
    MinuteSecondsPipe,
    PlaylistComponent,
    SliderComponent,
    PageNotFoundComponent,
    GenreComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HotkeyModule.forRoot(),
    NgxsModule.forRoot([AppState]),
    NgxsRouterPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
    }),
    NgxsLoggerPluginModule.forRoot({
      disabled: environment.production,
      collapsed: true,
    }),
  ],
  providers: [VolumioService],
  bootstrap: [AppComponent],
})
export class AppModule {}
