import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { TablePageComponent } from './table-page.component';
import { ChartPageComponent } from './chart-page.component';
import { RosterManiaPageComponent } from './roster-mania/roster-mania-page.component';
import { RosterPageComponent } from './rosters/roster-page.component';
import { OwcsCircuitPointsPageComponent } from './owcs-team-points/owcs-circuit-points-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'tables', component: TablePageComponent, data: { season: '2021' } },
  { path: 'charts', component: ChartPageComponent, data: { season: '2021' } },
  { path: '2022tables', component: TablePageComponent, data: { season: '2022' } },
  { path: '2022charts', component: ChartPageComponent, data: { season: '2022' } },
  { path: '2023tables', component: TablePageComponent, data: { season: '2023' } },
  { path: '2023charts', component: ChartPageComponent, data: { season: '2023' } },
  { path: 'owcs-roster-mania', component: RosterManiaPageComponent },
  { path: 'owcs-rosters', component: RosterPageComponent },
  { path: 'owcs-circuit-points', component: OwcsCircuitPointsPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
