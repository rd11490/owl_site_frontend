import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';

// Material Modules
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
// Import async pipe
import { AsyncPipe } from '@angular/common';

// Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ChartPageComponent } from './chart-page.component';
import { HomeComponent } from './home.component';
import { NavigationComponent } from './navigation.component';
import { PlotComponent } from './plot.component';
import { WinRatesPageComponent } from './win-rates-page.component';
// Win Rate Selector Components
import { RankSelectorComponent } from './win-rate-selectors/rank-selector.component';
import { RegionSelectorComponent } from './win-rate-selectors/region-selector.component';
import { MapSelectorComponent } from './win-rate-selectors/map-selector.component';
import { HeroSelectorComponent } from './win-rate-selectors/hero-selector.component';
import { DateRangeSelectorComponent } from './win-rate-selectors/date-range-selector.component';
import { MetricSelectorComponent } from './win-rate-selectors/metric-selector.component';
import { WinRatePlotComponent } from './win-rate-selectors/win-rate-plot.component';

// Query Option Components
import { SelectorComponent } from './query-options/selector.component';
import { SelectTeamComponent } from './query-options/select-team.component';
import { SelectPlayerComponent } from './query-options/select-player.component';
import { SelectOpponentTeamComponent } from './query-options/select-opponent-team.component';
import { SelectCompositionComponent } from './query-options/select-composition.component';
import { SelectOpponentCompositionComponent } from './query-options/select-opponent-composition.component';
import { SelectHeroComponent } from './query-options/select-hero.component';
import { SelectMapTypeComponent } from './query-options/select-map-type.component';
import { SelectMapNameComponent } from './query-options/select-map-name.component';
import { SelectAggregationTypeComponent } from './query-options/select-aggregation-type.component';
import { SelectStageComponent } from './query-options/select-stage.component';

// Chart Option Components
import { SelectXStatComponent } from './chart-options/select-x-stat.component';
import { SelectYStatComponent } from './chart-options/select-y-stat.component';
import { SelectXStatDenomComponent } from './chart-options/select-x-stat-denom.component';
import { SelectYStatDenomComponent } from './chart-options/select-y-stat-denom.component';
import { SelectSizeComponent } from './chart-options/select-size.component';
import { TimePlayedFilterComponent } from './chart-options/time-played-filter.component';

// Services
import { SetupService } from './setup.service';
import { QueryService } from './query.service';
import { ChartService } from './chart.service';
import { CircuitPointService } from './circuitPoint.service';

@NgModule({
  declarations: [
    AppComponent,
    ChartPageComponent,
    HomeComponent,
    NavigationComponent,
    PlotComponent,
    // Win Rate Selector Components
    RankSelectorComponent,
    RegionSelectorComponent,
    MapSelectorComponent,
    HeroSelectorComponent,
    DateRangeSelectorComponent,
    MetricSelectorComponent,
    WinRatePlotComponent,
    WinRatesPageComponent,
    // Query Option Components
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
    TimePlayedFilterComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    DragDropModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatOptionModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatRadioModule,
    NgSelectModule,
    ReactiveFormsModule,
  ],
  providers: [
    AsyncPipe,
    SetupService,
    QueryService,
    ChartService,
    CircuitPointService,
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'YYYY-MM-DD',
        },
        display: {
          dateInput: 'YYYY-MM-DD',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
