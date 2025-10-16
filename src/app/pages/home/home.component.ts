import { Component, OnInit } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Olympic } from 'src/app/core/models/olympic.model';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { PieChartData } from 'src/app/core/models/pie-chart-data.model';
import { LegendPosition, Color, ScaleType } from '@swimlane/ngx-charts';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit {
  public olympics$: Observable<Olympic[]> = of([]);
  public pieChartData$: Observable<PieChartData[]> = of([]);
  public olympicsData: Olympic[] = [];
  public numberOfJOs$: Observable<number> = of(0);

  // Chart configuration
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  legendPosition: LegendPosition = LegendPosition.Below;
  public colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#956065', '#b8cbe7', '#89a1db', '#793d52', '#9780a1']
  };



  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();
    
    // Store olympics data for navigation purposes
    this.olympics$.subscribe(data => {
      this.olympicsData = data;
    });
    
    // Calculate number of unique Olympic Games (JOs)
    this.numberOfJOs$ = this.olympics$.pipe(
      map(olympics => {
        const uniqueYears = new Set<number>();
        olympics.forEach(olympic => {
          olympic.participations.forEach(participation => {
            uniqueYears.add(participation.year);
          });
        });
        return uniqueYears.size;
      })
    );
    
    // transform the data to pie chart format
    this.pieChartData$ = this.olympics$.pipe(
      map(oly => {
        return oly.map(olympic => ({
          name: olympic.country,
          value: olympic.participations.reduce((total, participation) => total + participation.medalsCount, 0)
        }));
      })
    );
  }

  onPieChartSelect(event: any): void {
    const countryName = event.name;
    const olympic = this.olympicsData.find(o => o.country === countryName);
    
    if (olympic) {
      this.router.navigate([`/country/${olympic.id}`]);
    }
  }
}
