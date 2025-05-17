import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
    templateUrl: 'add-edit.component.html'
})
export class AddEditEmployeeComponent implements OnInit {
    form!: FormGroup;
    employee: any = {
        employeeId: '',
        userId: null,
        position: '',
        departmentId: null,
        hireDate: null,
        status: 'Active'
    };
    users: any[] = [];
    departments: any[] = [];
    id: string;
    isAddMode: boolean;
    errorMessage: string = '';
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        // Initialize the form with validation
        this.form = this.formBuilder.group({
            employeeId: ['', Validators.required],
            userId: [null, Validators.required],
            position: ['', Validators.required],
            departmentId: [null, Validators.required],
            hireDate: [null, Validators.required],
            status: ['Active', Validators.required]
        });

        // Load users and departments
        this.loadUsers();
        this.loadDepartments();

        if (this.isAddMode) {
            // Fetch and pre-fill the next employeeId
            this.accountService.getNextEmployeeId()
                .pipe(first())
                .subscribe({
                    next: (res) => {
                        this.form.patchValue({ employeeId: res.employeeId });
                    },
                    error: (error) => {
                        this.errorMessage = 'Failed to fetch next Employee ID';
                    }
                });
        } else {
            this.loadEmployee();
        }
    }

    // Convenience getter for easy access to form fields
    get f(): { [key: string]: AbstractControl } { return this.form.controls; }

    loadUsers() {
        this.accountService.getAllUsers()
            .pipe(first())
            .subscribe({
                next: (users) => {
                    console.log('Loaded users:', users);
                    if (Array.isArray(users)) {
                        this.users = users;
                    } else {
                        console.error('Expected users to be an array but got:', typeof users);
                        this.errorMessage = 'Error loading users data';
                        this.users = [];
                    }
                },
                error: (error) => {
                    console.error('Error loading users:', error);
                    this.errorMessage = 'Error loading users data';
                }
            });
    }

    loadDepartments() {
        this.accountService.getAllDepartments()
            .pipe(first())
            .subscribe(departments => this.departments = departments);
    }

    loadEmployee() {
        this.loading = true;
        this.accountService.getEmployeeById(this.id)
            .pipe(first())
            .subscribe({
                next: (employee) => {
                    // Format hire date to YYYY-MM-DD for the date input
                    if (employee.hireDate) {
                        const date = new Date(employee.hireDate);
                        employee.hireDate = date.toISOString().split('T')[0];
                    }
                    this.form.patchValue(employee);
                    this.loading = false;
                },
                error: (error) => {
                    this.errorMessage = error;
                    this.loading = false;
                }
            });
    }

    save() {
        this.submitted = true;
        this.alertService.clear();

        // Stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        if (this.loading) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createEmployee();
        } else {
            this.updateEmployee();
        }
    }

    private createEmployee() {
        const formData = {...this.form.value};
        
        // Ensure hireDate is a proper Date object
        if (formData.hireDate) {
            formData.hireDate = new Date(formData.hireDate);
        }
        
        this.accountService.createEmployee(formData)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Employee created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: (error) => {
                    this.errorMessage = error;
                    this.loading = false;
                }
            });
    }

    private updateEmployee() {
        const formData = {...this.form.value};
        
        // Ensure hireDate is a proper Date object
        if (formData.hireDate) {
            formData.hireDate = new Date(formData.hireDate);
        }
        
        this.accountService.updateEmployee(this.id, formData)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Employee updated successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: (error) => {
                    this.errorMessage = error;
                    this.loading = false;
                }
            });
    }

    cancel() {
        if (this.isAddMode) {
            this.router.navigate(['../'], { relativeTo: this.route });
        } else {
            this.router.navigate(['../../'], { relativeTo: this.route });
        }
    }
}