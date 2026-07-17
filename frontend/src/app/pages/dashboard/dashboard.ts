import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CreateIncidentDialog } from '../incidents/create-incident-dialog/create-incident-dialog';
import { Incident as IncidentService } from '../../services/incident';
import { Auth as AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private dialog = inject(MatDialog);
  private incidentService = inject(IncidentService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  // Stats display
  dashboard = {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  };

  // Table structure
  displayedColumns: string[] = [
    'incidentId',
    'title',
    'priority',
    'status',
    'createdBy',
    'createdAt'
  ];

  incidents: any[] = [];
  isLoading = false;

  // Pagination status
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0; // 0-indexed for MatPaginator

  ngOnInit() {
    setTimeout(() => {
      this.fetchData();
    });
  }

  fetchData() {
    this.isLoading = true;
    // Map 0-indexed page to 1-indexed for backend API
    this.incidentService.getIncidents(this.currentPage + 1, this.pageSize).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.statusCode === 200 && res?.data) {
          this.incidents = res.data.incidents || [];
          this.totalRecords = res.data.total || 0;
          if (res.data.stats) {
            this.dashboard = {
              total: res.data.stats.total || 0,
              pending: res.data.stats.pending || 0,
              inProgress: res.data.stats.inProgress || 0,
              resolved: res.data.stats.resolved || 0
            };
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching dashboard data:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchData();
  }

  openCreateIncident() {
    const dialogRef = this.dialog.open(CreateIncidentDialog, {
      width: '400px',
      height: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true;
        this.incidentService.createIncident(result).subscribe({
          next: () => {
            // Reset to page 0 and reload
            this.currentPage = 0;
            this.fetchData();
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error creating incident:', err);
            alert(err?.error?.message || 'Failed to create incident');
          }
        });
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}