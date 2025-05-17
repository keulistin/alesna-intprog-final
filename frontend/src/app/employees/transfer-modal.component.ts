import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { first } from 'rxjs/operators';
import { EmployeeService, DepartmentService, AlertService } from '@app/_services';

@Component({
    selector: 'app-transfer-modal',
    template: `
        <div class="modal fade" [ngClass]="{ 'show d-block': isOpen }" tabindex="-1" role="dialog">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Transfer Employee: {{employee?.employeeId}}</h5>
                        <button type="button" class="btn-close" aria-label="Close" (click)="close()">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div *ngIf="loading" class="text-center">
                            <span class="spinner-border spinner-border-sm"></span>
                        </div>
                        <div *ngIf="error" class="alert alert-danger">{{error}}</div>
                        <div class="mb-3">
                            <label class="form-label">Current Department</label>
                            <input type="text" class="form-control" [value]="currentDepartmentName" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">New Department</label>
                            <select class="form-select" [(ngModel)]="departmentId">
                                <option *ngFor="let dept of departments" [ngValue]="dept.id">{{dept.name}}</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" (click)="close()">Cancel</button>
                        <button type="button" class="btn btn-warning" (click)="transfer()" [disabled]="loading">Transfer</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade show" *ngIf="isOpen"></div>
    `,
    styles: [`
        .btn-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1;
            color: #000;
            opacity: 0.5;
            padding: 0.25rem 0.5rem;
            margin: -0.25rem -0.5rem -0.25rem auto;
        }
        
        .btn-close:hover {
            color: #000;
            opacity: 0.75;
        }
    `]
})
export class TransferModalComponent implements OnInit {
    @Input() employeeId: string;
    @Output() transferComplete = new EventEmitter<void>();
    
    employee: any;
    departments: any[] = [];
    departmentId: number;
    currentDepartmentName: string = '';
    isOpen = false;
    loading = false;
    error = '';

    constructor(
        private employeeService: EmployeeService,
        private departmentService: DepartmentService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        // Load departments on init
        this.loadDepartments();
    }

    open(employeeId: string) {
        this.employeeId = employeeId;
        this.loading = true;
        this.error = '';
        this.isOpen = true;

        // Load employee details
        this.employeeService.getById(employeeId)
            .pipe(first())
            .subscribe({
                next: (employee) => {
                    this.employee = employee;
                    this.departmentId = Number(employee.departmentId);
                    
                    // Find current department name
                    const currentDept = this.departments.find(d => d.id === Number(employee.departmentId));
                    this.currentDepartmentName = currentDept ? currentDept.name : 'Unknown';
                    
                    this.loading = false;
                },
                error: error => {
                    this.error = error;
                    this.loading = false;
                }
            });
    }

    close() {
        this.isOpen = false;
    }

    loadDepartments() {
        this.departmentService.getAll()
            .pipe(first())
            .subscribe({
                next: departments => this.departments = departments,
                error: error => this.error = error
            });
    }

    transfer() {
        if (!this.employee || !this.departmentId) {
            this.error = 'Employee or department not selected';
            return;
        }
        
        // Find the new department name for the message
        const newDepartment = this.departments.find(d => d.id === Number(this.departmentId));
        const newDepartmentName = newDepartment ? newDepartment.name : 'Unknown';
        
        this.loading = true;
        this.error = '';

        this.employeeService.transfer(this.employee.id.toString(), this.departmentId)
            .pipe(first())
            .subscribe({
                next: (response) => {
                    // Display the message from the backend
                    this.alertService.success(response.message || 'Department transfer workflow created successfully');
                    this.transferComplete.emit();
                    this.close();
                    this.loading = false;
                },
                error: error => {
                    this.error = error;
                    this.loading = false;
                }
            });
    }
}