import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { CreateIncidentDialog } from '../incidents/create-incident-dialog/create-incident-dialog';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
     MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {


  constructor(
    private dialog: MatDialog
  ){}


  dashboard = {
    total: 12,
    pending: 5,
    inProgress: 3,
    resolved: 4
  };


  displayedColumns: string[] = [
    'incidentId',
    'title',
    'status'
  ];


  incidents = [
    {
      incidentId: 'INC-1001',
      title: 'Database Down',
      status: 'Pending'
    },
    {
      incidentId: 'INC-1002',
      title: 'API Timeout',
      status: 'In Progress'
    },
    {
      incidentId: 'INC-1003',
      title: 'Login Failure',
      status: 'Resolved'
    }
  ];

  openCreateIncident(){

    this.dialog.open(CreateIncidentDialog,{
    width: '400px',
  height: '500px',
  disableClose: true
    });

  }

}