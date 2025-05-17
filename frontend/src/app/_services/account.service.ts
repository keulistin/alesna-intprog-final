import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Account } from '@app/_models';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
    private accountSubject: BehaviorSubject<Account>;
    public account: Observable<Account>;
    private refreshTokenValue: string | null = null;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.accountSubject = new BehaviorSubject<Account>(null);
        this.account = this.accountSubject.asObservable();
    }

    public get accountValue(): Account {
        return this.accountSubject.value;
    }

    login(email: string, password: string) {
        return this.http.post<any>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true })
            .pipe(map(account => {
                this.accountSubject.next(account);
                if (account.refreshToken) {
                    this.refreshTokenValue = account.refreshToken;
                }
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    logout() {
        this.http.post<any>(`${baseUrl}/revoke-token`, { token: this.refreshTokenValue }, { withCredentials: true }).subscribe();
        this.stopRefreshTokenTimer();
        this.refreshTokenValue = null;
        this.accountSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    refreshToken() {
        // Send the token in the request body since cookies may not work across domains
        return this.http.post<any>(`${baseUrl}/refresh-token`, { token: this.refreshTokenValue }, { withCredentials: true })
            .pipe(map((account) => {
                this.accountSubject.next(account);
                if (account.refreshToken) {
                    this.refreshTokenValue = account.refreshToken;
                }
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    register(account: Account) {
        return this.http.post(`${baseUrl}/register`, account);
    }

    verifyEmail(token: string) {
        return this.http.post(`${baseUrl}/verify-email`, { token });
    }

    forgotPassword(email: string) {
        return this.http.post(`${baseUrl}/forgot-password`, { email });
    }

    validateResetToken(token: string) {
        return this.http.post(`${baseUrl}/validate-reset-token`, { token });
    }

    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
    }

    getAll(): Observable<Account[]> {
        return this.http.get<Account[]>(baseUrl);
    }

    getById(id: string): Observable<Account> {
        return this.http.get<Account>(`${baseUrl}/${id}`);
    }

    create(params: any): Observable<any> {
        return this.http.post(baseUrl, params);
    }

    // Add to AccountService
    private departmentsUrl = `${environment.apiUrl}/departments`;

    getDepartmentById(id: string): Observable<any> {
        return this.http.get(`${this.departmentsUrl}/${id}`);
    }

    createDepartment(params: any): Observable<any> {
        return this.http.post(this.departmentsUrl, params);
    }

    updateDepartment(id: string, params: any): Observable<any> {
        return this.http.put(`${this.departmentsUrl}/${id}`, params);
    }
    getAllDepartments(): Observable<any[]> {
        return this.http.get<any[]>(this.departmentsUrl);
    }

    deleteDepartment(id: string): Observable<any> {
        return this.http.delete(`${this.departmentsUrl}/${id}`);
    }

    // Add to AccountService
    private employeesUrl = `${environment.apiUrl}/employees`;

    getAllUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${baseUrl}`).pipe(
            map(accounts => {
                console.log('Fetched accounts:', accounts);
                return accounts.map(account => ({
                    id: account.id,
                    email: account.email,
                    role: account.role,
                    fullName: `${account.firstName || ''} ${account.lastName || ''}`.trim()
                }));
            })
        );
    }

    getEmployeeById(id: string): Observable<any> {
        return this.http.get(`${this.employeesUrl}/${id}`);
    }

    createEmployee(params: any): Observable<any> {
        return this.http.post(this.employeesUrl, params);
    }

    updateEmployee(id: string, params: any): Observable<any> {
        return this.http.put(`${this.employeesUrl}/${id}`, params);
    }
    deleteEmployee(id: string): Observable<any> {
        return this.http.delete(`${this.employeesUrl}/${id}`);
    }

    private requestsUrl = `${environment.apiUrl}/requests`;

    getRequestById(id: string): Observable<any> {
        return this.http.get(`${this.requestsUrl}/${id}`);
    }

    createRequest(params: any): Observable<any> {
        return this.http.post(this.requestsUrl, params);
    }

    updateRequest(id: string, params: any): Observable<any> {
        return this.http.put(`${this.requestsUrl}/${id}`, params);
    }

    getAllRequests(): Observable<any[]> {
        return this.http.get<any[]>(this.requestsUrl);
    }

    deleteRequest(id: string): Observable<any> {
        return this.http.delete(`${this.requestsUrl}/${id}`);
    }
    private workflowsUrl = `${environment.apiUrl}/workflows`;

    getEmployeeWorkflows(employeeId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.workflowsUrl}/employee/${employeeId}`);
    }

    updateWorkflowStatus(workflowId: string, params: any): Observable<any> {
        return this.http.put(`${this.workflowsUrl}/${workflowId}/status`, params);
    }
    update(id: string, params: any): Observable<Account> {
        return this.http.put(`${baseUrl}/${id}`, params)
            .pipe(map((account: Account) => {
                // update the current account if it was updated
                if (account.id === this.accountValue?.id) {
                    // publish updated account to subscribers
                    const updatedAccount = { ...this.accountValue, ...account };
                    this.accountSubject.next(updatedAccount);
                }
                return account;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${baseUrl}/${id}`)
            .pipe(map(x => {
                // auto logout if the logged in account deleted their own record
                if (id === this.accountValue?.id) {
                    this.logout();
                }
                return x;
            }));
    }

    public getAccountByUserId(userId: number | undefined): Account | undefined {
        if (userId === undefined || userId === null) {
            return undefined;
        }
        // In the context of the FakeBackend, all "accounts" are stored in localStorage
        // under the key used by the FakeBackendInterceptor.
        const accountsKey = 'accounts'; // Define the key used in localStorage
        const allAccountsFromStorage = JSON.parse(localStorage.getItem(accountsKey) || '[]') as Account[];
        // The 'userId' in your Employee model is meant to link to the 'id' of an Account.
        return allAccountsFromStorage.find(acc => Number(acc.id) === Number(userId));
    }


    // helper methods
    private refreshTokenTimeout: any;

    private startRefreshTokenTimer() {
        // parse json object from base64 encoded jwt token
        const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));

        // set a timeout to refresh the token a minute before it expires
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }

    getNextEmployeeId(): Observable<{ employeeId: string }> {
        return this.http.get<{ employeeId: string }>(`${this.employeesUrl}/nextId`);
    }

}