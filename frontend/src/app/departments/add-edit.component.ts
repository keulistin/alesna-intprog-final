import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({ templateUrl: 'add-edit.component.html' })

export class AddEditDepartmentComponent implements OnInit {
    form!: FormGroup;
    department: any = {
        name: '',
        description: ''
    };
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

        // Initialize form with validation
        this.form = this.formBuilder.group({
            name: ['', Validators.required],
            description: ['', Validators.required]
        });

        if (!this.isAddMode) {
            this.loading = true;
            this.accountService.getDepartmentById(this.id)
                .pipe(first())
                .subscribe({
                    next: (department) => {
                        this.form.patchValue(department);
                        this.loading = false;
                    },
                    error: (error) => {
                        this.errorMessage = error;
                        this.loading = false;
                    }
                });
        }
    }

    // Convenience getter for easy access to form fields
    get f(): { [key: string]: AbstractControl } { return this.form.controls; }

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
            this.createDepartment();
        } else {
            this.updateDepartment();
        }
    }

    private createDepartment() {
        this.accountService.createDepartment(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Department created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: (error) => {
                    this.errorMessage = error;
                    this.loading = false;
                }
            });
    }

    private updateDepartment() {
        this.accountService.updateDepartment(this.id, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Department updated successfully', { keepAfterRouteChange: true });
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