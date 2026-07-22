import {
  Component,
  Inject,
  inject,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatTooltipModule
} from '@angular/material/tooltip';

import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  Incident as IncidentService
} from '../../../services/incident';



interface Incident {

  incidentId: string;

  title: string;

  priority: string;

  description: string;

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
    MatTooltipModule,
    MatProgressSpinnerModule
  ],

  templateUrl: './incident-details-dialog.html',

  styleUrl: './incident-details-dialog.css'

})


export class IncidentDetailsDialog {


  similarIncidents: Incident[] = [];

  aiGenerated = false;
  isGeneratingAI = false;

  aiContent: any;
  formattedAiContent = '';



  private incidentService = inject(IncidentService);
  private cdr = inject(ChangeDetectorRef);

  private dialogRef = inject(
    MatDialogRef<IncidentDetailsDialog>
  );

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: Incident
  ) {
    this.findSimilarIncidents();
  }

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
        description: 'Database slow response',
        status: 'Resolved',
        createdAt: '12-Jul-2026'
      }
    ];

    this.similarIncidents = previousIncidents.filter(
      incident => incident.status === 'Resolved' && incident.title.toLowerCase().includes(this.data.title.toLowerCase())
    );
  }

  formatReadable(text: string): string {
    if (!text) return '';
    return text
      // Bold text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italics
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
      // Bullet points (convert to HTML entity)
      .replace(/(\n|^)\s*\*\s+(.*)/g, '$1&bull; $2')
      // Newlines to <br> for proper spacing
      .replace(/\n/g, '<br/>');
  }

  generateAIAnalysis() {
    this.aiGenerated = true;
    this.isGeneratingAI = true;
    this.cdr.detectChanges(); // Update UI to show spinner

    this.incidentService.analyzeIncident(this.data.title, this.data.description || '').subscribe({
      next: (res) => {
        this.isGeneratingAI = false;
        if (res && res.analysis) {
          this.aiContent = res.analysis;
          this.formattedAiContent = this.formatReadable(res.analysis);
        } else {
          this.aiContent = 'No analysis returned from the server.';
          this.formattedAiContent = this.aiContent;
        }
        this.cdr.detectChanges(); // Tell Angular to re-render the view
      },
      error: (err) => {
        this.isGeneratingAI = false;
        console.error('Error generating AI analysis:', err);
        this.aiContent = 'Failed to generate AI analysis. Please ensure the AI backend is running on port 8000.';
        this.formattedAiContent = this.aiContent;
        this.cdr.detectChanges(); // Tell Angular to re-render the view
      }
    });
  }





  copyIncidentId(id: string) {

    navigator.clipboard.writeText(id);

  }





  changeStatus(status: string) {

    this.incidentService
      .updateIncidentStatus(
        this.data.incidentId,
        status
      )

      .subscribe({

        next: (res) => {
          this.data.status = status;
          this.dialogRef.close({
            updated: true
          });

        },


        error: (err) => {
          console.error(err);
          alert(
            err.error?.message ||
            "Status update failed"
          );


        }


      });


  }



}