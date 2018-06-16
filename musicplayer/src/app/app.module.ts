import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';
import { AppComponent } from './app.component';
import { VolumioService } from './volumio.service';
import { AppState } from './store/player.state';
import { PlayerstatusComponent } from './playerstatus/playerstatus.component';
import { AlbumsComponent } from './albums/albums.component';

@NgModule({
  declarations: [AppComponent, PlayerstatusComponent, AlbumsComponent],
  imports: [
    BrowserModule,
    NgxsModule.forRoot([AppState]),
    NgxsReduxDevtoolsPluginModule.forRoot(),
  ],
  providers: [VolumioService],
  bootstrap: [AppComponent],
})
export class AppModule {}
