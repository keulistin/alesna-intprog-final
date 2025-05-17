import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService, EmployeeService } from '@app/_services';
import { first } from 'rxjs/operators';
import { Account, Role } from '@app/_models';
import { TransferModalComponent } from './transfer-modal.component';

@Component({
  templateUrl: 'list.component.html' // assuming the template is in list.component.html
})
export class ListComponent implements OnInit {
  @ViewChild('transferModal') transferModal: TransferModalComponent;
  employees: any[] = [];
  account = this.accountService.accountValue;
  currentAccount: Account | null = null;
  Role = Role;
  isAdmin = false;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private employeeService: EmployeeService
  ) {
    this.account = this.accountService.accountValue;
    this.isAdmin = this.currentAccount?.role === Role.Admin;
  }

  ngOnInit() {
    this.loadAllEmployees();
  }

  loadAllEmployees() {
    this.employeeService.getAll() // Changed to use EmployeeService.getAll()
      .pipe(first())
      .subscribe(employees => this.employees = employees);
  }

  viewRequests(id: string) {
    this.router.navigate(['/admin/requests'], { queryParams: { employeeId: id } });
  }

  viewWorkflows(id: string) {
    console.log("viewWorkflows called with id:", id);
    this.router.navigate(['/admin/workflows'], { queryParams: { employeeId: id } });
  }

  openTransferModal(employeeId: string) {
    this.transferModal.open(employeeId);
  }

  edit(employeeId: string) { // Renamed parameter
    this.router.navigate(['/admin/employees/edit', employeeId]); // Assumed admin path
  }

  delete(employeeId: string) { // Renamed parameter
    const employeeToDelete = this.employees.find(x => x.id === employeeId); // Or x.employeeId depending on what 'id' refers to
    if (!employeeToDelete) return;

    if (confirm(`Are you sure you want to delete employee ${employeeToDelete.firstName || ''} ${employeeToDelete.lastName || ''}?`)) {
      employeeToDelete.isDeleting = true; // If you have this property for UI
      this.employeeService.delete(employeeId) // Use EmployeeService
        .pipe(first())
        .subscribe({
          next: () => {
            this.employees = this.employees.filter(x => x.id !== employeeId);
            // this.alertService.success('Employee deleted'); // Add AlertService if needed
          },
          error: err => {
            employeeToDelete.isDeleting = false;
            // this.alertService.error(err);
          }
        });
    }
  }

  add() {
    this.router.navigate(['/admin/employees/add']); // Assumed admin path
  }
}