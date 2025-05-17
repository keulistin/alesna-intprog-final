import { Account } from './account';

export class Employee {
    id?: string;
    employeeId: string;
    accountId: number;
    departmentId: string;
    departmentName?: string;
    position: string;
    hireDate: Date;
    salary?: number;
    status: string;
    created?: Date;
    updated?: Date;
    account?: Account;
} 