import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { TablePageComponent } from './table-page.component';
import { ChartPageComponent } from './chart-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'tables', component: TablePageComponent, data: { season: '2021' } },
  { path: 'charts', component: ChartPageComponent, data: { season: '2021' } },
  { path: '2022tables', component: TablePageComponent, data: { season: '2022' } },
  { path: '2022charts', component: ChartPageComponent, data: { season: '2022' } },
  { path: '2023tables', component: TablePageComponent, data: { season: '2023' } },
  { path: '2023charts', component: ChartPageComponent, data: { season: '2023' } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
