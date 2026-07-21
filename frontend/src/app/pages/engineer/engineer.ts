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
import { IncidentDetailsDialog } from '../incidents/incident-details-dialog/incident-details-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
interface Incident {
  incidentId: string;
  title: string;
  priority: string;
  description:string;
  status: string;
  createdAt: string;
}
@Component({
  selector: 'app-engineer',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
    MatDialogModule,
    MatInputModule
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
    // 'action'
  ];


  incidents: Incident[] = [];
allIncidents: Incident[] = [];
  constructor(private router: Router,  private dialog: MatDialog) { }


  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        this.engineerName = user.username;
      }
    }
    this.incidents = [

      {
        incidentId: 'INC-001',
        title: 'API Down ',
        priority: 'Critical',
        description: "Payment API is not responding",
        status: 'Pending',
        createdAt: '17-Jul-2026'
      },

      {
        incidentId: 'INC-002',
        title: 'Database Timeout',
        priority: 'High',
        description: "submit API is not responding ",
        status: 'InProgress',
        createdAt: '17-Jul-2026'
      }

    ];
  this.allIncidents = [...this.incidents];
  }


  logout() {

    localStorage.clear();

    this.router.navigate(['/login']);

  }
  openIncident(row: Incident): void {
  this.dialog.open(IncidentDetailsDialog, {
   
    width: '900px',
    height: '850px',
    maxWidth: '95vw',
    maxHeight: '95vh',
    data: row,
    disableClose: true
  });
}


searchIncident(event: Event) {

  const value = (event.target as HTMLInputElement)
    .value
    .trim()
    .toLowerCase();


  if (!value) {

    this.incidents = this.allIncidents;

    return ;

  }

  this.incidents = this.allIncidents.filter(item =>

    item.incidentId
      .toLowerCase()
      .includes(value)

  );

}
}
