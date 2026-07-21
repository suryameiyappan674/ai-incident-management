import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  ViewChild,
  PLATFORM_ID
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CreateIncidentDialog } from '../incidents/create-incident-dialog/create-incident-dialog';
import { AssignIncidentDialog } from '../incidents/assign-incident-dialog/assign-incident-dialog';
import { Incident as IncidentService } from '../../services/incident';
import { Assignment as AssignmentService } from '../../services/assignment';
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
  private assignmentService = inject(AssignmentService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  @ViewChild(MatTable) table!: MatTable<any>;

  // Dashboard stats
  dashboard = {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  };

  displayedColumns: string[] = [
    'incidentId',
    'title',
    'priority',
    'status',
    'createdBy',
    'assign',
    'createdAt'
  ];

  incidents: any[] = [];
  currentUser: any = null;

  isLoading = false;

  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUser = this.authService.getUser();
      this.fetchData();
    }
  }

  // 🔥 MAIN FIXED METHOD
  fetchData() {
    this.isLoading = true;

    this.incidentService
      .getIncidents(this.currentPage + 1, this.pageSize)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          if (res?.statusCode === 200 && res?.data) {

            // ✅ Ensure new reference
            this.incidents = [...(res.data.incidents || [])];

            this.totalRecords = res.data.total || 0;

            this.dashboard = {
              total: res.data.stats?.total || 0,
              pending: res.data.stats?.pending || 0,
              inProgress: res.data.stats?.inProgress || 0,
              resolved: res.data.stats?.resolved || 0
            };

            // 🔥 FORCE UI UPDATE
            this.cdr.detectChanges();

            // 🔥 FORCE TABLE RENDER
            this.table?.renderRows();
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error fetching dashboard data:', err);

          if (err.status === 401) {
            this.logout();
          }
        }
      });
  }

  // Pagination
  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchData();
  }

  // Create Incident
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
            this.currentPage = 0;
            this.fetchData();
          },
          error: (err) => {
            this.isLoading = false;
            console.error(err);
            alert(err?.error?.message || 'Failed to create incident');
          }
        });
      }
    });
  }

  // Assign Engineer
  openAssignDialog(row: any) {
    const dialogRef = this.dialog.open(AssignIncidentDialog, {
      width: '550px',
      disableClose: true,
      data: row
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      this.assignmentService
        .assignEngineer(row.incidentId, result.engineer._id)
        .subscribe({
          next: () => {
            alert("Engineer assigned successfully.");
            this.fetchData();
          },
          error: (err) => {
            alert(err.error?.message || "Assignment failed.");
          }
        });
    });
  }

  logout() {
    this.authService.logout();
  }

  isAssigned(row: any): boolean {
    return row?.assignees?.some(
      (a: any) => a._id !== row.createdBy?._id
    );
  }

  // 🔥 TrackBy (IMPORTANT)
  trackByFn(index: number, item: any) {
    return item.incidentId;
  }
}