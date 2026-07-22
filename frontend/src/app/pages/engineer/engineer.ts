import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

import { IncidentDetailsDialog } from '../incidents/incident-details-dialog/incident-details-dialog';
import { Incident as IncidentService } from '../../services/incident';

interface Incident {
  incidentId: string;
  title: string;
  priority: string;
  description: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-engineer',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    MatInputModule
  ],
  templateUrl: './engineer.html',
  styleUrl: './engineer.css',
})
export class Engineer implements OnInit {

  private platformId = inject(PLATFORM_ID);
  private incidentService = inject(IncidentService);

  engineerName: string = '';

  displayedColumns: string[] = [
    'incidentId',
    'title',
    'priority',
    'status',
    'createdAt'
  ];

  // ✅ Main Data Source
  dataSource = new MatTableDataSource<Incident>();

  // ✅ Backup for search
  allIncidents: Incident[] = [];

  constructor(
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUser();
      this.loadIncidents();
    }
  }

  // ✅ Load user from localStorage
  loadUser() {
    if (isPlatformBrowser(this.platformId)) {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        this.engineerName = user.username;
      }
    }
  }

  // ✅ Load incidents from API
  loadIncidents() {
    this.incidentService.getMyAssignments().subscribe({
      next: (response) => {
        if (response?.statusCode === 200 && response?.data?.incidents) {

          const formatted = response.data.incidents.map((incident: any) => ({
            ...incident,
            createdAt: new Date(incident.createdAt)
              .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
              .replace(/ /g, '-')
          }));

          this.allIncidents = formatted;
          this.dataSource.data = formatted; // ✅ Important
        }
      },
      error: (err) => {
        console.error('Error fetching assignments', err);
      }
    });
  }

  // ✅ Logout
  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // ✅ Open dialog
  openIncident(row: Incident): void {
   const dialogRef= this.dialog.open(IncidentDetailsDialog, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: row,
      disableClose: true,
      panelClass: 'incident-dialog'
    });
      dialogRef.afterClosed().subscribe(result => {

    if (result?.updated) {
      this.loadIncidents();   // Refresh table automatically
    }

  });
  }

  // ✅ Search
  searchIncident(event: Event) {
    const value = (event.target as HTMLInputElement)
      .value
      .trim()
      .toLowerCase();

    if (!value) {
      this.dataSource.data = this.allIncidents;
      return;
    }

    this.dataSource.data = this.allIncidents.filter(item =>
      item.incidentId.toLowerCase().includes(value)
    );
  }
}