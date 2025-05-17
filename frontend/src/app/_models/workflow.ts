import { Employee } from './employee';

export interface Workflow {
    isDeleting: boolean;
    isUpdating?: boolean;
    datetimecreated?: string;
    id?: string;
    employeeId: number;
    type: WorkflowType;
    details: WorkflowDetails;
    status: WorkflowStatus | string;
    employee?: Employee;
    createdDate?: Date;
    lastModifiedDate?: Date;
    requesterInfo?: string;
    originatingRequestId?: number;
}

export enum WorkflowType {
    LeaveRequest = 'Leave Request',
    EquipmentRequest = 'Equipment Request',
    DepartmentChange = 'Department Change',
    Other = 'Other',
    RequestApproval = "Request Approval"
}

export enum WorkflowStatus {
    Pending = 'Pending',
    ForReviewing = 'For Reviewing', // Or 'ForReview'
    Approved = 'Approved',
    Rejected = 'Rejected',
    Completed = 'Completed'
}

export interface WorkflowDetails {
    task: string;
    additionalInfo?: string;
}

export class WorkflowItem {
    id: string;
    name: string;
    quantity: number;
} 