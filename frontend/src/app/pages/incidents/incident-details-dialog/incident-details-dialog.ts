import {
  Component,
  Inject,
  inject,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

import { Centrifuge } from 'centrifuge';



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
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule // Ensures the spinner module is loaded
  ],

  templateUrl: './incident-details-dialog.html',

  styleUrl: './incident-details-dialog.css'

})


export class IncidentDetailsDialog implements OnInit, OnDestroy {


  similarIncidents: Incident[] = [];

  aiGenerated = false;
  isGeneratingAI = false;

  aiContent: any;
  formattedAiContent = '';
  role: any;

  currentUser: string = '';
  chatMessage: string = '';
  chatMessages: { sender: string; role: string; text: string }[] = [];
  centrifuge: any;
  chatSubscription: any;



  private incidentService = inject(IncidentService);
  private cdr = inject(ChangeDetectorRef);

  private dialogRef = inject(
    MatDialogRef<IncidentDetailsDialog>
  );

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: Incident
  ) {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      this.role = user.role.name;
      this.currentUser = user.username;
    }
    this.findSimilarIncidents();
  }

  ngOnInit() {
    this.initCentrifugo();
  }

  ngOnDestroy() {
    if (this.centrifuge) {
      this.centrifuge.disconnect();
    }
  }

  initCentrifugo() {
    // Connect to Centrifugo WebSocket
    this.centrifuge = new Centrifuge("ws://10.68.10.106:8000/connection/websocket", {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM3MjIiLCJleHAiOjE3ODUzMTExNDksImlhdCI6MTc4NDcwNjM0OX0.lPuKb7O0afng8prpSTKFaaqrF98PFDLdl4xB_aK9CUM"
    });

    this.centrifuge.on('connecting', (ctx: any) => {
      console.log(`connecting: ${ctx.code}, ${ctx.reason}`);
    }).on('connected', (ctx: any) => {
      console.log(`connected over ${ctx.transport}`);
    }).on('disconnected', (ctx: any) => {
      console.log(`disconnected: ${ctx.code}, ${ctx.reason}`);
    }).connect();

    // Subscribe to incident-specific channel
    const channelName = `chat-${this.data.incidentId}`;
    this.chatSubscription = this.centrifuge.newSubscription(channelName);

    this.chatSubscription.on('publication', (ctx: any) => {
      this.chatMessages.push(ctx.data);
      this.cdr.detectChanges();
    }).subscribe();
  }

  sendMessage() {
    if (!this.chatMessage.trim()) return;

    const data = {
      sender: this.currentUser,
      role: this.role,
      text: this.chatMessage
    };

    // Client-side publish to Centrifugo channel
    this.chatSubscription.publish(data).then(() => {
      this.chatMessage = '';
       this.cdr.detectChanges();
    }).catch((err: any) => {
      console.error('Publish error', err);
      // Fallback: If Centrifugo doesn't allow client-side publishing, just push it locally 
      // (in a real app, you'd send an HTTP request to the backend to publish)
      this.chatMessages.push(data);
      this.chatMessage = '';
      this.cdr.detectChanges();
    });
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

    this.incidentService.analyzeIncident(this.data.title, this.data.description || '', this.data.priority).subscribe({
      next: (res) => {
        this.isGeneratingAI = false;

        // Handle new structured JSON response
        if (res && res.category) {
          let stepsHtml = '';
          if (res.steps && Array.isArray(res.steps)) {
            stepsHtml = '<ul>' + res.steps.map((step: string) => `<li>${step}</li>`).join('') + '</ul>';
          }

          this.formattedAiContent = `
            <p><strong>Category:</strong> ${res.category || 'N/A'}</p>
            <p><strong>Severity:</strong> ${res.severity || 'N/A'}</p>
            <p><strong>Confidence:</strong> ${(res.confidence ? (res.confidence * 100).toFixed(0) + '%' : 'N/A')}</p>
            <p><strong>Summary:</strong> ${res.summary || 'N/A'}</p>
            <p><strong>Root Cause (Potential):</strong> ${res.root_cause || 'N/A'}</p>
            <p><strong>Recommended Skill:</strong> ${res.recommended_engineer_skill || 'N/A'}</p>
            <p><strong>Resolution Steps:</strong></p>
            ${stepsHtml}
          `;
          this.aiContent = res;
        }
        // Fallback for older markdown response
        else if (res && res.analysis) {
          this.aiContent = res.analysis;
          this.formattedAiContent = this.formatReadable(res.analysis);
        }
        else {
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