import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { ChartPageComponent } from './chart-page.component';
import { HomeComponent } from './home.component';
import { NavigationComponent } from './navigation.component';
import { NgModule } from '@angular/core';
import { SetupService } from './setup.service';
import { TablePageComponent } from './table-page.component';
import { SelectorComponent } from './query-options/selector.component';
import { HttpClientModule } from '@angular/common/http';
import { SelectTeamComponent } from './query-options/select-team.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { QueryService } from './query.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SelectPlayerComponent } from './query-options/select-player.component';
import { SelectOpponentTeamComponent } from './query-options/select-opponent-team.component';
import { SelectCompositionComponent } from './query-options/select-composition.component';
import { SelectOpponentCompositionComponent } from './query-options/select-opponent-composition.component';
import { SelectHeroComponent } from './query-options/select-hero.component';
import { SelectMapTypeComponent } from './query-options/select-map-type.component';
import { SelectMapNameComponent } from './query-options/select-map-name.component';
import { SelectAggregationTypeComponent } from './query-options/select-aggregation-type.component';
import { SelectStageComponent } from './query-options/select-stage.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { PlotComponent } from './plot.component';
import { ChartService } from './chart.service';
import { SelectXStatComponent } from './chart-options/select-x-stat.component';
import { SelectYStatComponent } from './chart-options/select-y-stat.component';
import { SelectXStatDenomComponent } from './chart-options/select-x-stat-denom.component';
import { SelectYStatDenomComponent } from './chart-options/select-y-stat-denom.component';
import { SelectSizeComponent } from './chart-options/select-size.component';
import { TimePlayedFilterComponent } from './chart-options/time-played-filter.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { CircuitPointService } from './circuitPoint.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RosterService } from './roster.service';
import { RosterPageComponent } from './rosters/roster-page.component';
import { RosterComponent } from './rosters/roster.component';

@NgModule({
  declarations: [
    AppComponent,
    ChartPageComponent,
    HomeComponent,
    NavigationComponent,
    PlotComponent,
    SelectAggregationTypeComponent,
    SelectCompositionComponent,
    SelectHeroComponent,
    SelectMapNameComponent,
    SelectMapTypeComponent,
    SelectOpponentCompositionComponent,
    SelectOpponentTeamComponent,
    SelectorComponent,
    SelectPlayerComponent,
    SelectSizeComponent,
    SelectStageComponent,
    SelectTeamComponent,
    SelectXStatComponent,
    SelectXStatDenomComponent,
    SelectYStatComponent,
    SelectYStatDenomComponent,
    TablePageComponent,
    TimePlayedFilterComponent,
    RosterPageComponent,
    RosterComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    NgSelectModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatGridListModule,
    DragDropModule,
  ],
  providers: [SetupService, QueryService, ChartService, CircuitPointService, RosterService],
  bootstrap: [AppComponent],
})
export class AppModule {}
