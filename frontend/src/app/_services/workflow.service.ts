import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, tap } from 'rxjs';

import { environment } from '@environments/environment';
import { Workflow } from '@app/_models/workflow';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Workflow[]>(`${environment.apiUrl}/workflows`);
    }

    getById(id: string) {
        return this.http.get<Workflow>(`${environment.apiUrl}/workflows/${id}`);
    }

    getByEmployeeId(employeeId: string) {
        return this.http.get<Workflow[]>(`${environment.apiUrl}/workflows/employee/${employeeId}`);
    }

    getByRequestId(requestId: string) {
        return this.http.get<Workflow[]>(`${environment.apiUrl}/workflows/request/${requestId}`);
    }

    create(workflow: any) {
        // Check if details is an object and stringify it before sending to the backend
        if (workflow && workflow.details && typeof workflow.details === 'object') {
            const workflowCopy = { ...workflow };
            workflowCopy.details = JSON.stringify(workflow.details);
            return this.http.post<Workflow>(`${environment.apiUrl}/workflows`, workflowCopy);
        }
        return this.http.post<Workflow>(`${environment.apiUrl}/workflows`, workflow);
    }

    update(id: string, params: any) {
        return this.http.put<Workflow>(`${environment.apiUrl}/workflows/${id}`, params);
    }

    changeStatus(id: string, status: string, comments: string = '') {
        return this.http.put<Workflow>(`${environment.apiUrl}/workflows/${id}/status`, { status, comments });
    }

    // New method to update both workflow and request status
    updateWorkflowAndRequestStatus(workflowId: string, status: string, requestId?: any, comments: string = '') {
        // Convert requestId to a number if it's a string
        let numericRequestId = null;
        if (requestId) {
            numericRequestId = typeof requestId === 'string' ? parseInt(requestId) : requestId;
        }
        
        // First determine if we're using the real backend or fake backend
        // Check if useFakeBackend property exists, default to false if not
        const useFakeBackend = (environment as any).useFakeBackend;
        const isRealBackend = useFakeBackend === undefined ? true : !useFakeBackend;
        
        if (isRealBackend) {
            // Real backend implementation - use the status endpoint which now handles the request update
            return this.http.put<Workflow>(`${environment.apiUrl}/workflows/${workflowId}/status`, { 
                status,
                comments,
                requestId: numericRequestId // Send requestId to help the backend find the related request
            });
        } else {
            // Fake backend implementation - use the special fields it understands
            return this.http.put<Workflow>(`${environment.apiUrl}/workflows/${workflowId}`, { 
                status,
                updateRequest: true, // Signal to fake backend to update request too
                requestId: numericRequestId // Include requestId if provided
            });
        }
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/workflows/${id}`);
    }

    deleteItem(itemId: string) {
        return this.http.delete(`${environment.apiUrl}/workflows/items/${itemId}`);
    }
}