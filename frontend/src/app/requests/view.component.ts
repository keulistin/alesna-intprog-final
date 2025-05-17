import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { RequestService, AlertService, AccountService } from '@app/_services';
import { Role } from '@app/_models';
import { Request } from '@app/_models/request';

declare var bootstrap: any;

@Component({ templateUrl: 'view.component.html' })
export class ViewComponent implements OnInit {
    id: string;
    request: Request;
    loading = false;
    isAdmin = false;
    isModerator = false;
    isOwner = false;
    employeeId: string | null = null;
    deleting = false;
    deleteModal: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private alertService: AlertService,
        private accountService: AccountService
    ) {
        // Check roles
        this.isAdmin = this.accountService.accountValue?.role === Role.Admin;
        this.isModerator = this.accountService.accountValue?.role === Role.Moderator;

        // Get employeeId from query params
        this.route.queryParams.subscribe(params => {
            this.employeeId = params['employeeId'];
        });
    }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.loadRequest();
    }

    private loadRequest() {
        this.loading = true;
        this.requestService.getById(this.id)
            .pipe(first())
            .subscribe({
                next: (request) => {
                    this.request = request;
                    // Check if current user is the owner of the request
                    this.isOwner = request.employeeId === Number(this.accountService.accountValue?.id);
                    this.loading = false;
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                    // Navigate back on error
                    this.router.navigate(['../'], {
                        relativeTo: this.route,
                        queryParams: { employeeId: this.employeeId }
                    });
                }
            });
    }

    changeStatus(status: string) {
        if (!this.canChangeStatus(status)) return;

        const comments = prompt('Please enter comments for this status change:');
        if (comments === null) return; // User cancelled

        this.requestService.changeStatus(this.id, status, comments)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Request status updated successfully');
                    this.loadRequest(); // Reload the request to show updated status
                },
                error: error => {
                    this.alertService.error(error);
                }
            });
    }

    canChangeStatus(status: string): boolean {
        // Regular users can only cancel their own requests
        if (!this.isAdmin && !this.isModerator) {
            return this.isOwner && status === 'Cancelled';
        }

        // Moderators and admins can change to any status
        return true;
    }

    openDeleteModal(request: any) {
        this.deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        this.deleteModal.show();
    }

    deleteRequest() {
        this.deleting = true;
        this.requestService.delete(this.id)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.deleteModal.hide();
                    this.alertService.success('Request deleted successfully', { keepAfterRouteChange: true });
                    // Navigate back preserving the employeeId
                    this.router.navigate(['../../'], {
                        relativeTo: this.route,
                        queryParams: { employeeId: this.employeeId }
                    });
                },
                error: error => {
                    this.alertService.error(error?.message || 'Something went wrong. Please try again later.');
                    this.deleting = false;
                }
            });
    }

    // Helper function to get readable date
    formatDate(date: Date): string {
        if (!date) return '';
        return new Date(date).toLocaleString();
    }
} 