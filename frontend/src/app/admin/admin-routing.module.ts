import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubNavComponent } from './subnav.component';
import { LayoutComponent } from './layout.component'; // Main admin layout
import { OverviewComponent } from './overview.component';

const accountsModule = () => import('./accounts/accounts.module').then(x => x.AccountsModule);
const departmentsModule = () => import('../departments/departments.module').then(x => x.DepartmentsModule);
const employeesModule = () => import('../employees/employees.module').then(x => x.EmployeesModule);
const profileModule = () => import('../profile/profile.module').then(x => x.ProfileModule);
const requestsModule = () => import('../requests/requests.module').then(x => x.RequestsModule);
const workflowsModule = () => import('../workflows/workflows.module').then(x => x.WorkflowsModule);


const routes: Routes = [
    {
        path: '',
        component: SubNavComponent,
        outlet: 'subnav'
    },
    {
        path: '',
        component: LayoutComponent, // Main admin layout is applied here
        children: [
            { path: '', component: OverviewComponent },
            { path: 'accounts', loadChildren: accountsModule },
            { path: 'departments', loadChildren: departmentsModule }, // Lazy loads DepartmentsModule
            { path: 'employees', loadChildren: employeesModule },
            { path: 'profile', loadChildren: profileModule },
            { path: 'requests', loadChildren: requestsModule },
            { path: 'workflows', loadChildren: workflowsModule } // Corrected path from 'workflow' to 'workflows' if module is workflows.module
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }