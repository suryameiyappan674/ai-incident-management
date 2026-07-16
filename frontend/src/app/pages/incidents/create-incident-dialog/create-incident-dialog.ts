import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-create-incident-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './create-incident-dialog.html',
  styleUrl: './create-incident-dialog.css'
})
export class CreateIncidentDialog {


  incidentForm: FormGroup;


  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateIncidentDialog>
  ) {

    this.incidentForm = this.fb.group({

      title: [
        '',
        Validators.required
      ],

      description: [
        ''
      ],

      priority: [
        'Medium'
      ]

    });

  }


  save() {

    if (this.incidentForm.valid) {

      this.dialogRef.close(
        this.incidentForm.value
      );

    }

  }

}