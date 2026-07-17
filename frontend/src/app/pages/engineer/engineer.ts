import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
interface Incident {
  incidentId: string;
  title: string;
  priority: string;
  status: string;
  createdAt: string;
}
@Component({
  selector: 'app-engineer',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './engineer.html',
  styleUrl: './engineer.css',
})
export class Engineer {
  platformId = inject(PLATFORM_ID);
  engineerName: any;

  displayedColumns = [
    'incidentId',
    'title',
    'priority',
    'status',
    'createdAt',
    'action'
  ];


  incidents: Incident[] = [];


  constructor(
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.engineerName = localStorage.getItem('username');
    }
  }


  ngOnInit() {

    this.incidents = [

      {
        incidentId: 'INC-001',
        title: 'API Down',
        priority: 'Critical',
        status: 'Pending',
        createdAt: '17-Jul-2026'
      },

      {
        incidentId: 'INC-002',
        title: 'Database Timeout',
        priority: 'High',
        status: 'InProgress',
        createdAt: '17-Jul-2026'
      }

    ];

  }


  logout() {

    localStorage.clear();

    this.router.navigate(['/login']);

  }
}
