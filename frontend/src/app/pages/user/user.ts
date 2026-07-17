import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { CreateIncidentDialog } from '../incidents/create-incident-dialog/create-incident-dialog';
interface IncidentData {

  incidentId:string;
  title:string;
  priority:string;
  status:string;
  createdAt:string;

}
@Component({
  selector: 'app-user',
  imports: [
     CommonModule,
      MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './user.html',
  styleUrl: './user.css',
  standalone:true,
})
export class User {
  userName = localStorage.getItem('username');
 displayedColumns = [

    'incidentId',
    'title',
    'priority',
    'status',
    'createdAt'

  ];
  
    incidents: IncidentData[] = [];
  
  
    constructor(
      private router: Router,
      private dialog: MatDialog,
    ) {}
  ngOnInit() {

    this.incidents = [

      {
        incidentId: 'INC-001',
        title: 'API Down',
        priority: 'Critical',
        status: 'Pending',
        createdAt: '17-Jul-2026'
      },

    ];

  }

   openCreateIncident(){
  
      this.dialog.open(CreateIncidentDialog,{
      width: '400px',
    height: '500px',
    disableClose: true
      });
  
    }

   logout() {

    localStorage.clear();

    this.router.navigate(['/login']);

  }
}
