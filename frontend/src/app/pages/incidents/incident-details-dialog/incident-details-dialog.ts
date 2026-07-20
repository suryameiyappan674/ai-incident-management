import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
interface Incident {
  incidentId: string;
  title: string;
  priority: string;
  description:string;
  status: string;
  createdAt: string;
  
}
@Component({
  selector: 'app-incident-details-dialog',
   standalone: true,
  imports: [
     CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule

  ],
  templateUrl: './incident-details-dialog.html',
  styleUrl: './incident-details-dialog.css',
})
export class IncidentDetailsDialog {
 similarIncidents: Incident[] = [];
 aiGenerated = false;

aiContent = '';
    constructor(
    @Inject(MAT_DIALOG_DATA) public data: Incident,
  ) { this.findSimilarIncidents();}


  findSimilarIncidents() {


    const previousIncidents: Incident[] = [

      {
        incidentId: 'INC-003',
        title: 'API Down',
        priority: 'Critical',
        description: 'Payment API issue',
        status: 'Resolved',
        createdAt: '10-Jul-2026'
      },


      {
        incidentId: 'INC-004',
        title: 'Database Timeout',
        priority: 'High',
        description: 'Database slow response   ',
        status: 'Resolved',
        createdAt: '12-Jul-2026'
      }

    ];



    this.similarIncidents = previousIncidents.filter(
      incident =>
        incident.status === 'Resolved' &&
        incident.title
          .toLowerCase()
          .includes(this.data.title.toLowerCase())
    );

  }
  generateAIAnalysis() {

  this.aiGenerated = true;


  // Later replace this with your AI API response

  this.aiContent = `

Incident Summary:

The incident has been classified as ${this.data.priority} priority.

Recommended Actions:

1. Check application logs for errors.
2. Verify server and API health.
3. Review recent deployments.
4. Monitor database performance.

Suggested Resolution:

Investigate the root cause and apply the required fix.

`;

}

copyIncidentId(id: string) {

  navigator.clipboard.writeText(id);

}

}
