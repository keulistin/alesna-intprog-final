import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { DepartmentService, AlertService, EmployeeService, AccountService } from '@app/_services';
import { Department } from '@app/_models/department';
import { Role } from '@app/_models';

@Component({
    templateUrl: 'list.component.html',
    styles: [`
        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1040;
        }
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1050;
            overflow: auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .modal-dialog {
            width: 100%;
            max-width: 500px;
            margin: 1.75rem auto;
            position: relative;
        }
        .modal-content {
            position: relative;
            background-color: #fff;
            border-radius: 0.3rem;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.5);
        }
        .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            background-color: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            border-top-left-radius: 0.3rem;
            border-top-right-radius: 0.3rem;
        }
        .modal-body {
            padding: 1rem;
        }
        .modal-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 1rem;
            border-top: 1px solid #e9ecef;
        }
        .btn-close {
            background: transparent;
            border: 0;
            font-size: 1.5rem;
            font-weight: 700;
            color: #000;
            opacity: 0.5;
            cursor: pointer;
        }
        .show {
            display: flex !important;
        }
        .hide {
            display: none !important;
        }
    `]
})
export class ListComponent implements OnInit {
    departments: Department[] = [];
    departmentToDelete: Department | null = null; // Type it
    showDeleteModal = false;
    isAdmin = false;

    constructor(
        private departmentService: DepartmentService,
        private employeeService: EmployeeService,
        private alertService: AlertService,
        private accountService: AccountService
    ) {
        this.isAdmin = this.accountService.accountValue?.role === Role.Admin;
    }

    ngOnInit() {
        this.loadDepartmentsWithEmployeeCounts();
    }

    private loadDepartmentsWithEmployeeCounts() {
        // First load all departments
        this.departmentService.getAll()
            .pipe(first())
            .subscribe({
                next: departments => {
                    this.departments = departments;
                    this.employeeService.getAll()
                        .pipe(first())
                        .subscribe({
                            next: employees => {
                                this.departments.forEach(dept => {
                                    // Ensure type consistency for comparison if IDs are numbers
                                    dept.employeeCount = employees.filter(emp =>
                                        String(emp.departmentId) === String(dept.id) // Ensure both are strings for comparison
                                    ).length;
                                });
                            },
                            error: empError => this.alertService.error(empError) // Handle error for employee loading
                        });
                },
                error: deptError => this.alertService.error(deptError) // Handle error for department loading
            });
    }

    openDeleteModal(department: Department) { // Type the parameter
        this.departmentToDelete = department;
        this.showDeleteModal = true;
        if (typeof document !== 'undefined') { // Safeguard for SSR or non-browser environments
            document.body.classList.add('modal-open');
        }
    }

    confirmDelete() {
        if (!this.departmentToDelete) return;

        const department = this.departmentToDelete;
        department.isDeleting = true;

        this.departmentService.delete(String(department.id))
            .pipe(first())
            .subscribe({
                next: () => {
                    this.departments = this.departments.filter(x => x.id !== department.id);
                    this.alertService.success('Department deleted successfully');
                    this.closeDeleteModal();
                },
                error: error => {
                    this.alertService.error(error);
                    department.isDeleting = false;
                    this.closeDeleteModal();
                }
            });
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
        document.body.classList.remove('modal-open');
        this.departmentToDelete = null;
    }
} 