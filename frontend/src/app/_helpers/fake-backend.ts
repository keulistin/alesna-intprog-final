import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { AlertService } from '@app/_services';
import { Role } from '@app/_models';
import { environment } from '@environments/environment';

// array in local storage for accounts
const accountsKey = 'angular-10-registration-login-example-accounts';
let accounts = JSON.parse(localStorage.getItem(accountsKey)) || [];

// in-memory data
let employees = [
    { id: 1, employeeId: 'EMP001', userId: 1, position: 'Developer', departmentId: 1, hireDate: '2025-01-01', status: 'Active' },
    { id: 2, employeeId: 'EMP002', userId: 2, position: 'Designer', departmentId: 2, hireDate: '2025-02-01', status: 'Active' }
];

let departments = [
    { id: 1, name: 'Engineering', description: 'Software development team', employeeCount: 1 },
    { id: 2, name: 'Marketing', description: 'Marketing team', employeeCount: 1 }
];

let workflows = [
    { id: 1, employeeId: 1, type: 'Onboarding', details: 'Task: Setup workstation', status: 'Pending' }
];

let requests = [
    { id: 1, employeeId: 1, type: 'Equipment', requestItems: [{ name: 'Laptop', quantity: 1 }, { name: 'Monitor', quantity: 2 }], status: 'Pending' },
    { id: 2, employeeId: 1, type: 'Software', requestItems: [{ name: 'Visual Studio', quantity: 1 }, { name: 'Office 365', quantity: 1 }], status: 'Approved' },
    { id: 3, employeeId: 2, type: 'Training', requestItems: [{ name: 'Adobe Illustrator Course', quantity: 1 }], status: 'Rejected' },
    { id: 4, employeeId: 2, type: 'Equipment', requestItems: [{ name: 'Drawing Tablet', quantity: 1 }], status: 'Pending' }
];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    constructor(private alertService: AlertService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;
        const alertService = this.alertService;

        // Extract the path from the URL (remove the API prefix if present)
        const apiUrl = environment.apiUrl;
        const path = url.startsWith(apiUrl) ? url.substring(apiUrl.length) : url;

        return of(null)
            .pipe(mergeMap(() => handleRoute()))
            .pipe(materialize())
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                // Account endpoints
                case path.endsWith('/accounts/authenticate') && method === 'POST':
                    return authenticate();
                case path.endsWith('/accounts/refresh-token') && method === 'POST':
                    return refreshToken();
                case path.endsWith('/accounts/revoke-token') && method === 'POST':
                    return revokeToken();
                case path.endsWith('/accounts/register') && method === 'POST':
                    return register();
                case path.endsWith('/accounts/verify-email') && method === 'POST':
                    return verifyEmail();
                case path.endsWith('/accounts/forgot-password') && method === 'POST':
                    return forgotPassword();
                case path.endsWith('/accounts/validate-reset-token') && method === 'POST':
                    return validateResetToken();
                case path.endsWith('/accounts/reset-password') && method === 'POST':
                    return resetPassword();
                case path.endsWith('/accounts') && method === 'GET':
                    return getAccounts();
                case path.match(/\/accounts\/\d+$/) && method === 'GET':
                    return getAccountById();
                case path.endsWith('/accounts') && method === 'POST':
                    return createAccount();
                case path.match(/\/accounts\/\d+$/) && method === 'PUT':
                    return updateAccount();
                
                // Employee endpoints
                case path.endsWith('/employees') && method === 'GET':
                    return authorize(null, () => getEmployees());
                case path.endsWith('/employees/nextId') && method === 'GET':
                    return authorize(null, () => getNextEmployeeId());
                case path.endsWith('/employees') && method === 'POST':
                    return authorize(Role.Admin, () => createEmployee());
                case path.match(/\/employees\/\d+$/) && method === 'GET':
                    return authorize(null, () => getEmployeeById());
                case path.match(/\/employees\/\d+\/with-details$/) && method === 'GET':
                    return authorize(null, () => getEmployeeWithDetails());
                case path.match(/\/employees\/\d+$/) && method === 'PUT':
                    return authorize(Role.Admin, () => updateEmployee());
                case path.match(/\/employees\/\d+\/transfer$/) && method === 'POST':
                    return authorize(Role.Admin, () => transferEmployee());
                
                // Department endpoints
                case path.endsWith('/departments') && method === 'GET':
                    return authorize(null, () => getDepartments());
                case path.endsWith('/departments') && method === 'POST':
                    return authorize(Role.Admin, () => createDepartment());
                case path.match(/\/departments\/\d+$/) && method === 'GET':
                    return authorize(null, () => getDepartmentById());
                case path.match(/\/departments\/\d+$/) && method === 'PUT':
                    return authorize(Role.Admin, () => updateDepartment());
                
                // Workflow endpoints
                case path.match(/\/workflows\/employee\/\d+$/) && method === 'GET':
                    return authorize(null, () => getEmployeeWorkflows());
                case path.endsWith('/workflows') && method === 'GET':
                    return authorize(null, () => getAllWorkflows());
                case path.endsWith('/workflows') && method === 'POST':
                    return authorize(Role.Admin, () => createWorkflow());
                case path.match(/\/workflows\/\d+\/status$/) && method === 'PUT':
                    return authorize(Role.Admin, () => updateWorkflow());
                case path.match(/\/workflows\/\d+$/) && method === 'PUT':
                    return authorize(Role.Admin, () => updateWorkflow());
                
                // Request endpoints
                case path.endsWith('/requests') && method === 'GET':
                    return authorize(null, () => getRequests());
                case path.match(/\/requests\?employeeId=\d+$/) && method === 'GET':
                    return authorize(null, () => getRequestsByEmployeeId());
                case path.match(/\/requests\/\d+$/) && method === 'GET':
                    return authorize(null, () => getRequestById());
                case path.endsWith('/requests') && method === 'POST':
                    return authorize(null, () => createRequest());
                case path.match(/\/requests\/\d+$/) && method === 'PUT':
                    return authorize(Role.Admin, () => updateRequest());
                
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }
        }

        // Account route functions
        function authenticate() {
            const { email, password } = body;
            const account = accounts.find(x => x.email === email);
        
            if (!account) {
                return error('Email does not exist');
            }
        
            if (!account.isVerified) {
                // Display verification email alert
                setTimeout(() => {
                    const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
                    alertService.info(`
                        <h4>Verification Email</h4>
                        <p>Please click the below link to verify your email address:</p>
                        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                    `, { autoClose: false });
                }, 1000);
        
                return error('Email is not yet verified');
            }
        
            if (account.password !== password) {
                return error('Incorrect password');
            }
        
            if (account.status !== 'Active') {
                return error('Account is inactive. Please contact support.');
            }
        
            account.refreshTokens.push(generateRefreshToken());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
        
            return ok({
                ...basicDetails(account),
                jwtToken: generateJwtToken(account)
            });
        }

        function refreshToken() {
            const refreshToken = getRefreshToken();

            if (!refreshToken) return unauthorized();

            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));

            if (!account) return unauthorized();

            // replace old refresh token with a new one and save
            account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
            account.refreshTokens.push(generateRefreshToken());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok({
                ...basicDetails(account),
                jwtToken: generateJwtToken(account)
            });
        }

        function revokeToken() {
            if (!isAuthenticated()) return unauthorized();

            const refreshToken = getRefreshToken();
            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));

            // revoke token and save
            account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function register() {
            const account = body;

            if (accounts.find(x => x.email === account.email)) {
                // display email already registered message in alert
                setTimeout(() => {
                    alertService.info(`
                        <h4>Email Already Registered</h4>
                        <p>Your email ${account.email} is already registered.</p>
                        <p>If you don't know your password please visit the <a href="${location.origin}/account/forgot-password">forgot password</a> page.</p>
                        <div>
                        <strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an API. A real backend would send a real email.
                        </div>
                    `, { autoclose: false });
                }, 1000);

                // always return ok() response to prevent email enumeration
                return ok();
            }

            // assign account id and a few other properties then save
            account.id = newAccountId();
            if (account.id === 1) {
                // first registered account is an admin
                account.role = Role.Admin;
                account.status = 'Active'; // Admin accounts get active status
            } else {
                account.role = Role.User;
                account.status = 'Inactive'; // User accounts get inacitve status upon creation
            }
            account.dateCreated = new Date().toISOString();
            account.verificationToken = new Date().getTime().toString();
            account.isVerified = false;
            account.refreshTokens = [];
            delete account.confirmPassword;
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            // display verification email in alert
            setTimeout(() => {
                const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
                alertService.info(`
                    <h4>Verification Email</h4>
                    <p>Thanks for registering!</p>
                    <p>Please click the below link to verify your email address:</p>
                    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                    <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an API. A real backend would send a real email.</div>
                `, { autoclose: false });
            }, 1000);

            return ok();
        }

        function verifyEmail() {
            const { token } = body;
            const account = accounts.find(x => !!x.verificationToken && x.verificationToken === token);

            if (!account) return error('Verification failed');

            // set is verified flag to true if token is valid
            account.isVerified = true;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function forgotPassword() {
            const { email } = body;
            const account = accounts.find(x => x.email === email);

            // always return ok() response to prevent email enumeration
            if (!account) return ok();

            // create reset token that expires after 24 hours
            account.resetToken = new Date().getTime().toString();
            account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            // display password reset email in alert
            setTimeout(() => {
                const resetUrl = `${location.origin}/account/reset-password?token=${account.resetToken}`;
                alertService.info(`
                    <h4>Reset Password Email</h4>
                    <p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an API. A real backend would send a real email.</div>
                `, { autoClose: false });
            }, 1000);

            return ok();
        }

        function validateResetToken() {
            const { token } = body;
            const account = accounts.find(x =>
                !!x.resetToken &&
                x.resetToken === token &&
                new Date() < new Date(x.resetTokenExpires)
            );

            if (!account) return error("Invalid token");

            return ok();
        }

        function resetPassword() {
            const { token, password } = body;
            const account = accounts.find(x =>
                !!x.resetToken && x.resetToken === token &&
                new Date() < new Date(x.resetTokenExpires)
            );

            if (!account) return error('Invalid token');

            // update password and remove reset token
            account.password = password;
            account.isVerified = true;
            delete account.resetToken;
            delete account.resetTokenExpires;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function getAccounts() {
            if (!isAuthenticated()) return unauthorized();
            return ok(accounts.map(x => basicDetails(x)));
        }

        function getAccountById() {
            if (!isAuthenticated()) return unauthorized();

            let account = accounts.find(x => x.id === idFromUrl());

            // user accounts can get own profile and admin accounts can get all profiles
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            return ok(basicDetails(account));
        }

        function createAccount() {
            if (!isAuthorized(Role.Admin)) return unauthorized();

            const account = body;
            if (accounts.find(x => x.email === account.email)) {
                return error(`Email ${account.email} is already registered`);
            }

            // assign account id and a few other properties then save
            account.id = newAccountId();
            account.status = 'Inactive';
            account.dateCreated = new Date().toISOString();
            account.isVerified = true;
            account.refreshTokens = [];
            delete account.confirmPassword;
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function updateAccount() {
            if (!isAuthenticated()) return unauthorized();

            let params = body;
            let account = accounts.find(x => x.id == idFromUrl());

            // user accounts can update own profile and admin accounts can update all profiles
            if (account.id != currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            // only update password if included
            if (!params.password) {
                delete params.password;
            }

            // update and save account
            Object.assign(account, params);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        // Employee route functions
        function getEmployees() {
            // Map employees with account and department information
            const enrichedEmployees = employees.map(employee => {
                // Get user account details
                const user = accounts.find(a => a.id === employee.userId);
                
                // Get department details
                const department = departments.find(d => d.id === employee.departmentId);
                
                // Create a response with the related details
                return {
                    ...employee,
                    User: user ? {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        firstName: user.firstName,
                        lastName: user.lastName
                    } : null,
                    Department: department ? {
                        id: department.id,
                        name: department.name
                    } : null
                };
            });
            
            return ok(enrichedEmployees);
        }

        function createEmployee() {
            // Generate employee ID in format 'EMP' + padded number if not provided
            let employeeId = body.employeeId;
            if (!employeeId || !employeeId.trim()) {
                const nextId = employees.length + 1;
                employeeId = 'EMP' + nextId.toString().padStart(3, '0');
            }
            
            // Verify the userId exists in accounts
            const userId = parseInt(body.userId);
            if (isNaN(userId)) {
                return error('Please select a valid user');
            }
            
            const userExists = accounts.some(a => a.id === userId);
            if (!userExists) {
                return error('User not found');
            }
            
            // Verify the departmentId exists
            const departmentId = parseInt(body.departmentId);
            if (isNaN(departmentId)) {
                return error('Please select a valid department');
            }
            
            const department = departments.find(d => d.id === departmentId);
            if (!department) {
                return error('Department not found');
            }
            
            // Create the employee with auto-generated ID
            const nextId = employees.length + 1;
            const employee = { 
                id: nextId, 
                employeeId: employeeId, 
                userId: userId,
                departmentId: departmentId,
                position: body.position || '',
                hireDate: body.hireDate || new Date().toISOString().split('T')[0],
                status: body.status || 'Active'
            };
            
            // Add to employees array
            employees.push(employee);
            
            // Update department employee count
            department.employeeCount++;
            
            // Create onboarding workflow
            workflows.push({
                id: workflows.length + 1,
                employeeId: nextId,
                type: 'Onboarding',
                details: 'Task: Setup workstation',
                status: 'Pending'
            });
            
            return ok(employee);
        }

        function getEmployeeById() {
            const id = parseInt(path.split('/').pop()!);
            const employee = employees.find(e => e.id === id);
            if (!employee) return error('Employee not found');
            return ok(employee);
        }
        
        function getEmployeeWithDetails() {
            const id = parseInt(path.split('/').pop().split('/')[0]);
            const employee = employees.find(e => e.id === id);
            
            if (!employee) return error('Employee not found');
            
            // Get user account details
            const user = accounts.find(a => a.id === employee.userId);
            
            // Get department details
            const department = departments.find(d => d.id === employee.departmentId);
            
            // Create a response with the related details
            const response = {
                ...employee,
                User: user ? {
                    id: user.id,
                    email: user.email,
                    role: user.role
                } : null,
                Department: department ? {
                    id: department.id,
                    name: department.name
                } : null
            };
            
            return ok(response);
        }

        function updateEmployee() {
            const id = parseInt(path.split('/').pop()!);
            const employeeIndex = employees.findIndex(e => e.id === id);
            
            if (employeeIndex === -1) return error('Employee not found');
            
            // Parse values to ensure they're numbers
            let userId = body.userId;
            if (userId && typeof userId === 'string') {
                userId = parseInt(userId);
            }
            
            let departmentId = body.departmentId;
            if (departmentId && typeof departmentId === 'string') {
                departmentId = parseInt(departmentId);
            }
            
            // Check if user exists if userId is being updated
            if (userId) {
                const userExists = accounts.some(a => a.id === userId);
                if (!userExists) {
                    return error('User not found');
                }
            }
            
            // Check if department exists if departmentId is being updated
            if (departmentId && departmentId !== employees[employeeIndex].departmentId) {
                const oldDepartmentId = employees[employeeIndex].departmentId;
                
                const oldDepartment = departments.find(d => d.id === oldDepartmentId);
                const newDepartment = departments.find(d => d.id === departmentId);
                
                if (!newDepartment) {
                    return error('Department not found');
                }
                
                // Update department employee counts
                if (oldDepartment) oldDepartment.employeeCount--;
                newDepartment.employeeCount++;
            }
            
            // Keep the employeeId unchanged
            const employeeId = employees[employeeIndex].employeeId;
            
            // Create updated employee object with parsed values
            const updatedEmployee = {
                id,
                employeeId,
                userId: userId || employees[employeeIndex].userId,
                departmentId: departmentId || employees[employeeIndex].departmentId,
                position: body.position || employees[employeeIndex].position,
                hireDate: body.hireDate || employees[employeeIndex].hireDate,
                status: body.status || employees[employeeIndex].status
            };
            
            // Update the employee
            employees[employeeIndex] = updatedEmployee;
            
            return ok(updatedEmployee);
        }

        function transferEmployee() {
            const id = parseInt(path.split('/')[2]);
            const employee = employees.find(e => e.id === id);
            if (!employee) return error('Employee not found');
            
            // Get department information
            const oldDepartmentId = employee.departmentId;
            const newDepartmentId = body.departmentId;
            const oldDepartment = departments.find(d => d.id === oldDepartmentId);
            const newDepartment = departments.find(d => d.id === newDepartmentId);
            
            // Update employee's department
            employee.departmentId = newDepartmentId;
            
            // Update department counts
            if (oldDepartment) oldDepartment.employeeCount--;
            if (newDepartment) newDepartment.employeeCount++;
            
            // Create transfer workflow
            workflows.push({
                id: workflows.length + 1,
                employeeId: id,
                type: 'Department Transfer',
                details: `Employee transferred from ${oldDepartment?.name || 'Unknown'} to ${newDepartment?.name || 'Unknown'}.`,
                status: 'Pending'
            });
            
            return ok({ message: `Department transfer workflow created for employee ${employee.employeeId}.` });
        }

        // Department route functions
        function getDepartments() {
            return ok(departments);
        }

        function getDepartmentById() {
            const id = parseInt(path.split('/').pop()!);
            const department = departments.find(d => d.id === id);
            
            if (!department) return error('Department not found');
            
            return ok(department);
        }

        function createDepartment() {
            // Check if department with same name already exists
            if (departments.some(d => d.name.toLowerCase() === body.name.toLowerCase())) {
                return error('Department with this name already exists');
            }
            
            // Create department with initial employee count of 0
            const department = { 
                id: departments.length + 1, 
                name: body.name,
                description: body.description,
                employeeCount: 0 
            };
            
            departments.push(department);
            return ok(department);
        }

        function updateDepartment() {
            const id = parseInt(path.split('/').pop()!);
            const deptIndex = departments.findIndex(d => d.id === id);
            
            if (deptIndex === -1) return error('Department not found');
            
            // Check if name is being changed and if it already exists
            if (body.name && body.name !== departments[deptIndex].name) {
                if (departments.some(d => d.id !== id && d.name.toLowerCase() === body.name.toLowerCase())) {
                    return error('Department with this name already exists');
                }
            }
            
            // Update department
            departments[deptIndex] = {
                ...departments[deptIndex],
                name: body.name || departments[deptIndex].name,
                description: body.description || departments[deptIndex].description
            };
            
            return ok(departments[deptIndex]);
        }

        // Workflow route functions
        function getEmployeeWorkflows() {
            const employeeId = parseInt(path.split('/').pop()!);
            return ok(workflows.filter(w => w.employeeId === employeeId));
        }

        function getAllWorkflows() {
            return ok(workflows);
        }

        function createWorkflow() {
            const workflow = { id: workflows.length + 1, ...body };
            workflows.push(workflow);
            return ok(workflow);
        }

        function updateWorkflow() {
            // Handle both direct update and status update endpoints
            let id;
            if (path.includes('/workflows/') && path.includes('/status')) {
                // Extract ID from paths like /workflows/123/status
                id = parseInt(path.split('/')[2]);
            } else {
                // Standard path like /workflows/123
                id = parseInt(path.split('/').pop()!);
            }
            
            const workflowIndex = workflows.findIndex(w => w.id === id);
            
            if (workflowIndex === -1) return error('Workflow not found');
            
            // Store previous status
            const oldStatus = workflows[workflowIndex].status;
            const oldWorkflow = { ...workflows[workflowIndex] };
            
            // Check if this is an update that includes a direct request for updating request status too
            const updateRequestFlag = body.updateRequest === true;
            let providedRequestId = body.requestId ? parseInt(body.requestId) : null;
            
            // Create a new version of the body without the special properties
            const workflowUpdateBody: any = {...body};
            delete workflowUpdateBody.updateRequest;
            delete workflowUpdateBody.requestId;
            
            // Update workflow with clean data
            workflows[workflowIndex] = {
                ...workflows[workflowIndex],
                ...workflowUpdateBody,
                id // preserve id
            };
            
            // If direct request flag was provided, prioritize using the provided requestId
            if (updateRequestFlag && providedRequestId) {
                console.log('Direct request to update request ID:', providedRequestId);
                const requestIndex = requests.findIndex(r => r.id === providedRequestId);
                
                if (requestIndex !== -1) {
                    // Update request status based on workflow status
                    if (body.status === 'Approved') {
                        requests[requestIndex].status = 'Approved';
                        console.log('Updated request status to Approved');
                    } else if (body.status === 'Rejected') {
                        requests[requestIndex].status = 'Rejected';
                        console.log('Updated request status to Rejected');
                    } else if (body.status === 'Pending') {
                        requests[requestIndex].status = 'Pending';
                        console.log('Updated request status to Pending');
                    }
                } else {
                    console.log('Request not found with ID:', providedRequestId);
                }
            }
            // Otherwise, try to extract requestId from workflow details (for backward compatibility)
            else if ((workflows[workflowIndex].type === 'Request Approval' || 
                 workflows[workflowIndex].type === 'RequestApproval' ||
                 workflows[workflowIndex].type.includes('Request')) && 
                body.status && 
                body.status !== oldStatus) {
                
                // Try to extract requestId from details field
                const detailsText = workflows[workflowIndex].details || '';
                console.log('Workflow details text:', detailsText);
                
                // Extract requestId - first try to parse as JSON
                let requestId = null;
                try {
                    // Try to parse details as JSON
                    if (typeof detailsText === 'string') {
                        if (detailsText.trim().startsWith('{')) {
                            const detailsObj = JSON.parse(detailsText);
                            if (detailsObj.requestId) {
                                requestId = parseInt(detailsObj.requestId.toString());
                                console.log('Extracted requestId from JSON:', requestId);
                            }
                        }
                    } else if (typeof detailsText === 'object') {
                        // It's already an object
                        const detailsObj = detailsText as any;
                        if (detailsObj && detailsObj.requestId) {
                            requestId = parseInt(detailsObj.requestId.toString());
                            console.log('Extracted requestId from object:', requestId);
                        }
                    }
                } catch (e) {
                    console.log('Failed to parse details as JSON:', e);
                }
                
                // If JSON parsing failed, try regex patterns
                if (!requestId && typeof detailsText === 'string') {
                    // Try matching standard format with HTML bold tags
                    const boldMatch = detailsText.match(/<b>requestId:<\/b>\s*(\d+)/i);
                    if (boldMatch && boldMatch[1]) {
                        requestId = parseInt(boldMatch[1]);
                    }
                    
                    // Try matching without HTML tags
                    if (!requestId) {
                        const plainMatch = detailsText.match(/requestId:\s*(\d+)/i);
                        if (plainMatch && plainMatch[1]) {
                            requestId = parseInt(plainMatch[1]);
                        }
                    }
                    
                    // Try extracting from any #NUMBER pattern if nothing else worked
                    if (!requestId) {
                        const hashMatch = detailsText.match(/request\s+#(\d+)/i);
                        if (hashMatch && hashMatch[1]) {
                            requestId = parseInt(hashMatch[1]);
                        }
                    }
                }
                
                console.log('Final extracted requestId:', requestId);
                
                if (requestId) {
                    const requestIndex = requests.findIndex(r => r.id === requestId);
                    
                    if (requestIndex !== -1) {
                        console.log('Found request at index:', requestIndex);
                        // Update request status based on workflow status
                        if (body.status === 'Approved') {
                            requests[requestIndex].status = 'Approved';
                            console.log('Updated request status to Approved');
                        } else if (body.status === 'Rejected') {
                            requests[requestIndex].status = 'Rejected';
                            console.log('Updated request status to Rejected');
                        } else if (body.status === 'Pending') {
                            requests[requestIndex].status = 'Pending';
                            console.log('Updated request status to Pending');
                        }
                    } else {
                        console.log('Request not found with ID:', requestId);
                    }
                } else {
                    console.log('Could not extract requestId from details:', detailsText);
                }
            }
            
            return ok(workflows[workflowIndex]);
        }

        // Request route functions
        function getRequests() {
            // Get all requests with employee details
            const allRequests = requests.map(request => {
                // Find employee
                const employee = employees.find(e => e.id === request.employeeId);
                
                // Find user information if employee exists
                let userEmail = 'Unknown';
                let userRole = 'Unknown';
                let user = null;
                
                if (employee && employee.userId) {
                    user = accounts.find(a => a.id === employee.userId);
                    if (user) {
                        userEmail = user.email;
                        userRole = user.role;
                    }
                }
                
                // Find department information if employee exists
                const department = employee?.departmentId ? 
                    departments.find(d => d.id === employee.departmentId) : null;
                
                // Return enhanced request with employee and user info
                // Ensure both items and requestItems properties exist for frontend compatibility
                const enhancedRequest: any = {
                    ...request,
                    Employee: employee ? { 
                        ...employee,
                        User: user ? {
                            id: user.id,
                            email: user.email,
                            role: user.role
                        } : null,
                        Department: department ? {
                            id: department.id,
                            name: department.name
                        } : null
                    } : null,
                    userEmail,
                    userRole
                };
                
                // Ensure both items and requestItems are available
                if (!enhancedRequest.items && enhancedRequest.requestItems) {
                    enhancedRequest.items = [...enhancedRequest.requestItems];
                } else if (!enhancedRequest.requestItems && enhancedRequest.items) {
                    enhancedRequest.requestItems = [...enhancedRequest.items];
                } else if (!enhancedRequest.items && !enhancedRequest.requestItems) {
                    // Initialize empty arrays for both if neither exists
                    enhancedRequest.items = [];
                    enhancedRequest.requestItems = [];
                }
                
                return enhancedRequest;
            });
            
            return ok(allRequests);
        }

        function getRequestById() {
            const id = parseInt(path.split('/').pop()!);
            const request = requests.find(r => r.id === id);
            
            if (!request) return error('Request not found');
            
            // Find employee
            const employee = employees.find(e => e.id === request.employeeId);
            
            // Find user information if employee exists
            let userEmail = 'Unknown';
            let userRole = 'Unknown';
            let user = null;
            
            if (employee && employee.userId) {
                user = accounts.find(a => a.id === employee.userId);
                if (user) {
                    userEmail = user.email;
                    userRole = user.role;
                }
            }
            
            // Return request with user and employee info
            const enhancedRequest: any = {
                ...request,
                employee: employee ? { 
                    id: employee.id, 
                    employeeId: employee.employeeId 
                } : null,
                Employee: employee ? { 
                    ...employee,
                    User: user ? {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    } : null
                } : null,
                userEmail,
                userRole
            };
            
            // Ensure both items and requestItems are available
            if (!enhancedRequest.items && enhancedRequest.requestItems) {
                enhancedRequest.items = [...enhancedRequest.requestItems];
            } else if (!enhancedRequest.requestItems && enhancedRequest.items) {
                enhancedRequest.requestItems = [...enhancedRequest.items];
            } else if (!enhancedRequest.items && !enhancedRequest.requestItems) {
                // Initialize empty arrays for both if neither exists
                enhancedRequest.items = [];
                enhancedRequest.requestItems = [];
            }
            
            return ok(enhancedRequest);
        }

        function getRequestsByEmployeeId() {
            const employeeIdParam = new URL(url).searchParams.get('employeeId');
            if (!employeeIdParam) return error('Employee ID is required');
            
            const employeeId = parseInt(employeeIdParam);
            if (isNaN(employeeId)) return error('Invalid employee ID');
            
            // Check if employee exists
            const employee = employees.find(e => e.id === employeeId);
            if (!employee) return error('Employee not found');
            
            // Get user information
            const user = accounts.find(a => a.id === employee.userId);
            let userEmail = 'Unknown';
            let userRole = 'Unknown';
            
            if (user) {
                userEmail = user.email;
                userRole = user.role;
            }
            
            // Get department information
            const department = departments.find(d => d.id === employee.departmentId);
            
            // Filter requests by employee ID
            const filteredRequests = requests.filter(r => r.employeeId === employeeId).map(request => {
                const enhancedRequest: any = {
                    ...request,
                    Employee: { 
                        ...employee,
                        User: user ? {
                            id: user.id,
                            email: user.email,
                            role: user.role
                        } : null,
                        Department: department ? {
                            id: department.id,
                            name: department.name
                        } : null
                    },
                    userEmail,
                    userRole
                };
                
                // Ensure both items and requestItems are available
                if (!enhancedRequest.items && enhancedRequest.requestItems) {
                    enhancedRequest.items = [...enhancedRequest.requestItems];
                } else if (!enhancedRequest.requestItems && enhancedRequest.items) {
                    enhancedRequest.requestItems = [...enhancedRequest.items];
                } else if (!enhancedRequest.items && !enhancedRequest.requestItems) {
                    // Initialize empty arrays for both if neither exists
                    enhancedRequest.items = [];
                    enhancedRequest.requestItems = [];
                }
                
                return enhancedRequest;
            });
            
            return ok(filteredRequests);
        }

        function createRequest() {
            const account = currentAccount();
            if (!account) return unauthorized();
            
            // Use employeeId from body if provided (for admin users)
            // Otherwise, find employee associated with current user
            let employeeId;
            if (body.employeeId && account.role === Role.Admin) {
                // Admin users can create requests for any employee
                employeeId = parseInt(body.employeeId);
                
                // Verify that the employee exists
                const employeeExists = employees.some(e => e.id === employeeId);
                if (!employeeExists) {
                    return error('Selected employee not found');
                }
            } else {
                // Regular users can only create requests for themselves
                const employee = employees.find(e => e.userId === account.id);
                if (!employee) {
                    return error('No employee record found for current user');
                }
                employeeId = employee.id;
            }
            
            // Find employee record for the request
            const employee = employees.find(e => e.id === employeeId);
            
            // Process items from either items or requestItems property
            const requestItems = [];
            if (body.items && Array.isArray(body.items)) {
                body.items.forEach(item => {
                    requestItems.push({
                        name: item.name,
                        quantity: item.quantity || 1
                    });
                });
            } else if (body.requestItems && Array.isArray(body.requestItems)) {
                body.requestItems.forEach(item => {
                    requestItems.push({
                        name: item.name,
                        quantity: item.quantity || 1
                    });
                });
            }
            
            // Create request with proper structure
            const request: any = { 
                id: requests.length + 1,
                employeeId: employeeId,
                type: body.type || 'Equipment',
                status: 'Pending',
                items: [...requestItems],     // For backwards compatibility
                requestItems: [...requestItems]  // For newer frontend implementations
            };
            
            console.log('Creating new request:', request);
            requests.push(request);
            
            // Create workflow entry for request approval
            workflows.push({
                id: workflows.length + 1,
                employeeId: employeeId,
                type: 'Request Approval',
                details: JSON.stringify({
                    requestId: request.id,
                    requestType: request.type,
                    requesterId: employeeId,
                    message: `Review ${request.type} request #${request.id} from Employee ID ${employee.employeeId}.`
                }),
                status: 'Pending'
            });
            
            return ok(request);
        }

        function updateRequest() {
            const id = parseInt(path.split('/').pop()!);
            const reqIndex = requests.findIndex(r => r.id === id);
            
            if (reqIndex === -1) return error('Request not found');
            
            // Log incoming request update
            console.log('Updating request:', id, 'with data:', body);
            
            // Preserve the employeeId
            const employeeId = requests[reqIndex].employeeId;
            const oldStatus = requests[reqIndex].status;
            
            // Process items from either items or requestItems property
            const requestItems = [];
            if (body.items && Array.isArray(body.items)) {
                body.items.forEach(item => {
                    requestItems.push({
                        name: item.name,
                        quantity: item.quantity || 1
                    });
                });
            } else if (body.requestItems && Array.isArray(body.requestItems)) {
                body.requestItems.forEach(item => {
                    requestItems.push({
                        name: item.name,
                        quantity: item.quantity || 1
                    });
                });
            } else {
                // If no items provided, keep existing ones
                requestItems.push(...(requests[reqIndex].requestItems || []));
            }
            
            // Update the request - prioritize any provided fields or keep the existing values
            (requests[reqIndex] as any) = { 
                id,
                employeeId,
                type: body.type || requests[reqIndex].type,
                status: body.status || requests[reqIndex].status,
                items: [...requestItems],     // For backwards compatibility
                requestItems: [...requestItems]  // For newer frontend implementations
            };
            
            console.log('Request updated:', requests[reqIndex]);
            
            // Find employee info for the workflow
            const employee = employees.find(e => e.id === employeeId);
            if (!employee) return error('Employee not found');
            
            // Create workflow entry if status changed
            if (body.status && body.status !== oldStatus) {
                workflows.push({
                    id: workflows.length + 1,
                    employeeId: employeeId,
                    type: 'Request Status Updated',
                    details: JSON.stringify({
                        requestId: id,
                        requestType: requests[reqIndex].type,
                        requesterId: employeeId,
                        message: `${requests[reqIndex].type} request #${id} from Employee ID ${employee.employeeId} was ${body.status.toLowerCase()}.`
                    }),
                    status: 'Completed'
                });
            } 
            // Create workflow for request edits if items changed
            else if (body.items || body.requestItems) {
                workflows.push({
                    id: workflows.length + 1,
                    employeeId: employeeId,
                    type: 'Request Approval',
                    details: JSON.stringify({
                        requestId: id,
                        requestType: requests[reqIndex].type,
                        requesterId: employeeId,
                        message: `Review updated ${requests[reqIndex].type} request #${id} from Employee ID ${employee.employeeId}.`
                    }),
                    status: 'Pending'
                });
            }
            
            return ok(requests[reqIndex]);
        }

        function getNextEmployeeId() {
            console.log('Fake backend: Getting next employee ID');
            
            // Find the highest employee ID number
            let maxId = 0;
            employees.forEach(emp => {
                if (emp.employeeId && emp.employeeId.startsWith('EMP')) {
                    const idNum = parseInt(emp.employeeId.substring(3));
                    if (!isNaN(idNum) && idNum > maxId) {
                        maxId = idNum;
                    }
                }
            });
            
            // Generate the next ID (current max + 1)
            const nextId = maxId + 1;
            const nextEmployeeId = 'EMP' + nextId.toString().padStart(3, '0');
            
            console.log('Fake backend generated next employee ID:', nextEmployeeId);
            return ok({ employeeId: nextEmployeeId });
        }

        // Helper functions
        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }));
        }

        function error(message) {
            return throwError(() => ({ error: { message } }));
        }

        function unauthorized() {
            return throwError(() => ({ status: 401, error: { message: 'Unauthorized' } }));
        }

        function forbidden() {
            return throwError(() => ({ status: 403, error: { message: 'Forbidden' } }));
        }

        function basicDetails(account) {
            const { id, title, firstName, lastName, email, role, dateCreated, isVerified, status } = account;
            return { id, title, firstName, lastName, email, role, dateCreated, isVerified, status };
        }

        function isAuthenticated() {
            return !!currentAccount();
        }

        function isAuthorized(role) {
            const account = currentAccount();
            if (!account) return false;
            return account.role === role;
        }

        function idFromUrl() {
            const urlParts = path.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }

        function newAccountId() {
            return accounts.length ? Math.max(...accounts.map(x => x.id)) + 1 : 1;
        }

        function currentAccount() {
            // check if jwt token is in auth header
            const authHeader = headers.get('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer fake-jwt-token')) return;

            // check if token is expired
            const jwtToken = JSON.parse(atob(authHeader.split('.')[1]));
            const tokenExpired = Date.now() > (jwtToken.exp * 1000);
            if (tokenExpired) return;

            const account = accounts.find(x => x.id === jwtToken.id);
            return account;
        }

        function generateJwtToken(account) {
            // create token that expires in 15 minutes
            const tokenPayload = {
                exp: Math.round(new Date(Date.now() + 15 * 60 * 1000).getTime() / 1000),
                id: account.id
            };
            return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
        }

        function generateRefreshToken() {
            const token = new Date().getTime().toString();

            // add token cookie that expires in 7 days
            const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = `fakeRefreshToken=${token}; expires=${expires}; path=/`;
            return token;
        }

        function getRefreshToken() {
            // get refresh token from cookie
            return (document.cookie.split(';').find(x => x.includes('fakeRefreshToken')) || '=').split('=')[1];
        }

        function authorize(requiredRole: Role | null, success: () => Observable<HttpEvent<any>>) {
            if (!isAuthenticated()) return unauthorized();
            if (requiredRole && !isAuthorized(requiredRole)) return forbidden();
            return success();
        }
    }
}

export const fakeBackendProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};