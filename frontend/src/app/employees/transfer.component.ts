import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { EmployeeService, DepartmentService } from '@app/_services';
import { Employee } from '@app/_models/employee';
import { Department } from '@app/_models/department';

@Component({ templateUrl: 'transfer.component.html' })
export class TransferComponent implements OnInit {
    employee: Employee;
    departments: Department[] = [];
    departmentId: number;
    loading = false;
    submitted = false;
    error = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private employeeService: EmployeeService,
        private departmentService: DepartmentService
    ) { }

    ngOnInit() {
        this.loading = true;
        const id = this.route.snapshot.params['id'];

        // Load employee details
        this.employeeService.getById(id)
            .pipe(first())
            .subscribe({
                next: (employee) => {
                    this.employee = employee;
                    this.departmentId = Number(employee.departmentId);
                    this.loading = false;
                },
                error: error => {
                    this.error = error;
                    this.loading = false;
                }
            });

        // Load departments
        this.departmentService.getAll()
            .pipe(first())
            .subscribe(departments => this.departments = departments);
    }

    onSubmit() {
        this.submitted = true;
        this.loading = true;

        this.employeeService.transfer(this.employee.id.toString(), this.departmentId)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigate(['/employees']);
                },
                error: error => {
                    this.error = error;
                    this.loading = false;
                }
            });
    }

    cancel() {
        this.router.navigate(['/employees']);
    }
} 