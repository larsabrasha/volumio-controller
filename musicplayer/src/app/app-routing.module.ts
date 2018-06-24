import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlbumsComponent } from './albums/albums.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { GenreComponent } from './genre/genre.component';

const routes: Routes = [
  { path: '', redirectTo: 'albums', pathMatch: 'full' },
  {
    path: 'albums',
    component: AlbumsComponent,
  },
  {
    path: 'genres/:genre',
    pathMatch: 'full',
    component: GenreComponent,
  },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
