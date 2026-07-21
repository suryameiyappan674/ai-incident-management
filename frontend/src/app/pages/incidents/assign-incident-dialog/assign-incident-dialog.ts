import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';

import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef
} from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { SelectModule } from 'primeng/select';

import { User } from '../../../services/user';
import { Engineer } from '../../../models/engineer';

@Component({
    selector: 'app-assign-incident-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        SelectModule
    ],
    templateUrl: './assign-incident-dialog.html',
    styleUrl: './assign-incident-dialog.css'
})
export class AssignIncidentDialog implements OnInit {

    private fb = inject(FormBuilder);
    private userService = inject(User);

    dialogRef = inject(MatDialogRef<AssignIncidentDialog>);
    data = inject(MAT_DIALOG_DATA);

    engineers: Engineer[] = [];

    loading = false;

    form = this.fb.group({
        engineer: this.fb.control<Engineer | null>(null, Validators.required),
        note: this.fb.control('')
    });

    ngOnInit(): void {
        this.loadEngineers();
    }

    loadEngineers() {

        this.loading = true;

        this.userService.getEngineers().subscribe({

            next: (res: any) => {

                this.loading = false;

                this.engineers = res.data;

            },

            error: () => {

                this.loading = false;

            }

        });

    }

    get selectedEngineer(): Engineer | null {

        return this.form.controls.engineer.value;

    }

    confirm() {

        if (this.form.invalid) return;

        this.dialogRef.close({

            engineer: this.form.value.engineer,

            note: this.form.value.note

        });

    }

}