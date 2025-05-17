import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { WorkflowService, AlertService, AccountService, EmployeeService } from '@app/_services';
import { Role } from '@app/_models';
import { Workflow } from '@app/_models/workflow';

@Component({ templateUrl: 'view.component.html' })
export class ViewWorkflowComponent implements OnInit {
    workflow: Workflow;
    loading = false;
    isAdmin = false;
    employee: any = null;
    employeeId: string | null = null;
    displayEmployeeId: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private workflowService: WorkflowService,
        private employeeService: EmployeeService,
        private alertService: AlertService,
        private accountService: AccountService
    ) {
        this.isAdmin = this.accountService.accountValue?.role === Role.Admin;
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.employeeId = params['employeeId'];
        });

        const id = this.route.snapshot.params['id'];
        this.loadWorkflow(id);
    }

    private loadWorkflow(id: string) {
        this.loading = true;
        this.workflowService.getById(id)
            .pipe(first())
            .subscribe({
                next: workflow => {
                    this.workflow = workflow;
                    if (workflow.employee && workflow.employee.account) {
                        this.employee = workflow.employee;
                        this.displayEmployeeId = `EMP${workflow.employee.employeeId}`;
                    }
                    this.loading = false;
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                    this.router.navigate(['../'], {
                        relativeTo: this.route,
                        queryParams: { employeeId: this.employeeId },
                        queryParamsHandling: 'merge'
                    });
                }
            });
    }

    capitalizeFirstLetter(text: string): string {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    deleteWorkflow() {
        if (confirm('Are you sure you want to delete this workflow?')) {
            this.loading = true;
            this.workflowService.delete(this.workflow.id)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.alertService.success('Workflow deleted successfully');
                        this.router.navigate(['../'], {
                            relativeTo: this.route,
                            queryParams: { employeeId: this.employeeId },
                            queryParamsHandling: 'merge'
                        });
                    },
                    error: error => {
                        this.alertService.error(error);
                        this.loading = false;
                    }
                });
        }
    }
} 