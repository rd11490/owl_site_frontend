import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { ChartPageComponent } from './chart-page.component';
import { WinRatesPageComponent } from './win-rates-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: '2018charts', component: ChartPageComponent, data: { season: '2018' } },
  { path: '2019charts', component: ChartPageComponent, data: { season: '2019' } },
  { path: '2020charts', component: ChartPageComponent, data: { season: '2020' } },
  { path: 'charts', component: ChartPageComponent, data: { season: '2021' } },
  { path: '2022charts', component: ChartPageComponent, data: { season: '2022' } },
  { path: '2023charts', component: ChartPageComponent, data: { season: '2023' } },
  { path: 'winrates', component: WinRatesPageComponent },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
