import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { WorkflowService, AlertService } from '@app/_services';
import { WorkflowType } from '@app/_models/workflow';

@Component({ templateUrl: 'add.component.html' })
export class AddWorkflowComponent implements OnInit {
    form: FormGroup;
    loading = false;
    submitted = false;
    employeeId: string | null = null;
    workflowTypes = Object.values(WorkflowType);

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private workflowService: WorkflowService,
        private alertService: AlertService
    ) {
        // Get employeeId from query params
        this.route.queryParams.subscribe(params => {
            this.employeeId = params['employeeId'];
            if (!this.employeeId) {
                this.alertService.error('Employee ID is required');
                this.router.navigate(['/workflows']);
            }
        });
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            type: ['', Validators.required],
            details: this.formBuilder.group({
                task: ['', Validators.required],
                additionalInfo: ['']
            })
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;

        const workflowData = {
            ...this.form.value,
            employeeId: Number(this.employeeId),
            status: 'ForReviewing'
        };

        this.workflowService.create(workflowData)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Workflow created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], {
                        relativeTo: this.route,
                        queryParams: { employeeId: this.employeeId }
                    });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
} 