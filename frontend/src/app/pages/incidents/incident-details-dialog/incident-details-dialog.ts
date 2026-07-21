import { 
  Component,
  Inject,
  inject
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
  Incident as IncidentService 
} from '../../../services/incident';



interface Incident {

  incidentId:string;

  title:string;

  priority:string;

  description:string;

  status:string;

  createdAt:string;

}



@Component({

 selector:'app-incident-details-dialog',

 standalone:true,

 imports:[
  CommonModule,
  MatDialogModule,
  MatButtonModule,
  MatIconModule,
  MatTooltipModule
 ],

 templateUrl:'./incident-details-dialog.html',

 styleUrl:'./incident-details-dialog.css'

})


export class IncidentDetailsDialog {


similarIncidents:Incident[]=[];

aiGenerated=false;

aiContent='';



private incidentService = inject(IncidentService);


private dialogRef = inject(
  MatDialogRef<IncidentDetailsDialog>
);



constructor(

 @Inject(MAT_DIALOG_DATA)
 public data:Incident

){

 this.findSimilarIncidents();

}




findSimilarIncidents(){


const previousIncidents:Incident[]=[

{
 incidentId:'INC-003',
 title:'API Down',
 priority:'Critical',
 description:'Payment API issue',
 status:'Resolved',
 createdAt:'10-Jul-2026'
},


{
 incidentId:'INC-004',
 title:'Database Timeout',
 priority:'High',
 description:'Database slow response',
 status:'Resolved',
 createdAt:'12-Jul-2026'
}

];



this.similarIncidents =
previousIncidents.filter(
incident=>

incident.status==='Resolved'

&&

incident.title
.toLowerCase()
.includes(
 this.data.title.toLowerCase()
)

);


}





generateAIAnalysis(){


this.aiGenerated=true;


this.aiContent=`

Incident Summary:

The incident priority is ${this.data.priority}.


Recommended Actions:

1. Check application logs.
2. Verify server health.
3. Review deployments.
4. Monitor database.


Suggested Resolution:

Investigate root cause and apply fix.

`;

}





copyIncidentId(id:string){

 navigator.clipboard.writeText(id);

}





changeStatus(status:string){


this.incidentService
.updateIncidentStatus(
 this.data.incidentId,
 status
)

.subscribe({

next:(res)=>{


this.data.status=status;


alert(
 "Incident status updated successfully"
);


},


error:(err)=>{


console.error(err);


alert(
 err.error?.message ||
 "Status update failed"
);


}


});


}



}