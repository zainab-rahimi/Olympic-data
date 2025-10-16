import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { Olympic } from 'src/app/core/models/olympic.model';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { takeUntil, map, filter, take } from 'rxjs/operators';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { curveLinear } from 'd3-shape';


@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
  standalone: false
})
export class CountryComponent implements OnInit, OnDestroy {

  public country$: Observable<Olympic | undefined> = of(undefined);
  public chartData$: Observable<any[]> = of([]);
  public destroy$ = new Subject<void>();
  
  // Chart configuration
  public xAxisLabel = 'Dates';
  public yAxisLabel = 'Medals';
  public showXAxisLabel = true;
  public showYAxisLabel = true;
  public xAxisTickFormatting = (value: any) => value.toString();
  public colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#007BFF'] 
  };

  public xAxis: boolean = true;
  public yAxis: boolean = true;
  public curve = curveLinear;
  public showGridLines: boolean = true;
  public rangeFillOpacity: number = 0.15;
  public timeline = false;
  public autoScale = true;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {}

  ngOnInit(): void {
    const countryId = this.route.snapshot.paramMap.get('id');
    if (countryId) {
      // Wait for olympics data to be loaded (skip empty array)
      this.olympicService.getOlympics().pipe(
        filter(olympics => olympics.length > 0),
        take(1),
        takeUntil(this.destroy$)
      ).subscribe(olympics => {
        const country = olympics.find(olympic => olympic.id === +countryId);
        if (!country) {
          this.router.navigate(['/not-found']);
        } else {
          this.country$ = of(country);
          this.prepareChartData(+countryId);
        }
      });
    } else {
      this.router.navigate(['/not-found']);
    }
  }

  private prepareChartData(countryId: number): void {
    this.chartData$ = this.olympicService.getOlympicById(countryId).pipe(
      map(country => {
        if (!country) return [];
        
        return [{
          name: country.country,
          series: country.participations
            .sort((a, b) => a.year - b.year)
            .map(participation => ({
              name: participation.year.toString(),
              value: participation.medalsCount
            }))
        }];
      }),
      takeUntil(this.destroy$)
    );
  }

  public getTotalMedals(country: Olympic): number {
    return country.participations.reduce((total, participation) => total + participation.medalsCount, 0);
  }

  public getTotalAthletes(country: Olympic): number {
    return country.participations.reduce((total, participation) => total + participation.athleteCount, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
