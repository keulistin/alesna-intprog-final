import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, EmployeeService } from '@app/_services';
import { Employee } from '@app/_models/employee';

@Component({
    templateUrl: 'layout.component.html'
})
export class LayoutComponent implements OnInit {
    employeeId: string | null = null;
    employee: Employee | null = null;
    displayEmployeeId: string | null = null;

    constructor(
        private employeeService: EmployeeService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.employeeId = params['employeeId'];
            if (this.employeeId) {
                this.loadEmployee();
            }
        });
    }

    private loadEmployee() {
        this.employeeService.getById(this.employeeId!)
            .pipe(first())
            .subscribe(employee => {
                this.employee = employee;
                this.displayEmployeeId = employee.employeeId;
            });
    }

    getEmployeeFullName(): string {
        if (!this.employee?.account) return '';
        const firstName = this.employee.account.firstName.charAt(0).toUpperCase() + this.employee.account.firstName.slice(1).toLowerCase();
        const lastName = this.employee.account.lastName.charAt(0).toUpperCase() + this.employee.account.lastName.slice(1).toLowerCase();
        return `${firstName} ${lastName}`;
    }
} 