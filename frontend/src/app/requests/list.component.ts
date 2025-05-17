import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService, EmployeeService, RequestService, AlertService } from '@app/_services';
import { first } from 'rxjs/operators';

@Component({
  templateUrl: 'list.component.html'
})
export class RequestListComponent implements OnInit {
  requests: any[] = [];
  account = this.accountService.accountValue;
  employeeId: string | null = null;
  displayEmployeeId: string | null = null;
  loading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private employeeService: EmployeeService,
    private requestService: RequestService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    // Get the employeeId from the route query parameters
    this.route.queryParams.subscribe(params => {
      this.employeeId = params['employeeId'];
      
      if (this.employeeId) {
        // If we have an employeeId, get the employee details to show in the header
        this.employeeService.getById(this.employeeId)
          .pipe(first())
          .subscribe({
            next: employee => {
              this.displayEmployeeId = employee.employeeId;
              // Load requests filtered by this employee
              this.loadRequestsByEmployeeId(this.employeeId);
            },
            error: error => {
              console.error('Error loading employee details:', error);
              this.alertService.error('Failed to load employee details');
            }
          });
      } else {
        // Otherwise load all requests
        this.loadAllRequests();
      }
    });
  }

  private loadAllRequests() {
    this.loading = true;
    this.requestService.getAll()
      .pipe(first())
      .subscribe({
        next: (requests: any[]) => {
          console.log('Loaded requests:', requests);
          
          // Debug: Print the data structure of the first request to see what's available
          if (requests.length > 0) {
            console.log('First request structure:', {
              id: requests[0].id,
              type: requests[0].type,
              employeeId: requests[0].employeeId,
              hasItems: !!requests[0].items,
              items: requests[0].items,
              hasRequestItems: !!requests[0].requestItems,
              requestItems: requests[0].requestItems,
              // Log raw structure to see everything
              rawObject: JSON.stringify(requests[0])
            });
          }
          
          this.requests = requests;
          this.loading = false;
        },
        error: error => {
          console.error('Error loading requests:', error);
          this.alertService.error('Failed to load requests');
          this.loading = false;
        }
      });
  }

  private loadRequestsByEmployeeId(employeeId: string) {
    // Get requests filtered by employee ID
    this.loading = true;
    this.requestService.getAll()
      .pipe(first())
      .subscribe({
        next: (requests: any[]) => {
          // Filter requests to only show those for this employee
          this.requests = requests.filter(r => r.employeeId?.toString() === employeeId?.toString());
          console.log(`Loaded ${this.requests.length} requests for employee ID ${employeeId}`);
          
          // Debug: Print the data structure if requests were found
          if (this.requests.length > 0) {
            console.log('First filtered request structure:', {
              id: this.requests[0].id,
              type: this.requests[0].type,
              employeeId: this.requests[0].employeeId,
              hasItems: !!this.requests[0].items,
              items: this.requests[0].items,
              hasRequestItems: !!this.requests[0].requestItems,
              requestItems: this.requests[0].requestItems,
              // Log raw structure to see everything
              rawObject: JSON.stringify(this.requests[0])
            });
          }
          
          this.loading = false;
        },
        error: error => {
          console.error('Error loading requests:', error);
          this.alertService.error('Failed to load requests');
          this.loading = false;
        }
      });
  }

  add() {
    const route = ['add'];
    if (this.employeeId) {
      this.router.navigate(route, { 
        relativeTo: this.route,
        queryParams: { employeeId: this.employeeId } 
      });
    } else {
      this.router.navigate(route, { relativeTo: this.route });
    }
  }

  edit(id: string) {
    const route = ['edit', id];
    if (this.employeeId) {
      this.router.navigate(route, { 
        relativeTo: this.route,
        queryParams: { employeeId: this.employeeId } 
      });
    } else {
      this.router.navigate(route, { relativeTo: this.route });
    }
  }

  delete(id: string) {
    if (confirm('Are you sure you want to delete this request?')) {
      this.requestService.delete(id)
        .pipe(first())
        .subscribe({
          next: () => {
            this.requests = this.requests.filter(x => x.id !== id);
            this.alertService.success('Request deleted successfully');
          },
          error: error => {
            console.error('Error deleting request:', error);
            this.alertService.error('Failed to delete request');
          }
        });
    }
  }
}